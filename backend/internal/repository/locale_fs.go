package repository

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"

	"portfolio/internal/domain/locale"
)

type localeFileSystemRepository struct {
	basePath string
}

// NewLocaleFileSystemRepository creates a new locale repository
func NewLocaleFileSystemRepository() locale.Repository {
	return &localeFileSystemRepository{
		basePath: "frontend/public/locales",
	}
}

// GetTranslation retrieves translations for a specific language
func (r *localeFileSystemRepository) GetTranslation(ctx context.Context, language string) (*locale.Translation, error) {
	filePath := filepath.Join(r.basePath, language, "translation.json")

	data, err := os.ReadFile(filePath)
	if err != nil {
		return nil, fmt.Errorf("failed to read translation file: %w", err)
	}

	var translations map[string]string
	if err := json.Unmarshal(data, &translations); err != nil {
		return nil, fmt.Errorf("failed to parse translation file: %w", err)
	}

	return &locale.Translation{
		Language:     language,
		Translations: translations,
	}, nil
}

// GetSupportedLanguages retrieves all supported languages
func (r *localeFileSystemRepository) GetSupportedLanguages(ctx context.Context) ([]locale.SupportedLanguage, error) {
	// For now, return hardcoded list
	// In production, you might want to scan the locales directory
	return []locale.SupportedLanguage{
		{Code: "en", Name: "English"},
		{Code: "id", Name: "Bahasa Indonesia"},
	}, nil
}

// SetTranslation sets a translation for a specific key and language
func (r *localeFileSystemRepository) SetTranslation(ctx context.Context, language, key, value string) error {
	filePath := filepath.Join(r.basePath, language, "translation.json")

	// Read existing translations
	var translations map[string]string
	data, err := os.ReadFile(filePath)
	if err != nil {
		if !os.IsNotExist(err) {
			return fmt.Errorf("failed to read translation file: %w", err)
		}
		translations = make(map[string]string)
	} else {
		if err := json.Unmarshal(data, &translations); err != nil {
			return fmt.Errorf("failed to parse translation file: %w", err)
		}
	}

	// Set new translation
	translations[key] = value

	// Write back to file
	data, err = json.MarshalIndent(translations, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to marshal translations: %w", err)
	}

	// Create directory if it doesn't exist
	if err := os.MkdirAll(filepath.Dir(filePath), 0755); err != nil {
		return fmt.Errorf("failed to create directory: %w", err)
	}

	if err := os.WriteFile(filePath, data, 0644); err != nil {
		return fmt.Errorf("failed to write translation file: %w", err)
	}

	return nil
}

// DeleteTranslation removes a translation for a specific key and language
func (r *localeFileSystemRepository) DeleteTranslation(ctx context.Context, language, key string) error {
	filePath := filepath.Join(r.basePath, language, "translation.json")

	// Read existing translations
	data, err := os.ReadFile(filePath)
	if err != nil {
		return fmt.Errorf("failed to read translation file: %w", err)
	}

	var translations map[string]string
	if err := json.Unmarshal(data, &translations); err != nil {
		return fmt.Errorf("failed to parse translation file: %w", err)
	}

	// Delete key
	delete(translations, key)

	// Write back to file
	data, err = json.MarshalIndent(translations, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to marshal translations: %w", err)
	}

	if err := os.WriteFile(filePath, data, 0644); err != nil {
		return fmt.Errorf("failed to write translation file: %w", err)
	}

	return nil
}
