package repository

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/jmoiron/sqlx"
	"github.com/lib/pq"

	"portfolio/internal/domain/project"
)

type projectPostgresRepository struct {
	db *sqlx.DB
}

// NewProjectPostgresRepository creates a new project repository
func NewProjectPostgresRepository(db *sqlx.DB) project.Repository {
	return &projectPostgresRepository{db: db}
}

// Create creates a new project
func (r *projectPostgresRepository) Create(ctx context.Context, proj *project.Project) error {
	query := `
		INSERT INTO projects (title, description, tech_stack, image_url, project_url, github_url, is_active, "order", created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
		RETURNING id`

	err := r.db.QueryRowContext(
		ctx,
		query,
		proj.Title,
		proj.Description,
		pq.Array(proj.TechStack),
		proj.ImageURL,
		proj.ProjectURL,
		proj.GithubURL,
		proj.IsActive,
		proj.Order,
		time.Now(),
		time.Now(),
	).Scan(&proj.ID)

	if err != nil {
		return fmt.Errorf("failed to create project: %w", err)
	}

	return nil
}

// GetByID retrieves a project by ID
func (r *projectPostgresRepository) GetByID(ctx context.Context, id uint) (*project.Project, error) {
	query := `
		SELECT id, title, description, tech_stack, image_url, project_url, github_url, is_active, "order", created_at, updated_at
		FROM projects
		WHERE id = $1`

	var proj project.Project
	var techStack pq.StringArray

	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&proj.ID,
		&proj.Title,
		&proj.Description,
		&techStack,
		&proj.ImageURL,
		&proj.ProjectURL,
		&proj.GithubURL,
		&proj.IsActive,
		&proj.Order,
		&proj.CreatedAt,
		&proj.UpdatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("project not found")
		}
		return nil, fmt.Errorf("failed to get project: %w", err)
	}

	proj.TechStack = techStack
	return &proj, nil
}

// Update updates a project
func (r *projectPostgresRepository) Update(ctx context.Context, id uint, updates project.UpdateProjectRequest) error {
	// Build dynamic query based on provided fields
	query := "UPDATE projects SET updated_at = $1"
	args := []interface{}{time.Now()}
	paramCount := 2

	if updates.Title != "" {
		query += fmt.Sprintf(", title = $%d", paramCount)
		args = append(args, updates.Title)
		paramCount++
	}

	if updates.Description != "" {
		query += fmt.Sprintf(", description = $%d", paramCount)
		args = append(args, updates.Description)
		paramCount++
	}

	if updates.TechStack != nil {
		query += fmt.Sprintf(", tech_stack = $%d", paramCount)
		args = append(args, pq.Array(updates.TechStack))
		paramCount++
	}

	if updates.ImageURL != "" {
		query += fmt.Sprintf(", image_url = $%d", paramCount)
		args = append(args, updates.ImageURL)
		paramCount++
	}

	if updates.ProjectURL != "" {
		query += fmt.Sprintf(", project_url = $%d", paramCount)
		args = append(args, updates.ProjectURL)
		paramCount++
	}

	if updates.GithubURL != "" {
		query += fmt.Sprintf(", github_url = $%d", paramCount)
		args = append(args, updates.GithubURL)
		paramCount++
	}

	if updates.IsActive != nil {
		query += fmt.Sprintf(", is_active = $%d", paramCount)
		args = append(args, *updates.IsActive)
		paramCount++
	}

	if updates.Order != nil {
		query += fmt.Sprintf(`, "order" = $%d`, paramCount)
		args = append(args, *updates.Order)
		paramCount++
	}

	query += fmt.Sprintf(" WHERE id = $%d", paramCount)
	args = append(args, id)

	result, err := r.db.ExecContext(ctx, query, args...)
	if err != nil {
		return fmt.Errorf("failed to update project: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("project not found")
	}

	return nil
}

// Delete deletes a project
func (r *projectPostgresRepository) Delete(ctx context.Context, id uint) error {
	query := "DELETE FROM projects WHERE id = $1"

	result, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete project: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("project not found")
	}

	return nil
}

// List retrieves all projects with pagination and filtering
func (r *projectPostgresRepository) List(ctx context.Context, limit, offset int, activeOnly bool) ([]*project.Project, error) {
	query := `
		SELECT id, title, description, tech_stack, image_url, project_url, github_url, is_active, "order", created_at, updated_at
		FROM projects`

	if activeOnly {
		query += " WHERE is_active = true"
	}

	query += ` ORDER BY "order" ASC, created_at DESC`

	if limit > 0 {
		query += fmt.Sprintf(" LIMIT %d", limit)
	}

	if offset > 0 {
		query += fmt.Sprintf(" OFFSET %d", offset)
	}

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to list projects: %w", err)
	}
	defer rows.Close()

	var projects []*project.Project
	for rows.Next() {
		var proj project.Project
		var techStack pq.StringArray

		err := rows.Scan(
			&proj.ID,
			&proj.Title,
			&proj.Description,
			&techStack,
			&proj.ImageURL,
			&proj.ProjectURL,
			&proj.GithubURL,
			&proj.IsActive,
			&proj.Order,
			&proj.CreatedAt,
			&proj.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan project: %w", err)
		}

		proj.TechStack = techStack
		projects = append(projects, &proj)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating projects: %w", err)
	}

	return projects, nil
}

// Count returns the total number of projects
func (r *projectPostgresRepository) Count(ctx context.Context, activeOnly bool) (int64, error) {
	query := "SELECT COUNT(*) FROM projects"

	if activeOnly {
		query += " WHERE is_active = true"
	}

	var count int64
	err := r.db.QueryRowContext(ctx, query).Scan(&count)
	if err != nil {
		return 0, fmt.Errorf("failed to count projects: %w", err)
	}

	return count, nil
}

// ReorderProjects updates the order of projects
func (r *projectPostgresRepository) ReorderProjects(ctx context.Context, projectOrders map[uint]int) error {
	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	query := `UPDATE projects SET "order" = $1, updated_at = $2 WHERE id = $3`

	for projectID, order := range projectOrders {
		_, err := tx.ExecContext(ctx, query, order, time.Now(), projectID)
		if err != nil {
			return fmt.Errorf("failed to update project order: %w", err)
		}
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}
