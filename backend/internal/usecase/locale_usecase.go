package usecase

import (
	"context"
	"errors"

	"portfolio/internal/domain/locale"
	"portfolio/internal/infrastructure/logger"
)

// LocaleUseCase handles business logic for locale operations
type LocaleUseCase struct {
	localeRepo locale.Repository
	logger     logger.Logger
}

// NewLocaleUseCase creates a new LocaleUseCase instance
func NewLocaleUseCase(localeRepo locale.Repository, logger logger.Logger) *LocaleUseCase {
	return &LocaleUseCase{
		localeRepo: localeRepo,
		logger:     logger,
	}
}

// GetTranslation retrieves translations for a specific language
func (uc *LocaleUseCase) GetTranslation(ctx context.Context, language string) (*locale.LocaleResponse, error) {
	// Validate language parameter
	if language == "" {
		return nil, errors.New("language parameter is required")
	}

	// Get supported languages first to validate
	supportedLanguages, err := uc.localeRepo.GetSupportedLanguages(ctx)
	if err != nil {
		uc.logger.Error("Failed to get supported languages", err)
		return nil, errors.New("failed to validate language")
	}

	// Check if the requested language is supported
	isSupported := false
	for _, lang := range supportedLanguages {
		if lang.Code == language {
			isSupported = true
			break
		}
	}

	if !isSupported {
		return nil, errors.New("language not supported")
	}

	// Get translations
	translation, err := uc.localeRepo.GetTranslation(ctx, language)
	if err != nil {
		uc.logger.Error("Failed to get translation", err)
		return nil, errors.New("failed to retrieve translations")
	}

	return &locale.LocaleResponse{
		Language:     translation.Language,
		Translations: translation.Translations,
	}, nil
}

// GetSupportedLanguages retrieves all supported languages
func (uc *LocaleUseCase) GetSupportedLanguages(ctx context.Context) ([]locale.SupportedLanguage, error) {
	languages, err := uc.localeRepo.GetSupportedLanguages(ctx)
	if err != nil {
		uc.logger.Error("Failed to get supported languages", err)
		return nil, errors.New("failed to retrieve supported languages")
	}

	return languages, nil
}

// SetTranslation sets a translation for a specific key and language
func (uc *LocaleUseCase) SetTranslation(ctx context.Context, language, key, value string) error {
	// Validate parameters
	if language == "" || key == "" || value == "" {
		return errors.New("language, key, and value are required")
	}

	// Validate language is supported
	supportedLanguages, err := uc.localeRepo.GetSupportedLanguages(ctx)
	if err != nil {
		uc.logger.Error("Failed to get supported languages", err)
		return errors.New("failed to validate language")
	}

	isSupported := false
	for _, lang := range supportedLanguages {
		if lang.Code == language {
			isSupported = true
			break
		}
	}

	if !isSupported {
		return errors.New("language not supported")
	}

	// Set translation
	if err := uc.localeRepo.SetTranslation(ctx, language, key, value); err != nil {
		uc.logger.Error("Failed to set translation", err)
		return errors.New("failed to set translation")
	}

	return nil
}

// DeleteTranslation removes a translation for a specific key and language
func (uc *LocaleUseCase) DeleteTranslation(ctx context.Context, language, key string) error {
	// Validate parameters
	if language == "" || key == "" {
		return errors.New("language and key are required")
	}

	// Delete translation
	if err := uc.localeRepo.DeleteTranslation(ctx, language, key); err != nil {
		uc.logger.Error("Failed to delete translation", err)
		return errors.New("failed to delete translation")
	}

	return nil
}