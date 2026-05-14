package handlers

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"net/http"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/pawntree/server/internal/auth"
	"github.com/pawntree/server/internal/db"
	"github.com/pawntree/server/internal/middleware"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

type AuthHandler struct {
	pool        *pgxpool.Pool
	oauthConfig *oauth2.Config
}

func NewAuthHandler(pool *pgxpool.Pool) *AuthHandler {
	cfg := &oauth2.Config{
		ClientID:     os.Getenv("GOOGLE_CLIENT_ID"),
		ClientSecret: os.Getenv("GOOGLE_CLIENT_SECRET"),
		RedirectURL:  os.Getenv("APP_URL") + "/api/auth/google/callback",
		Scopes:       []string{"openid", "email", "profile"},
		Endpoint:     google.Endpoint,
	}
	return &AuthHandler{pool: pool, oauthConfig: cfg}
}

func (h *AuthHandler) GoogleLogin(w http.ResponseWriter, r *http.Request) {
	state, err := generateState()
	if err != nil {
		http.Error(w, "internal error", http.StatusInternalServerError)
		return
	}

	// Encode platform in state so callback knows where to redirect
	platform := r.URL.Query().Get("platform") // "native" or ""
	stateVal := state
	if platform == "native" {
		stateVal = "native:" + state
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "oauth_state",
		Value:    stateVal,
		HttpOnly: true,
		Secure:   os.Getenv("ENV") != "development",
		SameSite: http.SameSiteLaxMode,
		MaxAge:   600,
		Path:     "/",
	})

	url := h.oauthConfig.AuthCodeURL(stateVal, oauth2.AccessTypeOnline)
	http.Redirect(w, r, url, http.StatusTemporaryRedirect)
}

func (h *AuthHandler) GoogleCallback(w http.ResponseWriter, r *http.Request) {
	stateCookie, err := r.Cookie("oauth_state")
	if err != nil || stateCookie.Value != r.URL.Query().Get("state") {
		http.Error(w, "invalid state", http.StatusBadRequest)
		return
	}

	// Clear state cookie
	http.SetCookie(w, &http.Cookie{
		Name:   "oauth_state",
		Value:  "",
		MaxAge: -1,
		Path:   "/",
	})

	isNative := len(stateCookie.Value) > 7 && stateCookie.Value[:7] == "native:"

	code := r.URL.Query().Get("code")
	token, err := h.oauthConfig.Exchange(context.Background(), code)
	if err != nil {
		http.Error(w, "failed to exchange token", http.StatusInternalServerError)
		return
	}

	userInfo, err := fetchGoogleUser(token.AccessToken)
	if err != nil {
		http.Error(w, "failed to get user info", http.StatusInternalServerError)
		return
	}

	user, err := db.UpsertUser(r.Context(), h.pool, "google", userInfo.ID, userInfo.Email, userInfo.Name)
	if err != nil {
		http.Error(w, "database error", http.StatusInternalServerError)
		return
	}

	jwt, err := auth.IssueToken(user.ID)
	if err != nil {
		http.Error(w, "token error", http.StatusInternalServerError)
		return
	}

	frontendURL := os.Getenv("FRONTEND_URL")
	if frontendURL == "" {
		frontendURL = "http://localhost:8081"
	}

	if isNative {
		http.Redirect(w, r, "pawntree://auth/callback?token="+jwt, http.StatusTemporaryRedirect)
		return
	}

	// Web: pass token in redirect URL; frontend stores it in memory/sessionStorage.
	// In production both are on the same domain so an httpOnly cookie could be used
	// instead, but the token-in-URL approach works across dev origins too.
	http.Redirect(w, r, frontendURL+"/auth/callback?token="+jwt, http.StatusTemporaryRedirect)
}

func (h *AuthHandler) Me(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.UserIDFromContext(r.Context())
	if !ok {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	user, err := db.GetUserByID(r.Context(), h.pool, userID)
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}

func (h *AuthHandler) Logout(w http.ResponseWriter, r *http.Request) {
	http.SetCookie(w, &http.Cookie{
		Name:   "pawntree_token",
		Value:  "",
		MaxAge: -1,
		Path:   "/",
	})
	w.WriteHeader(http.StatusNoContent)
}

// ---- helpers ----

type googleUserInfo struct {
	ID    string `json:"id"`
	Email string `json:"email"`
	Name  string `json:"name"`
}

func fetchGoogleUser(accessToken string) (*googleUserInfo, error) {
	resp, err := http.Get(fmt.Sprintf("https://www.googleapis.com/oauth2/v2/userinfo?access_token=%s", accessToken))
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var info googleUserInfo
	if err := json.NewDecoder(resp.Body).Decode(&info); err != nil {
		return nil, err
	}
	return &info, nil
}

func generateState() (string, error) {
	b := make([]byte, 16)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return base64.URLEncoding.EncodeToString(b), nil
}
