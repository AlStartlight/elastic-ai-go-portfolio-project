package homepage

import (
	"context"
	"time"
)

type HomepageContent struct {
	ID               string                 `json:"id"`
	Section          string                 `json:"section"`
	Title            string                 `json:"title"`
	Subtitle         string                 `json:"subtitle"`
	Description      string                 `json:"description"`
	ImageURL         string                 `json:"imageUrl"`
	CtaPrimaryText   string                 `json:"ctaPrimaryText"`
	CtaPrimaryLink   string                 `json:"ctaPrimaryLink"`
	CtaSecondaryText string                 `json:"ctaSecondaryText"`
	CtaSecondaryLink string                 `json:"ctaSecondaryLink"`
	Metadata         map[string]interface{} `json:"metadata"`
	IsActive         bool                   `json:"isActive"`
	CreatedAt        time.Time              `json:"createdAt"`
	UpdatedAt        time.Time              `json:"updatedAt"`
}

type TechStack struct {
	ID           string    `json:"id"`
	Title        string    `json:"title"`
	Description  string    `json:"description"`
	Icon         string    `json:"icon"`
	Category     string    `json:"category"`
	DisplayOrder int       `json:"displayOrder"`
	IsActive     bool      `json:"isActive"`
	CreatedAt    time.Time `json:"createdAt"`
	UpdatedAt    time.Time `json:"updatedAt"`
}

// Repository interface for homepage content operations
type Repository interface {
	GetBySection(ctx context.Context, section string) (*HomepageContent, error)
	Update(ctx context.Context, content *HomepageContent) error
	GetAllTechStacks(ctx context.Context) ([]TechStack, error)
	GetTechStackByID(ctx context.Context, id string) (*TechStack, error)
	CreateTechStack(ctx context.Context, stack *TechStack) error
	UpdateTechStack(ctx context.Context, stack *TechStack) error
	DeleteTechStack(ctx context.Context, id string) error
}

// Usecase interface for homepage content business logic
type Usecase interface {
	GetBySection(ctx context.Context, section string) (*HomepageContent, error)
	UpdateContent(ctx context.Context, content *HomepageContent) error
	GetAllTechStacks(ctx context.Context) ([]TechStack, error)
	GetTechStackByID(ctx context.Context, id string) (*TechStack, error)
	CreateTechStack(ctx context.Context, stack *TechStack) error
	UpdateTechStack(ctx context.Context, stack *TechStack) error
	DeleteTechStack(ctx context.Context, id string) error
}
