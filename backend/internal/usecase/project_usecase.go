package usecase

import (
	"context"

	"portfolio/internal/domain/project"
)

// ProjectUseCase implements project business logic
type ProjectUseCase struct {
	projectRepo project.Repository
}

// NewProjectUseCase creates a new project usecase
func NewProjectUseCase(projectRepo project.Repository) *ProjectUseCase {
	return &ProjectUseCase{
		projectRepo: projectRepo,
	}
}

// CreateProject creates a new project
func (uc *ProjectUseCase) CreateProject(ctx context.Context, req project.CreateProjectRequest) (*project.Project, error) {
	proj := &project.Project{
		Title:            req.Title,
		Description:      req.Description,
		ShortDescription: req.ShortDescription,
		ThumbnailURL:     req.ThumbnailURL,
		ProjectURL:       req.ProjectURL,
		GithubURL:        req.GithubURL,
		Technologies:     req.Technologies,
		Category:         req.Category,
		Featured:         req.Featured,
		DisplayOrder:     req.DisplayOrder,
		Status:           req.Status,
		StartedAt:        req.StartedAt,
		CompletedAt:      req.CompletedAt,
	}

	if err := uc.projectRepo.Create(ctx, proj); err != nil {
		return nil, err
	}

	return proj, nil
}

// GetProject retrieves a project by ID
func (uc *ProjectUseCase) GetProject(ctx context.Context, id string) (*project.Project, error) {
	return uc.projectRepo.GetByID(ctx, id)
}

// GetProjectBySlug retrieves a project by slug
func (uc *ProjectUseCase) GetProjectBySlug(ctx context.Context, slug string) (*project.Project, error) {
	return uc.projectRepo.GetBySlug(ctx, slug)
}

// UpdateProject updates a project
func (uc *ProjectUseCase) UpdateProject(ctx context.Context, id string, req project.UpdateProjectRequest) error {
	return uc.projectRepo.Update(ctx, id, req)
}

// DeleteProject deletes a project
func (uc *ProjectUseCase) DeleteProject(ctx context.Context, id string) error {
	return uc.projectRepo.Delete(ctx, id)
}

// ListProjects retrieves all projects with optional filters
func (uc *ProjectUseCase) ListProjects(ctx context.Context, filters map[string]interface{}) ([]*project.Project, error) {
	return uc.projectRepo.GetAll(ctx, filters)
}
