package usecase

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"regexp"
	"time"

	"portfolio/internal/domain"
)

type newsletterUsecase struct {
	newsletterRepo domain.NewsletterRepository
	timeout        time.Duration
}

func NewNewsletterUsecase(newsletterRepo domain.NewsletterRepository, timeout time.Duration) domain.NewsletterUsecase {
	return &newsletterUsecase{
		newsletterRepo: newsletterRepo,
		timeout:        timeout,
	}
}

func (n *newsletterUsecase) Subscribe(ctx context.Context, email string) error {
	ctx, cancel := context.WithTimeout(ctx, n.timeout)
	defer cancel()

	// Validate email format
	if !isValidEmail(email) {
		return fmt.Errorf("invalid email format")
	}

	// Check if already subscribed
	subscribed, err := n.newsletterRepo.IsSubscribed(ctx, email)
	if err != nil {
		return fmt.Errorf("failed to check subscription status: %w", err)
	}

	if subscribed {
		return domain.ErrEmailAlreadySubscribed
	}

	// Subscribe
	err = n.newsletterRepo.Subscribe(ctx, email)
	if err != nil {
		return fmt.Errorf("failed to subscribe: %w", err)
	}

	// TODO: Send confirmation email
	// go n.sendConfirmationEmail(email)

	return nil
}

func (n *newsletterUsecase) Unsubscribe(ctx context.Context, email, token string) error {
	ctx, cancel := context.WithTimeout(ctx, n.timeout)
	defer cancel()

	// Validate email format
	if !isValidEmail(email) {
		return fmt.Errorf("invalid email format")
	}

	// Unsubscribe
	err := n.newsletterRepo.Unsubscribe(ctx, email, token)
	if err != nil {
		return fmt.Errorf("failed to unsubscribe: %w", err)
	}

	return nil
}

func (n *newsletterUsecase) GetSubscribers(ctx context.Context) ([]*domain.Newsletter, error) {
	ctx, cancel := context.WithTimeout(ctx, n.timeout)
	defer cancel()

	return n.newsletterRepo.GetSubscribers(ctx)
}

// Helper functions

func isValidEmail(email string) bool {
	emailRegex := regexp.MustCompile(`^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$`)
	return emailRegex.MatchString(email)
}

func generateToken() (string, error) {
	bytes := make([]byte, 32)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}

// TODO: Implement email sending functionality
// func (n *newsletterUsecase) sendConfirmationEmail(email string) error {
// 	// Implement email sending logic here
// 	// You can use services like SendGrid, AWS SES, etc.
// 	return nil
// }
