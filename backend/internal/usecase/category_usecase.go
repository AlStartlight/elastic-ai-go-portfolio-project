package usecase

import (
	"context"
	"fmt"
	"strings"
	"time"

	"portfolio/internal/domain"
)

type categoryUsecase struct {
	categoryRepo domain.CategoryRepository
	timeout      time.Duration
}

func NewCategoryUsecase(categoryRepo domain.CategoryRepository, timeout time.Duration) domain.CategoryUsecase {
	return &categoryUsecase{
		categoryRepo: categoryRepo,
		timeout:      timeout,
	}
}

func (c *categoryUsecase) GetCategories(ctx context.Context) ([]*domain.Category, error) {
	ctx, cancel := context.WithTimeout(ctx, c.timeout)
	defer cancel()

	return c.categoryRepo.GetAll(ctx)
}

func (c *categoryUsecase) GetCategoryByID(ctx context.Context, id string) (*domain.Category, error) {
	ctx, cancel := context.WithTimeout(ctx, c.timeout)
	defer cancel()

	if id == "" {
		return nil, domain.ErrCategoryNotFound
	}

	return c.categoryRepo.GetByID(ctx, id)
}

func (c *categoryUsecase) GetCategoryBySlug(ctx context.Context, slug string) (*domain.Category, error) {
	ctx, cancel := context.WithTimeout(ctx, c.timeout)
	defer cancel()

	if slug == "" {
		return nil, domain.ErrCategoryNotFound
	}

	return c.categoryRepo.GetBySlug(ctx, slug)
}

func (c *categoryUsecase) CreateCategory(ctx context.Context, category *domain.Category) error {
	ctx, cancel := context.WithTimeout(ctx, c.timeout)
	defer cancel()

	// Validate required fields
	if category.Name == "" {
		return fmt.Errorf("category name is required")
	}

	// Generate ID if not provided
	if category.ID == "" {
		id, err := generateID()
		if err != nil {
			return fmt.Errorf("failed to generate category ID: %w", err)
		}
		category.ID = id
	}

	// Generate slug from name if not provided
	if category.Slug == "" {
		category.Slug = generateSlug(category.Name)
	}

	return c.categoryRepo.Create(ctx, category)
}

func (c *categoryUsecase) UpdateCategory(ctx context.Context, id string, category *domain.Category) error {
	ctx, cancel := context.WithTimeout(ctx, c.timeout)
	defer cancel()

	// Check if category exists
	_, err := c.categoryRepo.GetByID(ctx, id)
	if err != nil {
		return err
	}

	// Update slug if name changed
	if category.Name != "" && category.Slug == "" {
		category.Slug = generateSlug(category.Name)
	}

	return c.categoryRepo.Update(ctx, id, category)
}

func (c *categoryUsecase) DeleteCategory(ctx context.Context, id string) error {
	ctx, cancel := context.WithTimeout(ctx, c.timeout)
	defer cancel()

	// Check if category exists
	_, err := c.categoryRepo.GetByID(ctx, id)
	if err != nil {
		return err
	}

	// TODO: Check if category is being used by articles
	// and either prevent deletion or reassign articles

	return c.categoryRepo.Delete(ctx, id)
}

// Helper function to generate slug from name
func generateSlug(name string) string {
	// Simple slug generation - replace spaces with hyphens and lowercase
	slug := strings.ToLower(strings.TrimSpace(name))
	slug = strings.ReplaceAll(slug, " ", "-")

	// Remove special characters (basic implementation)
	var result strings.Builder
	for _, r := range slug {
		if (r >= 'a' && r <= 'z') || (r >= '0' && r <= '9') || r == '-' {
			result.WriteRune(r)
		}
	}

	return result.String()
}
