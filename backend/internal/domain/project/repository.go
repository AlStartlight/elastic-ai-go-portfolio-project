package project

import (
	"context"
)

// Repository interface defines the contract for project data operations
type Repository interface {
	// Create creates a new project
	Create(ctx context.Context, project *Project) error
	
	// GetByID retrieves a project by ID
	GetByID(ctx context.Context, id uint) (*Project, error)
	
	// Update updates a project
	Update(ctx context.Context, id uint, updates UpdateProjectRequest) error
	
	// Delete deletes a project
	Delete(ctx context.Context, id uint) error
	
	// List retrieves all projects with pagination and filtering
	List(ctx context.Context, limit, offset int, activeOnly bool) ([]*Project, error)
	
	// Count returns the total number of projects
	Count(ctx context.Context, activeOnly bool) (int64, error)
	
	// ReorderProjects updates the order of projects
	ReorderProjects(ctx context.Context, projectOrders map[uint]int) error
}