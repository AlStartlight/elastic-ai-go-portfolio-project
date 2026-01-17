package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"portfolio/internal/domain/project"
	"portfolio/internal/infrastructure/logger"
	"portfolio/internal/usecase"
)

// ProjectHandler handles project-related HTTP requests
type ProjectHandler struct {
	projectUseCase *usecase.ProjectUseCase
	logger         logger.Logger
}

// NewProjectHandler creates a new project handler
func NewProjectHandler(projectUseCase *usecase.ProjectUseCase, logger logger.Logger) *ProjectHandler {
	return &ProjectHandler{
		projectUseCase: projectUseCase,
		logger:         logger,
	}
}

// GetAllProjects handles GET /public/projects
func (h *ProjectHandler) GetAllProjects(c *gin.Context) {
	filters := make(map[string]interface{})

	// Optional filters
	if status := c.Query("status"); status != "" {
		filters["status"] = status
	}
	if category := c.Query("category"); category != "" {
		filters["category"] = category
	}
	if featured := c.Query("featured"); featured != "" {
		filters["featured"] = featured
	}

	projects, err := h.projectUseCase.ListProjects(c.Request.Context(), filters)
	if err != nil {
		h.logger.Error("Failed to get projects", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch projects"})
		return
	}

	c.JSON(http.StatusOK, projects)
}

// GetProjectBySlug handles GET /public/projects/:slug
func (h *ProjectHandler) GetProjectBySlug(c *gin.Context) {
	slug := c.Param("slug")

	project, err := h.projectUseCase.GetProjectBySlug(c.Request.Context(), slug)
	if err != nil {
		h.logger.Error("Failed to get project by slug", err)
		c.JSON(http.StatusNotFound, gin.H{"error": "Project not found"})
		return
	}

	c.JSON(http.StatusOK, project)
}

// CreateProject handles POST /admin/projects
func (h *ProjectHandler) CreateProject(c *gin.Context) {
	var req project.CreateProjectRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.logger.Error("Failed to bind create project request", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format: " + err.Error()})
		return
	}

	proj, err := h.projectUseCase.CreateProject(c.Request.Context(), req)
	if err != nil {
		h.logger.Error("Failed to create project", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create project"})
		return
	}

	c.JSON(http.StatusCreated, proj)
}

// UpdateProject handles PUT /admin/projects/:id
func (h *ProjectHandler) UpdateProject(c *gin.Context) {
	id := c.Param("id")

	var req project.UpdateProjectRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.logger.Error("Failed to bind update project request", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format: " + err.Error()})
		return
	}

	if err := h.projectUseCase.UpdateProject(c.Request.Context(), id, req); err != nil {
		h.logger.Error("Failed to update project", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update project"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Project updated successfully"})
}

// DeleteProject handles DELETE /admin/projects/:id
func (h *ProjectHandler) DeleteProject(c *gin.Context) {
	id := c.Param("id")

	if err := h.projectUseCase.DeleteProject(c.Request.Context(), id); err != nil {
		h.logger.Error("Failed to delete project", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete project"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Project deleted successfully"})
}
