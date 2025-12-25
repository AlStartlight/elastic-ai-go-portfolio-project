package project

import (
	"context"
)

// Repository interface defines the contract for project data operations
type Repository interface {
	// Create creates a new project
	Create(ctx context.Context, project *Project) error

	// GetByID retrieves a project by ID
	GetByID(ctx context.Context, id string) (*Project, error)

	// GetBySlug retrieves a project by slug
	GetBySlug(ctx context.Context, slug string) (*Project, error)

	// Update updates a project
	Update(ctx context.Context, id string, updates UpdateProjectRequest) error

	// Delete deletes a project
	Delete(ctx context.Context, id string) error

	// GetAll retrieves all projects with optional filters
	GetAll(ctx context.Context, filters map[string]interface{}) ([]*Project, error)
}
