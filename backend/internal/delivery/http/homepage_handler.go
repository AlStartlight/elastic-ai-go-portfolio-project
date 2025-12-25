package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"portfolio/internal/domain/homepage"
)

type HomepageHandler struct {
	homepageUC homepage.Usecase
}

func NewHomepageHandler(homepageUC homepage.Usecase) *HomepageHandler {
	return &HomepageHandler{homepageUC: homepageUC}
}

// GetContentBySection handles getting homepage content by section
func (h *HomepageHandler) GetContentBySection(c *gin.Context) {
	section := c.Param("section") // hero, about, skills

	content, err := h.homepageUC.GetBySection(c.Request.Context(), section)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Content not found"})
		return
	}

	c.JSON(http.StatusOK, content)
}

// GetAllTechStacks handles getting all tech stacks
func (h *HomepageHandler) GetAllTechStacks(c *gin.Context) {
	stacks, err := h.homepageUC.GetAllTechStacks(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, stacks)
}

// UpdateContent handles updating homepage content (Admin only)
func (h *HomepageHandler) UpdateContent(c *gin.Context) {
	var req homepage.HomepageContent
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.homepageUC.UpdateContent(c.Request.Context(), &req); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Content updated successfully"})
}

// CreateTechStack handles creating a new tech stack (Admin only)
func (h *HomepageHandler) CreateTechStack(c *gin.Context) {
	var req homepage.TechStack
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.homepageUC.CreateTechStack(c.Request.Context(), &req); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, req)
}

// UpdateTechStack handles updating a tech stack (Admin only)
func (h *HomepageHandler) UpdateTechStack(c *gin.Context) {
	id := c.Param("id")

	var req homepage.TechStack
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	req.ID = id
	if err := h.homepageUC.UpdateTechStack(c.Request.Context(), &req); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Tech stack updated successfully"})
}

// DeleteTechStack handles deleting a tech stack (Admin only)
func (h *HomepageHandler) DeleteTechStack(c *gin.Context) {
	id := c.Param("id")

	if err := h.homepageUC.DeleteTechStack(c.Request.Context(), id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Tech stack deleted successfully"})
}
