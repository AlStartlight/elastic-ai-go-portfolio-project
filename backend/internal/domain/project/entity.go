package project

import (
	"time"
)

// Project represents a portfolio project entity
type Project struct {
	ID               string     `json:"id" db:"id"`
	Title            string     `json:"title" db:"title" binding:"required"`
	Description      string     `json:"description" db:"description" binding:"required"`
	ShortDescription string     `json:"shortDescription" db:"short_description"`
	ThumbnailURL     string     `json:"thumbnailUrl" db:"thumbnail_url"`
	ProjectURL       string     `json:"projectUrl" db:"project_url"`
	GithubURL        string     `json:"githubUrl" db:"github_url"`
	Technologies     []string   `json:"technologies" db:"technologies"`
	Category         string     `json:"category" db:"category"`
	Featured         bool       `json:"featured" db:"featured"`
	DisplayOrder     int        `json:"displayOrder" db:"display_order"`
	Status           string     `json:"status" db:"status"`
	StartedAt        *time.Time `json:"startedAt,omitempty" db:"started_at"`
	CompletedAt      *time.Time `json:"completedAt,omitempty" db:"completed_at"`
	Slug             string     `json:"slug" db:"slug"`
	CreatedAt        time.Time  `json:"createdAt" db:"created_at"`
	UpdatedAt        time.Time  `json:"updatedAt" db:"updated_at"`
}

// CreateProjectRequest represents create project request payload
type CreateProjectRequest struct {
	Title            string     `json:"title" binding:"required"`
	Description      string     `json:"description" binding:"required"`
	ShortDescription string     `json:"shortDescription"`
	ThumbnailURL     string     `json:"thumbnailUrl"`
	ProjectURL       string     `json:"projectUrl"`
	GithubURL        string     `json:"githubUrl"`
	Technologies     []string   `json:"technologies"`
	Category         string     `json:"category"`
	Featured         bool       `json:"featured"`
	DisplayOrder     int        `json:"displayOrder"`
	Status           string     `json:"status"`
	StartedAt        *time.Time `json:"startedAt,omitempty"`
	CompletedAt      *time.Time `json:"completedAt,omitempty"`
}

// UpdateProjectRequest represents update project request payload
type UpdateProjectRequest struct {
	Title            string     `json:"title,omitempty"`
	Description      string     `json:"description,omitempty"`
	ShortDescription string     `json:"shortDescription,omitempty"`
	ThumbnailURL     string     `json:"thumbnailUrl,omitempty"`
	ProjectURL       string     `json:"projectUrl,omitempty"`
	GithubURL        string     `json:"githubUrl,omitempty"`
	Technologies     []string   `json:"technologies,omitempty"`
	Category         string     `json:"category,omitempty"`
	Featured         *bool      `json:"featured,omitempty"`
	DisplayOrder     *int       `json:"displayOrder,omitempty"`
	Status           string     `json:"status,omitempty"`
	StartedAt        *time.Time `json:"startedAt,omitempty"`
	CompletedAt      *time.Time `json:"completedAt,omitempty"`
}

// ProjectListResponse represents projects list response
type ProjectListResponse struct {
	Projects   []*Project `json:"projects"`
	Total      int64      `json:"total"`
	Page       int        `json:"page"`
	Limit      int        `json:"limit"`
	TotalPages int        `json:"total_pages"`
}
