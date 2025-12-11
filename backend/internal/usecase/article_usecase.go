package usecase

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"strings"
	"time"

	"portfolio/internal/domain"
)

type articleUsecase struct {
	articleRepo  domain.ArticleRepository
	categoryRepo domain.CategoryRepository
	timeout      time.Duration
}

func NewArticleUsecase(articleRepo domain.ArticleRepository, categoryRepo domain.CategoryRepository, timeout time.Duration) domain.ArticleUsecase {
	return &articleUsecase{
		articleRepo:  articleRepo,
		categoryRepo: categoryRepo,
		timeout:      timeout,
	}
}

func (a *articleUsecase) GetArticles(ctx context.Context, params domain.ArticleListParams) (*domain.ArticleListResult, error) {
	ctx, cancel := context.WithTimeout(ctx, a.timeout)
	defer cancel()

	return a.articleRepo.GetAll(ctx, params)
}

func (a *articleUsecase) GetArticleByID(ctx context.Context, id string) (*domain.Article, error) {
	ctx, cancel := context.WithTimeout(ctx, a.timeout)
	defer cancel()

	if id == "" {
		return nil, domain.ErrArticleNotFound
	}

	return a.articleRepo.GetByID(ctx, id)
}

func (a *articleUsecase) GetArticleBySlug(ctx context.Context, slug string) (*domain.Article, error) {
	ctx, cancel := context.WithTimeout(ctx, a.timeout)
	defer cancel()

	if slug == "" {
		return nil, domain.ErrArticleNotFound
	}

	return a.articleRepo.GetBySlug(ctx, slug)
}

func (a *articleUsecase) GetFeaturedArticle(ctx context.Context) (*domain.Article, error) {
	ctx, cancel := context.WithTimeout(ctx, a.timeout)
	defer cancel()

	return a.articleRepo.GetFeatured(ctx)
}

func (a *articleUsecase) SearchArticles(ctx context.Context, params domain.SearchParams) (*domain.ArticleListResult, error) {
	ctx, cancel := context.WithTimeout(ctx, a.timeout)
	defer cancel()

	if strings.TrimSpace(params.Query) == "" {
		return &domain.ArticleListResult{
			Articles:   []*domain.Article{},
			Total:      0,
			Page:       params.Page,
			TotalPages: 0,
		}, nil
	}

	return a.articleRepo.Search(ctx, params)
}

func (a *articleUsecase) CreateArticle(ctx context.Context, req domain.CreateArticleRequest, authorID string) (*domain.Article, error) {
	ctx, cancel := context.WithTimeout(ctx, a.timeout)
	defer cancel()

	// Validate category exists
	_, err := a.categoryRepo.GetByID(ctx, req.CategoryID)
	if err != nil {
		return nil, domain.ErrCategoryNotFound
	}

	// Generate unique ID
	id, err := generateID()
	if err != nil {
		return nil, fmt.Errorf("failed to generate article ID: %w", err)
	}

	// Create article
	article := &domain.Article{
		ID:          id,
		Title:       req.Title,
		Excerpt:     req.Excerpt,
		Content:     req.Content,
		Featured:    req.Featured,
		Published:   req.Published,
		Tags:        req.Tags,
		PublishedAt: time.Now(),
		UpdatedAt:   time.Now(),
		Author: domain.Author{
			ID: authorID,
		},
	}

	// Generate slug
	article.GenerateSlug()

	// Calculate read time
	article.CalculateReadTime()

	// Save article
	err = a.articleRepo.Create(ctx, article)
	if err != nil {
		return nil, fmt.Errorf("failed to create article: %w", err)
	}

	// Fetch the complete article with relations
	return a.articleRepo.GetByID(ctx, article.ID)
}

func (a *articleUsecase) UpdateArticle(ctx context.Context, id string, req domain.UpdateArticleRequest) (*domain.Article, error) {
	ctx, cancel := context.WithTimeout(ctx, a.timeout)
	defer cancel()

	// Check if article exists
	existingArticle, err := a.articleRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	// Validate category if provided
	if req.CategoryID != "" && req.CategoryID != existingArticle.Category.ID {
		_, err := a.categoryRepo.GetByID(ctx, req.CategoryID)
		if err != nil {
			return nil, domain.ErrCategoryNotFound
		}
	}

	// Update article
	err = a.articleRepo.Update(ctx, id, req)
	if err != nil {
		return nil, fmt.Errorf("failed to update article: %w", err)
	}

	// Apply updates to existing article object to avoid additional query
	if req.Title != "" {
		existingArticle.Title = req.Title
		existingArticle.GenerateSlug()
	}
	if req.Excerpt != "" {
		existingArticle.Excerpt = req.Excerpt
	}
	if req.Content != "" {
		existingArticle.Content = req.Content
		existingArticle.CalculateReadTime()
	}
	if req.CategoryID != "" {
		existingArticle.Category.ID = req.CategoryID
	}
	if req.Tags != nil {
		existingArticle.Tags = req.Tags
	}
	if req.Featured != nil {
		existingArticle.Featured = *req.Featured
	}
	if req.Published != nil {
		existingArticle.Published = *req.Published
	}
	existingArticle.UpdatedAt = time.Now()

	return existingArticle, nil
}

func (a *articleUsecase) DeleteArticle(ctx context.Context, id string) error {
	ctx, cancel := context.WithTimeout(ctx, a.timeout)
	defer cancel()

	// Check if article exists
	_, err := a.articleRepo.GetByID(ctx, id)
	if err != nil {
		return err
	}

	return a.articleRepo.Delete(ctx, id)
}

func (a *articleUsecase) TrackArticleView(ctx context.Context, id string) error {
	ctx, cancel := context.WithTimeout(ctx, a.timeout)
	defer cancel()

	return a.articleRepo.IncrementViewCount(ctx, id)
}

func (a *articleUsecase) TrackArticleLike(ctx context.Context, id string) (int, error) {
	ctx, cancel := context.WithTimeout(ctx, a.timeout)
	defer cancel()

	return a.articleRepo.IncrementLikeCount(ctx, id)
}

func (a *articleUsecase) GetArticleStats(ctx context.Context, id string) (*domain.ArticleStats, error) {
	ctx, cancel := context.WithTimeout(ctx, a.timeout)
	defer cancel()

	return a.articleRepo.GetStats(ctx, id)
}

// Helper function to generate unique IDs
func generateID() (string, error) {
	bytes := make([]byte, 16)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}
