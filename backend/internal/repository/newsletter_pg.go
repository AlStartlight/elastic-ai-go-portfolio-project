package repository

import (
	"context"
	"crypto/rand"
	"database/sql"
	"encoding/hex"
	"fmt"
	"time"

	"portfolio/internal/domain"

	"github.com/jmoiron/sqlx"
)

type newsletterPostgresRepository struct {
	db *sqlx.DB
}

func NewNewsletterPostgresRepository(db *sqlx.DB) domain.NewsletterRepository {
	return &newsletterPostgresRepository{
		db: db,
	}
}

func (r *newsletterPostgresRepository) Subscribe(ctx context.Context, email string) error {
	// Generate unsubscribe token
	token, err := r.generateToken()
	if err != nil {
		return fmt.Errorf("failed to generate token: %w", err)
	}

	query := `
		INSERT INTO newsletter_subscriptions (email, subscribed_at, active, token)
		VALUES ($1, $2, $3, $4)
		ON CONFLICT (email) DO UPDATE SET
			active = $3,
			subscribed_at = $2,
			token = $4`

	_, err = r.db.ExecContext(ctx, query, email, time.Now(), true, token)
	if err != nil {
		return fmt.Errorf("failed to subscribe email: %w", err)
	}

	return nil
}

func (r *newsletterPostgresRepository) Unsubscribe(ctx context.Context, email, token string) error {
	query := `
		UPDATE newsletter_subscriptions 
		SET active = false 
		WHERE email = $1 AND token = $2`

	result, err := r.db.ExecContext(ctx, query, email, token)
	if err != nil {
		return fmt.Errorf("failed to unsubscribe: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to check affected rows: %w", err)
	}

	if rowsAffected == 0 {
		return domain.ErrInvalidUnsubscribeToken
	}

	return nil
}

func (r *newsletterPostgresRepository) IsSubscribed(ctx context.Context, email string) (bool, error) {
	query := `SELECT active FROM newsletter_subscriptions WHERE email = $1`

	var active bool
	err := r.db.GetContext(ctx, &active, query, email)
	if err != nil {
		if err == sql.ErrNoRows {
			return false, nil
		}
		return false, fmt.Errorf("failed to check subscription: %w", err)
	}

	return active, nil
}

func (r *newsletterPostgresRepository) GetSubscribers(ctx context.Context) ([]*domain.Newsletter, error) {
	query := `
		SELECT email, subscribed_at, active, token
		FROM newsletter_subscriptions 
		WHERE active = true 
		ORDER BY subscribed_at DESC`

	var subscribers []*domain.Newsletter
	err := r.db.SelectContext(ctx, &subscribers, query)
	if err != nil {
		return nil, fmt.Errorf("failed to get subscribers: %w", err)
	}

	return subscribers, nil
}

func (r *newsletterPostgresRepository) generateToken() (string, error) {
	bytes := make([]byte, 32)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}
