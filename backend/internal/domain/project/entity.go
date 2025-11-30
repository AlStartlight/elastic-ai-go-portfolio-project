package project

import (
	"time"
)

// Project represents a portfolio project entity
type Project struct {
	ID          uint      `json:"id" db:"id"`
	Title       string    `json:"title" db:"title" binding:"required"`
	Description string    `json:"description" db:"description" binding:"required"`
	TechStack   []string  `json:"tech_stack" db:"tech_stack"`
	ImageURL    string    `json:"image_url" db:"image_url"`
	ProjectURL  string    `json:"project_url" db:"project_url"`
	GithubURL   string    `json:"github_url" db:"github_url"`
	IsActive    bool      `json:"is_active" db:"is_active"`
	Order       int       `json:"order" db:"order"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time `json:"updated_at" db:"updated_at"`
}

// CreateProjectRequest represents create project request payload
type CreateProjectRequest struct {
	Title       string   `json:"title" binding:"required"`
	Description string   `json:"description" binding:"required"`
	TechStack   []string `json:"tech_stack"`
	ImageURL    string   `json:"image_url"`
	ProjectURL  string   `json:"project_url"`
	GithubURL   string   `json:"github_url"`
	IsActive    bool     `json:"is_active"`
	Order       int      `json:"order"`
}

// UpdateProjectRequest represents update project request payload
type UpdateProjectRequest struct {
	Title       string   `json:"title,omitempty"`
	Description string   `json:"description,omitempty"`
	TechStack   []string `json:"tech_stack,omitempty"`
	ImageURL    string   `json:"image_url,omitempty"`
	ProjectURL  string   `json:"project_url,omitempty"`
	GithubURL   string   `json:"github_url,omitempty"`
	IsActive    *bool    `json:"is_active,omitempty"`
	Order       *int     `json:"order,omitempty"`
}

// ProjectListResponse represents projects list response
type ProjectListResponse struct {
	Projects   []*Project `json:"projects"`
	Total      int64      `json:"total"`
	Page       int        `json:"page"`
	Limit      int        `json:"limit"`
	TotalPages int        `json:"total_pages"`
}