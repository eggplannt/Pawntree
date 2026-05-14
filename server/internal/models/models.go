package models

import "time"

type User struct {
	ID            string    `json:"id"`
	Email         string    `json:"email"`
	DisplayName   *string   `json:"display_name"`
	OAuthProvider string    `json:"oauth_provider"`
	OAuthID       string    `json:"-"`
	CreatedAt     time.Time `json:"created_at"`
}
