package repository

import (
	"context"
	"database/sql"
	"fmt"

	"portfolio/internal/domain"

	"github.com/jmoiron/sqlx"
)

type categoryPostgresRepository struct {
	db *sqlx.DB
}

func NewCategoryPostgresRepository(db *sqlx.DB) domain.CategoryRepository {
	return &categoryPostgresRepository{
		db: db,
	}
}

func (r *categoryPostgresRepository) GetAll(ctx context.Context) ([]*domain.Category, error) {
	query := `SELECT id, name, color, bg_color, slug FROM categories ORDER BY name`

	var categories []*domain.Category
	err := r.db.SelectContext(ctx, &categories, query)
	if err != nil {
		return nil, fmt.Errorf("failed to get categories: %w", err)
	}

	return categories, nil
}

func (r *categoryPostgresRepository) GetByID(ctx context.Context, id string) (*domain.Category, error) {
	query := `SELECT id, name, color, bg_color, slug FROM categories WHERE id = $1`

	var category domain.Category
	err := r.db.GetContext(ctx, &category, query, id)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, domain.ErrCategoryNotFound
		}
		return nil, fmt.Errorf("failed to get category: %w", err)
	}

	return &category, nil
}

func (r *categoryPostgresRepository) GetBySlug(ctx context.Context, slug string) (*domain.Category, error) {
	query := `SELECT id, name, color, bg_color, slug FROM categories WHERE slug = $1`

	var category domain.Category
	err := r.db.GetContext(ctx, &category, query, slug)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, domain.ErrCategoryNotFound
		}
		return nil, fmt.Errorf("failed to get category: %w", err)
	}

	return &category, nil
}

func (r *categoryPostgresRepository) Create(ctx context.Context, category *domain.Category) error {
	query := `
		INSERT INTO categories (id, name, color, bg_color, slug) 
		VALUES ($1, $2, $3, $4, $5)`

	_, err := r.db.ExecContext(ctx, query,
		category.ID, category.Name, category.Color, category.BgColor, category.Slug)
	if err != nil {
		return fmt.Errorf("failed to create category: %w", err)
	}

	return nil
}

func (r *categoryPostgresRepository) Update(ctx context.Context, id string, category *domain.Category) error {
	query := `
		UPDATE categories 
		SET name = $2, color = $3, bg_color = $4, slug = $5 
		WHERE id = $1`

	_, err := r.db.ExecContext(ctx, query,
		id, category.Name, category.Color, category.BgColor, category.Slug)
	if err != nil {
		return fmt.Errorf("failed to update category: %w", err)
	}

	return nil
}

func (r *categoryPostgresRepository) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM categories WHERE id = $1`

	result, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete category: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to check affected rows: %w", err)
	}

	if rowsAffected == 0 {
		return domain.ErrCategoryNotFound
	}

	return nil
}
