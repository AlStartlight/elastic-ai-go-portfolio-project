package repository

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/gosimple/slug"

	"portfolio/internal/domain/project"
)

type projectPostgresRepository struct {
	db *sql.DB
}

// NewProjectPostgresRepository creates a new project repository
func NewProjectPostgresRepository(db *sql.DB) project.Repository {
	return &projectPostgresRepository{db: db}
}

// Create creates a new project
func (r *projectPostgresRepository) Create(ctx context.Context, proj *project.Project) error {
	// Generate slug
	proj.Slug = slug.Make(proj.Title)

	// Set default status if not provided
	if proj.Status == "" {
		proj.Status = "published"
	}

	// Ensure technologies is initialized to empty array if nil
	if proj.Technologies == nil {
		proj.Technologies = []string{}
	}

	// Convert technologies to JSONB
	techJSON, err := json.Marshal(proj.Technologies)
	if err != nil {
		return fmt.Errorf("failed to marshal technologies: %w", err)
	}

	query := `
		INSERT INTO projects (
			title, description, short_description, thumbnail_url, 
			project_url, github_url, technologies, category, featured, 
			display_order, status, started_at, completed_at, slug
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9, $10, $11, $12, $13, $14)
		RETURNING id, created_at, updated_at
	`

	err = r.db.QueryRowContext(ctx, query,
		proj.Title,
		proj.Description,
		proj.ShortDescription,
		proj.ThumbnailURL,
		proj.ProjectURL,
		proj.GithubURL,
		techJSON,
		proj.Category,
		proj.Featured,
		proj.DisplayOrder,
		proj.Status,
		proj.StartedAt,
		proj.CompletedAt,
		proj.Slug,
	).Scan(&proj.ID, &proj.CreatedAt, &proj.UpdatedAt)

	return err
}

// GetByID retrieves a project by ID
func (r *projectPostgresRepository) GetByID(ctx context.Context, id string) (*project.Project, error) {
	query := `
		SELECT id, title, description, short_description, thumbnail_url,
			   project_url, github_url, technologies, category, featured,
			   display_order, status, started_at, completed_at, slug,
			   created_at, updated_at
		FROM projects
		WHERE id = $1
	`

	var proj project.Project
	var techJSON []byte

	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&proj.ID,
		&proj.Title,
		&proj.Description,
		&proj.ShortDescription,
		&proj.ThumbnailURL,
		&proj.ProjectURL,
		&proj.GithubURL,
		&techJSON,
		&proj.Category,
		&proj.Featured,
		&proj.DisplayOrder,
		&proj.Status,
		&proj.StartedAt,
		&proj.CompletedAt,
		&proj.Slug,
		&proj.CreatedAt,
		&proj.UpdatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("project not found")
		}
		return nil, fmt.Errorf("failed to get project: %w", err)
	}

	// Unmarshal technologies from JSONB
	if len(techJSON) > 0 {
		if err := json.Unmarshal(techJSON, &proj.Technologies); err != nil {
			return nil, fmt.Errorf("failed to unmarshal technologies: %w", err)
		}
	}

	return &proj, nil
}

// GetBySlug retrieves a project by slug
func (r *projectPostgresRepository) GetBySlug(ctx context.Context, slugStr string) (*project.Project, error) {
	query := `
		SELECT id, title, description, short_description, thumbnail_url,
			   project_url, github_url, technologies, category, featured,
			   display_order, status, started_at, completed_at, slug,
			   created_at, updated_at
		FROM projects
		WHERE slug = $1
	`

	var proj project.Project
	var techJSON []byte

	err := r.db.QueryRowContext(ctx, query, slugStr).Scan(
		&proj.ID,
		&proj.Title,
		&proj.Description,
		&proj.ShortDescription,
		&proj.ThumbnailURL,
		&proj.ProjectURL,
		&proj.GithubURL,
		&techJSON,
		&proj.Category,
		&proj.Featured,
		&proj.DisplayOrder,
		&proj.Status,
		&proj.StartedAt,
		&proj.CompletedAt,
		&proj.Slug,
		&proj.CreatedAt,
		&proj.UpdatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("project not found")
		}
		return nil, fmt.Errorf("failed to get project: %w", err)
	}

	// Unmarshal technologies from JSONB
	if len(techJSON) > 0 {
		if err := json.Unmarshal(techJSON, &proj.Technologies); err != nil {
			return nil, fmt.Errorf("failed to unmarshal technologies: %w", err)
		}
	}

	return &proj, nil
}

// Update updates a project
func (r *projectPostgresRepository) Update(ctx context.Context, id string, updates project.UpdateProjectRequest) error {
	// Build dynamic query
	setClauses := []string{}
	args := []interface{}{}
	argPos := 1

	if updates.Title != "" {
		setClauses = append(setClauses, fmt.Sprintf("title = $%d", argPos))
		args = append(args, updates.Title)
		argPos++
	}

	if updates.Description != "" {
		setClauses = append(setClauses, fmt.Sprintf("description = $%d", argPos))
		args = append(args, updates.Description)
		argPos++
	}

	if updates.ShortDescription != "" {
		setClauses = append(setClauses, fmt.Sprintf("short_description = $%d", argPos))
		args = append(args, updates.ShortDescription)
		argPos++
	}

	if updates.ThumbnailURL != "" {
		setClauses = append(setClauses, fmt.Sprintf("thumbnail_url = $%d", argPos))
		args = append(args, updates.ThumbnailURL)
		argPos++
	}

	if updates.ProjectURL != "" {
		setClauses = append(setClauses, fmt.Sprintf("project_url = $%d", argPos))
		args = append(args, updates.ProjectURL)
		argPos++
	}

	if updates.GithubURL != "" {
		setClauses = append(setClauses, fmt.Sprintf("github_url = $%d", argPos))
		args = append(args, updates.GithubURL)
		argPos++
	}

	if len(updates.Technologies) > 0 {
		techJSON, err := json.Marshal(updates.Technologies)
		if err != nil {
			return fmt.Errorf("failed to marshal technologies: %w", err)
		}
		setClauses = append(setClauses, fmt.Sprintf("technologies = $%d::jsonb", argPos))
		args = append(args, techJSON)
		argPos++
	}

	if updates.Category != "" {
		setClauses = append(setClauses, fmt.Sprintf("category = $%d", argPos))
		args = append(args, updates.Category)
		argPos++
	}

	if updates.Featured != nil {
		setClauses = append(setClauses, fmt.Sprintf("featured = $%d", argPos))
		args = append(args, *updates.Featured)
		argPos++
	}

	if updates.DisplayOrder != nil {
		setClauses = append(setClauses, fmt.Sprintf("display_order = $%d", argPos))
		args = append(args, *updates.DisplayOrder)
		argPos++
	}

	if updates.Status != "" {
		setClauses = append(setClauses, fmt.Sprintf("status = $%d", argPos))
		args = append(args, updates.Status)
		argPos++
	}

	if updates.StartedAt != nil {
		setClauses = append(setClauses, fmt.Sprintf("started_at = $%d", argPos))
		args = append(args, updates.StartedAt)
		argPos++
	}

	if updates.CompletedAt != nil {
		setClauses = append(setClauses, fmt.Sprintf("completed_at = $%d", argPos))
		args = append(args, updates.CompletedAt)
		argPos++
	}

	if len(setClauses) == 0 {
		return fmt.Errorf("no fields to update")
	}

	// Always update slug if title changed
	if updates.Title != "" {
		setClauses = append(setClauses, fmt.Sprintf("slug = $%d", argPos))
		args = append(args, slug.Make(updates.Title))
		argPos++
	}

	// Add updated_at
	setClauses = append(setClauses, fmt.Sprintf("updated_at = $%d", argPos))
	args = append(args, time.Now())
	argPos++

	// Add ID as the final argument
	args = append(args, id)

	query := fmt.Sprintf(`
		UPDATE projects 
		SET %s
		WHERE id = $%d
	`, strings.Join(setClauses, ", "), argPos)

	_, err := r.db.ExecContext(ctx, query, args...)
	return err
}

// Delete deletes a project
func (r *projectPostgresRepository) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM projects WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}

// GetAll retrieves all projects with optional filters
func (r *projectPostgresRepository) GetAll(ctx context.Context, filters map[string]interface{}) ([]*project.Project, error) {
	query := `
		SELECT id, title, description, short_description, thumbnail_url,
			   project_url, github_url, technologies, category, featured,
			   display_order, status, started_at, completed_at, slug,
			   created_at, updated_at
		FROM projects
		WHERE 1=1
	`

	args := []interface{}{}
	argPos := 1

	// Add filters
	if category, ok := filters["category"].(string); ok && category != "" {
		query += fmt.Sprintf(" AND category = $%d", argPos)
		args = append(args, category)
		argPos++
	}

	if featured, ok := filters["featured"].(bool); ok {
		query += fmt.Sprintf(" AND featured = $%d", argPos)
		args = append(args, featured)
		argPos++
	}

	if status, ok := filters["status"].(string); ok && status != "" {
		query += fmt.Sprintf(" AND status = $%d", argPos)
		args = append(args, status)
		argPos++
	}

	query += " ORDER BY display_order ASC, created_at DESC"

	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	projects := []*project.Project{}
	for rows.Next() {
		var proj project.Project
		var techJSON []byte

		err := rows.Scan(
			&proj.ID,
			&proj.Title,
			&proj.Description,
			&proj.ShortDescription,
			&proj.ThumbnailURL,
			&proj.ProjectURL,
			&proj.GithubURL,
			&techJSON,
			&proj.Category,
			&proj.Featured,
			&proj.DisplayOrder,
			&proj.Status,
			&proj.StartedAt,
			&proj.CompletedAt,
			&proj.Slug,
			&proj.CreatedAt,
			&proj.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}

		// Unmarshal technologies from JSONB
		if len(techJSON) > 0 {
			if err := json.Unmarshal(techJSON, &proj.Technologies); err != nil {
				return nil, fmt.Errorf("failed to unmarshal technologies: %w", err)
			}
		}

		projects = append(projects, &proj)
	}

	return projects, nil
}
