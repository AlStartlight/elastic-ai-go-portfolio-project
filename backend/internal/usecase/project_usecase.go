package usecase

import (
	"context"
	"errors"
	"math"
	"time"

	"portfolio/internal/domain/project"
	"portfolio/internal/infrastructure/logger"
)

// ProjectUseCase handles business logic for project operations
type ProjectUseCase struct {
	projectRepo project.Repository
	logger      logger.Logger
}

// NewProjectUseCase creates a new ProjectUseCase instance
func NewProjectUseCase(projectRepo project.Repository, logger logger.Logger) *ProjectUseCase {
	return &ProjectUseCase{
		projectRepo: projectRepo,
		logger:      logger,
	}
}

// CreateProject creates a new project
func (uc *ProjectUseCase) CreateProject(ctx context.Context, req project.CreateProjectRequest) error {
	// Create project entity
	newProject := &project.Project{
		Title:       req.Title,
		Description: req.Description,
		TechStack:   req.TechStack,
		ImageURL:    req.ImageURL,
		ProjectURL:  req.ProjectURL,
		GithubURL:   req.GithubURL,
		IsActive:    req.IsActive,
		Order:       req.Order,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	// Save project
	if err := uc.projectRepo.Create(ctx, newProject); err != nil {
		uc.logger.Error("Failed to create project", err)
		return errors.New("failed to create project")
	}

	return nil
}

// GetProject retrieves a project by ID
func (uc *ProjectUseCase) GetProject(ctx context.Context, id uint) (*project.Project, error) {
	proj, err := uc.projectRepo.GetByID(ctx, id)
	if err != nil {
		uc.logger.Error("Failed to get project by ID", err)
		return nil, errors.New("project not found")
	}

	return proj, nil
}

// UpdateProject updates a project
func (uc *ProjectUseCase) UpdateProject(ctx context.Context, id uint, req project.UpdateProjectRequest) error {
	// Check if project exists
	_, err := uc.projectRepo.GetByID(ctx, id)
	if err != nil {
		uc.logger.Error("Project not found for update", err)
		return errors.New("project not found")
	}

	// Update project
	if err := uc.projectRepo.Update(ctx, id, req); err != nil {
		uc.logger.Error("Failed to update project", err)
		return errors.New("failed to update project")
	}

	return nil
}

// DeleteProject deletes a project
func (uc *ProjectUseCase) DeleteProject(ctx context.Context, id uint) error {
	// Check if project exists
	_, err := uc.projectRepo.GetByID(ctx, id)
	if err != nil {
		uc.logger.Error("Project not found for deletion", err)
		return errors.New("project not found")
	}

	// Delete project
	if err := uc.projectRepo.Delete(ctx, id); err != nil {
		uc.logger.Error("Failed to delete project", err)
		return errors.New("failed to delete project")
	}

	return nil
}

// ListProjects retrieves projects with pagination
func (uc *ProjectUseCase) ListProjects(ctx context.Context, page, limit int, activeOnly bool) (*project.ProjectListResponse, error) {
	// Validate pagination parameters
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}

	offset := (page - 1) * limit

	// Get projects
	projects, err := uc.projectRepo.List(ctx, limit, offset, activeOnly)
	if err != nil {
		uc.logger.Error("Failed to list projects", err)
		return nil, errors.New("failed to retrieve projects")
	}

	// Get total count
	total, err := uc.projectRepo.Count(ctx, activeOnly)
	if err != nil {
		uc.logger.Error("Failed to count projects", err)
		return nil, errors.New("failed to retrieve projects count")
	}

	totalPages := int(math.Ceil(float64(total) / float64(limit)))

	return &project.ProjectListResponse{
		Projects:   projects,
		Total:      total,
		Page:       page,
		Limit:      limit,
		TotalPages: totalPages,
	}, nil
}

// ReorderProjects updates the order of projects
func (uc *ProjectUseCase) ReorderProjects(ctx context.Context, projectOrders map[uint]int) error {
	if err := uc.projectRepo.ReorderProjects(ctx, projectOrders); err != nil {
		uc.logger.Error("Failed to reorder projects", err)
		return errors.New("failed to reorder projects")
	}

	return nil
}