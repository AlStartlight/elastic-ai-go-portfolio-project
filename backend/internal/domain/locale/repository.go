package locale

import (
	"context"
)

// Repository interface defines the contract for locale data operations
type Repository interface {
	// GetTranslation retrieves translations for a specific language
	GetTranslation(ctx context.Context, language string) (*Translation, error)
	
	// GetSupportedLanguages retrieves all supported languages
	GetSupportedLanguages(ctx context.Context) ([]SupportedLanguage, error)
	
	// SetTranslation sets a translation for a specific key and language
	SetTranslation(ctx context.Context, language, key, value string) error
	
	// DeleteTranslation removes a translation for a specific key and language
	DeleteTranslation(ctx context.Context, language, key string) error
}