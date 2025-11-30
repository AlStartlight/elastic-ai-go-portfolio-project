package locale

// Locale represents a localization entry
type Locale struct {
	Key   string `json:"key"`
	Value string `json:"value"`
}

// Translation represents a complete translation set for a language
type Translation struct {
	Language     string            `json:"language"`
	Translations map[string]string `json:"translations"`
}

// SupportedLanguage represents a supported language
type SupportedLanguage struct {
	Code string `json:"code"`
	Name string `json:"name"`
}

// LocaleResponse represents locale API response
type LocaleResponse struct {
	Language     string            `json:"language"`
	Translations map[string]string `json:"translations"`
}