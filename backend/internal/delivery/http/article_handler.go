// Example API endpoint handlers for Go backend
// This shows the backend structure to match the frontend components

package handler

import (
	"net/http"
	"strconv"

	"portfolio/internal/domain"

	"github.com/gin-gonic/gin"
)

type ArticleHandler struct {
	articleUsecase    domain.ArticleUsecase
	newsletterUsecase domain.NewsletterUsecase
}

func NewArticleHandler(articleUC domain.ArticleUsecase, newsletterUC domain.NewsletterUsecase) *ArticleHandler {
	return &ArticleHandler{
		articleUsecase:    articleUC,
		newsletterUsecase: newsletterUC,
	}
}

// Article endpoints

type ArticleResponse struct {
	ID          string                `json:"id"`
	Title       string                `json:"title"`
	Excerpt     string                `json:"excerpt"`
	Content     string                `json:"content,omitempty"`
	Category    CategoryResponse      `json:"category"`
	PublishedAt string                `json:"publishedAt"`
	ReadTime    int                   `json:"readTime"`
	Slug        string                `json:"slug"`
	Featured    bool                  `json:"featured"`
	Author      AuthorResponse        `json:"author"`
	Tags        []string              `json:"tags,omitempty"`
	Stats       *ArticleStatsResponse `json:"stats,omitempty"`
}

type CategoryResponse struct {
	Name    string `json:"name"`
	Color   string `json:"color"`
	BgColor string `json:"bgColor"`
}

type AuthorResponse struct {
	Name   string `json:"name"`
	Avatar string `json:"avatar,omitempty"`
}

type ArticleStatsResponse struct {
	Views    int `json:"views"`
	Likes    int `json:"likes"`
	Comments int `json:"comments"`
}

type ArticleListResponse struct {
	Articles   []ArticleResponse `json:"articles"`
	Total      int               `json:"total"`
	Page       int               `json:"page"`
	TotalPages int               `json:"totalPages"`
}

// GET /api/articles
func (h *ArticleHandler) GetArticles(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	category := c.Query("category")
	featured := c.Query("featured") == "true"

	params := domain.ArticleListParams{
		Page:     page,
		Limit:    limit,
		Category: category,
		Featured: &featured,
	}

	result, err := h.articleUsecase.GetArticles(c.Request.Context(), params)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	response := ArticleListResponse{
		Articles:   mapArticlesToResponse(result.Articles),
		Total:      result.Total,
		Page:       result.Page,
		TotalPages: result.TotalPages,
	}

	c.JSON(http.StatusOK, response)
}

// GET /api/articles/featured
func (h *ArticleHandler) GetFeaturedArticle(c *gin.Context) {
	article, err := h.articleUsecase.GetFeaturedArticle(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	response := mapArticleToResponse(article)
	c.JSON(http.StatusOK, response)
}

// GET /api/articles/:slug
func (h *ArticleHandler) GetArticle(c *gin.Context) {
	slug := c.Param("slug")

	article, err := h.articleUsecase.GetArticleBySlug(c.Request.Context(), slug)
	if err != nil {
		if err == domain.ErrArticleNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Article not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Track article view
	go h.articleUsecase.TrackArticleView(c.Request.Context(), article.ID)

	response := mapArticleToResponse(article)
	c.JSON(http.StatusOK, response)
}

// POST /api/articles
func (h *ArticleHandler) CreateArticle(c *gin.Context) {
	var req domain.CreateArticleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// TODO: Get author ID from JWT token
	// For now, use a default author ID
	authorID := "default-author-id"

	article, err := h.articleUsecase.CreateArticle(c.Request.Context(), req, authorID)
	if err != nil {
		if err == domain.ErrCategoryNotFound {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Category not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	response := mapArticleToResponse(article)
	c.JSON(http.StatusCreated, response)
}

// PUT /api/articles/:id
func (h *ArticleHandler) UpdateArticle(c *gin.Context) {
	articleID := c.Param("id")

	var req domain.UpdateArticleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	article, err := h.articleUsecase.UpdateArticle(c.Request.Context(), articleID, req)
	if err != nil {
		if err == domain.ErrArticleNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Article not found"})
			return
		}
		if err == domain.ErrCategoryNotFound {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Category not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	response := mapArticleToResponse(article)
	c.JSON(http.StatusOK, response)
}

// DELETE /api/articles/:id
func (h *ArticleHandler) DeleteArticle(c *gin.Context) {
	articleID := c.Param("id")

	err := h.articleUsecase.DeleteArticle(c.Request.Context(), articleID)
	if err != nil {
		if err == domain.ErrArticleNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Article not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Article deleted successfully"})
}

// GET /api/categories
func (h *ArticleHandler) GetCategories(c *gin.Context) {
	// TODO: Implement category usecase
	categories := []CategoryResponse{
		{Name: "Architecture", Color: "text-green-300", BgColor: "bg-green-500/20"},
		{Name: "Backend", Color: "text-purple-300", BgColor: "bg-purple-500/20"},
		{Name: "Mobile", Color: "text-blue-300", BgColor: "bg-blue-500/20"},
		{Name: "Frontend", Color: "text-cyan-300", BgColor: "bg-cyan-500/20"},
		{Name: "UX/UI", Color: "text-yellow-300", BgColor: "bg-yellow-500/20"},
		{Name: "DevOps", Color: "text-indigo-300", BgColor: "bg-indigo-500/20"},
	}

	c.JSON(http.StatusOK, categories)
}

// GET /api/articles/search
func (h *ArticleHandler) SearchArticles(c *gin.Context) {
	query := c.Query("q")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

	if query == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Search query is required"})
		return
	}

	params := domain.SearchParams{
		Query: query,
		Page:  page,
		Limit: limit,
	}

	result, err := h.articleUsecase.SearchArticles(c.Request.Context(), params)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	response := ArticleListResponse{
		Articles:   mapArticlesToResponse(result.Articles),
		Total:      result.Total,
		Page:       result.Page,
		TotalPages: result.TotalPages,
	}

	c.JSON(http.StatusOK, response)
}

// Newsletter endpoints

type NewsletterSubscribeRequest struct {
	Email string `json:"email" binding:"required,email"`
}

type NewsletterResponse struct {
	Message string `json:"message"`
}

// POST /api/newsletter/subscribe
func (h *ArticleHandler) SubscribeNewsletter(c *gin.Context) {
	var req NewsletterSubscribeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := h.newsletterUsecase.Subscribe(c.Request.Context(), req.Email)
	if err != nil {
		if err == domain.ErrEmailAlreadySubscribed {
			c.JSON(http.StatusConflict, gin.H{"error": "Email already subscribed"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	response := NewsletterResponse{
		Message: "Successfully subscribed! Check your email for confirmation.",
	}
	c.JSON(http.StatusOK, response)
}

// POST /api/newsletter/unsubscribe
func (h *ArticleHandler) UnsubscribeNewsletter(c *gin.Context) {
	type Request struct {
		Email string `json:"email" binding:"required,email"`
		Token string `json:"token" binding:"required"`
	}

	var req Request
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := h.newsletterUsecase.Unsubscribe(c.Request.Context(), req.Email, req.Token)
	if err != nil {
		if err == domain.ErrInvalidUnsubscribeToken {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid unsubscribe token"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	response := NewsletterResponse{
		Message: "Successfully unsubscribed from newsletter.",
	}
	c.JSON(http.StatusOK, response)
}

// Analytics endpoints

// POST /api/analytics/articles/:id/view
func (h *ArticleHandler) TrackArticleView(c *gin.Context) {
	articleID := c.Param("id")

	err := h.articleUsecase.TrackArticleView(c.Request.Context(), articleID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.Status(http.StatusOK)
}

// POST /api/analytics/articles/:id/like
func (h *ArticleHandler) TrackArticleLike(c *gin.Context) {
	articleID := c.Param("id")

	likes, err := h.articleUsecase.TrackArticleLike(c.Request.Context(), articleID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"likes": likes})
}

// GET /api/analytics/articles/:id/stats
func (h *ArticleHandler) GetArticleStats(c *gin.Context) {
	articleID := c.Param("id")

	stats, err := h.articleUsecase.GetArticleStats(c.Request.Context(), articleID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	response := ArticleStatsResponse{
		Views:    stats.Views,
		Likes:    stats.Likes,
		Comments: stats.Comments,
	}

	c.JSON(http.StatusOK, response)
}

// Helper functions

func mapArticleToResponse(article *domain.Article) ArticleResponse {
	return ArticleResponse{
		ID:      article.ID,
		Title:   article.Title,
		Excerpt: article.Excerpt,
		Content: article.Content,
		Category: CategoryResponse{
			Name:    article.Category.Name,
			Color:   article.Category.Color,
			BgColor: article.Category.BgColor,
		},
		PublishedAt: article.PublishedAt.Format("2006-01-02"),
		ReadTime:    article.ReadTime,
		Slug:        article.Slug,
		Featured:    article.Featured,
		Author: AuthorResponse{
			Name:   article.Author.Name,
			Avatar: article.Author.Avatar,
		},
		Tags: article.Tags,
	}
}

func mapArticlesToResponse(articles []*domain.Article) []ArticleResponse {
	responses := make([]ArticleResponse, len(articles))
	for i, article := range articles {
		responses[i] = mapArticleToResponse(article)
	}
	return responses
}

// Route registration
func (h *ArticleHandler) RegisterRoutes(r *gin.RouterGroup) {
	articles := r.Group("/articles")
	{
		articles.GET("", h.GetArticles)
		articles.POST("", h.CreateArticle)
		articles.GET("/featured", h.GetFeaturedArticle)
		articles.GET("/search", h.SearchArticles)
		articles.GET("/:slug", h.GetArticle)
		articles.PUT("/:id", h.UpdateArticle)
		articles.DELETE("/:id", h.DeleteArticle)
	}

	categories := r.Group("/categories")
	{
		categories.GET("", h.GetCategories)
	}

	newsletter := r.Group("/newsletter")
	{
		newsletter.POST("/subscribe", h.SubscribeNewsletter)
		newsletter.POST("/unsubscribe", h.UnsubscribeNewsletter)
	}

	analytics := r.Group("/analytics")
	{
		analytics.POST("/articles/:id/view", h.TrackArticleView)
		analytics.POST("/articles/:id/like", h.TrackArticleLike)
		analytics.GET("/articles/:id/stats", h.GetArticleStats)
	}
}
