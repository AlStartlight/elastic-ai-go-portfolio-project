package domain

import (
	"context"
	"errors"
	"regexp"
	"strings"
	"time"
)

// Article domain entity
type Article struct {
	ID          string    `json:"id"`
	Title       string    `json:"title"`
	Excerpt     string    `json:"excerpt"`
	Content     string    `json:"content"`
	Thumbnail   string    `json:"thumbnail"`
	Category    Category  `json:"category"`
	PublishedAt time.Time `json:"publishedAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
	ReadTime    int       `json:"readTime"` // in minutes
	Slug        string    `json:"slug"`
	Featured    bool      `json:"featured"`
	Published   bool      `json:"published"`
	Author      Author    `json:"author"`
	Tags        []string  `json:"tags"`
	ViewCount   int       `json:"viewCount"`
	LikeCount   int       `json:"likeCount"`
}

type Category struct {
	ID      string `json:"id" db:"id"`
	Name    string `json:"name" db:"name"`
	Color   string `json:"color" db:"color"`      // e.g., "text-green-300"
	BgColor string `json:"bgColor" db:"bg_color"` // e.g., "bg-green-500/20"
	Slug    string `json:"slug" db:"slug"`
}

type Author struct {
	ID     string `json:"id"`
	Name   string `json:"name"`
	Email  string `json:"email"`
	Avatar string `json:"avatar"`
	Bio    string `json:"bio"`
}

// Newsletter domain entity
type Newsletter struct {
	ID           string    `json:"id"`
	Email        string    `json:"email"`
	SubscribedAt time.Time `json:"subscribedAt"`
	Active       bool      `json:"active"`
	Token        string    `json:"token"` // for unsubscribe
}

// Analytics domain entity
type ArticleStats struct {
	ArticleID string `json:"articleId"`
	Views     int    `json:"views"`
	Likes     int    `json:"likes"`
	Comments  int    `json:"comments"`
}

// Request/Response DTOs
type ArticleListParams struct {
	Page      int    `json:"page"`
	Limit     int    `json:"limit"`
	Category  string `json:"category,omitempty"`
	Featured  *bool  `json:"featured,omitempty"`
	Published *bool  `json:"published,omitempty"`
}

type ArticleListResult struct {
	Articles   []*Article `json:"articles"`
	Total      int        `json:"total"`
	Page       int        `json:"page"`
	TotalPages int        `json:"totalPages"`
}

type SearchParams struct {
	Query string `json:"query"`
	Page  int    `json:"page"`
	Limit int    `json:"limit"`
}

type CreateArticleRequest struct {
	Title      string   `json:"title" binding:"required"`
	Excerpt    string   `json:"excerpt" binding:"required"`
	Content    string   `json:"content" binding:"required"`
	CategoryID string   `json:"categoryId" binding:"required"`
	Featured   bool     `json:"featured"`
	Published  bool     `json:"published"`
	Tags       []string `json:"tags"`
}

type UpdateArticleRequest struct {
	Title      string   `json:"title,omitempty"`
	Excerpt    string   `json:"excerpt,omitempty"`
	Content    string   `json:"content,omitempty"`
	Thumbnail  string   `json:"thumbnail,omitempty"`
	CategoryID string   `json:"categoryId,omitempty"`
	Slug       string   `json:"slug,omitempty"`
	ReadTime   int      `json:"readTime,omitempty"`
	Featured   *bool    `json:"featured,omitempty"`
	Published  *bool    `json:"published,omitempty"`
	Tags       []string `json:"tags,omitempty"`
}

// Errors
var (
	ErrArticleNotFound         = errors.New("article not found")
	ErrCategoryNotFound        = errors.New("category not found")
	ErrEmailAlreadySubscribed  = errors.New("email already subscribed")
	ErrEmailNotSubscribed      = errors.New("email not subscribed")
	ErrInvalidUnsubscribeToken = errors.New("invalid unsubscribe token")
	ErrSlugAlreadyExists       = errors.New("slug already exists")
)

// Repository interfaces
type ArticleRepository interface {
	GetAll(ctx context.Context, params ArticleListParams) (*ArticleListResult, error)
	GetByID(ctx context.Context, id string) (*Article, error)
	GetBySlug(ctx context.Context, slug string) (*Article, error)
	GetFeatured(ctx context.Context) (*Article, error)
	Search(ctx context.Context, params SearchParams) (*ArticleListResult, error)
	Create(ctx context.Context, article *Article) error
	Update(ctx context.Context, id string, updates UpdateArticleRequest) error
	Delete(ctx context.Context, id string) error
	IncrementViewCount(ctx context.Context, id string) error
	IncrementLikeCount(ctx context.Context, id string) (int, error)
	GetStats(ctx context.Context, id string) (*ArticleStats, error)
}

type CategoryRepository interface {
	GetAll(ctx context.Context) ([]*Category, error)
	GetByID(ctx context.Context, id string) (*Category, error)
	GetBySlug(ctx context.Context, slug string) (*Category, error)
	Create(ctx context.Context, category *Category) error
	Update(ctx context.Context, id string, category *Category) error
	Delete(ctx context.Context, id string) error
}

type NewsletterRepository interface {
	Subscribe(ctx context.Context, email string) error
	Unsubscribe(ctx context.Context, email, token string) error
	IsSubscribed(ctx context.Context, email string) (bool, error)
	GetSubscribers(ctx context.Context) ([]*Newsletter, error)
}

// Use case interfaces
type ArticleUsecase interface {
	GetArticles(ctx context.Context, params ArticleListParams) (*ArticleListResult, error)
	GetArticleByID(ctx context.Context, id string) (*Article, error)
	GetArticleBySlug(ctx context.Context, slug string) (*Article, error)
	GetFeaturedArticle(ctx context.Context) (*Article, error)
	SearchArticles(ctx context.Context, params SearchParams) (*ArticleListResult, error)
	CreateArticle(ctx context.Context, req CreateArticleRequest, authorID string) (*Article, error)
	UpdateArticle(ctx context.Context, id string, req UpdateArticleRequest) (*Article, error)
	DeleteArticle(ctx context.Context, id string) error
	TrackArticleView(ctx context.Context, id string) error
	TrackArticleLike(ctx context.Context, id string) (int, error)
	GetArticleStats(ctx context.Context, id string) (*ArticleStats, error)
	GetDefaultAuthorID(ctx context.Context) (string, error)
}

type NewsletterUsecase interface {
	Subscribe(ctx context.Context, email string) error
	Unsubscribe(ctx context.Context, email, token string) error
	GetSubscribers(ctx context.Context) ([]*Newsletter, error)
}

type CategoryUsecase interface {
	GetCategories(ctx context.Context) ([]*Category, error)
	GetCategoryByID(ctx context.Context, id string) (*Category, error)
	GetCategoryBySlug(ctx context.Context, slug string) (*Category, error)
	CreateCategory(ctx context.Context, category *Category) error
	UpdateCategory(ctx context.Context, id string, category *Category) error
	DeleteCategory(ctx context.Context, id string) error
}

// Utility functions
func (a *Article) CalculateReadTime() {
	// Rough estimate: 200 words per minute
	wordCount := len(strings.Fields(a.Content))
	a.ReadTime = max(1, wordCount/200)
}

func (a *Article) GenerateSlug() {
	// Convert to lowercase
	slug := strings.ToLower(strings.TrimSpace(a.Title))

	// Replace spaces with hyphens
	slug = strings.ReplaceAll(slug, " ", "-")

	// Remove or replace special characters
	// Keep only alphanumeric characters, hyphens, and underscores
	reg := regexp.MustCompile("[^a-z0-9-_]+")
	slug = reg.ReplaceAllString(slug, "")

	// Remove multiple consecutive hyphens
	reg = regexp.MustCompile("-+")
	slug = reg.ReplaceAllString(slug, "-")

	// Trim hyphens from start and end
	slug = strings.Trim(slug, "-")

	a.Slug = slug
}

func max(a, b int) int {
	if a > b {
		return a
	}
	return b
}
