package db

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/pawntree/server/internal/models"
)

func UpsertUser(ctx context.Context, pool *pgxpool.Pool, provider, oauthID, email, displayName string) (*models.User, error) {
	user := &models.User{}
	var name *string
	if displayName != "" {
		name = &displayName
	}

	err := pool.QueryRow(ctx, `
		INSERT INTO users (email, display_name, oauth_provider, oauth_id)
		VALUES ($1, $2, $3, $4)
		ON CONFLICT (oauth_provider, oauth_id) DO UPDATE
		  SET email        = EXCLUDED.email,
		      display_name = COALESCE(EXCLUDED.display_name, users.display_name)
		RETURNING id, email, display_name, oauth_provider, created_at
	`, email, name, provider, oauthID).Scan(
		&user.ID, &user.Email, &user.DisplayName, &user.OAuthProvider, &user.CreatedAt,
	)
	if err != nil {
		return nil, err
	}
	return user, nil
}

func GetUserByID(ctx context.Context, pool *pgxpool.Pool, id string) (*models.User, error) {
	user := &models.User{}
	err := pool.QueryRow(ctx, `
		SELECT id, email, display_name, oauth_provider, created_at
		FROM users WHERE id = $1
	`, id).Scan(&user.ID, &user.Email, &user.DisplayName, &user.OAuthProvider, &user.CreatedAt)
	if err != nil {
		return nil, err
	}
	return user, nil
}
