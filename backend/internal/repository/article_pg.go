package repository

import (
	"context"
	"database/sql"
	"fmt"
	"strings"
	"time"

	"portfolio/internal/domain"

	"github.com/jmoiron/sqlx"
)

type articlePostgresRepository struct {
	db *sqlx.DB
}

func NewArticlePostgresRepository(db *sqlx.DB) domain.ArticleRepository {
	return &articlePostgresRepository{
		db: db,
	}
}

// Article database model
type articleDB struct {
	ID              string         `db:"id"`
	Title           string         `db:"title"`
	Excerpt         string         `db:"excerpt"`
	Content         sql.NullString `db:"content"`
	CategoryID      string         `db:"category_id"`
	CategoryName    string         `db:"category_name"`
	CategoryColor   string         `db:"category_color"`
	CategoryBgColor string         `db:"category_bg_color"`
	CategorySlug    string         `db:"category_slug"`
	PublishedAt     time.Time      `db:"published_at"`
	UpdatedAt       time.Time      `db:"updated_at"`
	ReadTime        int            `db:"read_time"`
	Slug            string         `db:"slug"`
	Featured        bool           `db:"featured"`
	Published       bool           `db:"published"`
	AuthorID        string         `db:"author_id"`
	AuthorName      string         `db:"author_name"`
	AuthorEmail     sql.NullString `db:"author_email"`
	AuthorAvatar    sql.NullString `db:"author_avatar"`
	ViewCount       int            `db:"view_count"`
	LikeCount       int            `db:"like_count"`
}

func (r *articlePostgresRepository) GetAll(ctx context.Context, params domain.ArticleListParams) (*domain.ArticleListResult, error) {
	var conditions []string
	var args []interface{}
	argIndex := 1

	// Build WHERE conditions
	if params.Category != "" {
		conditions = append(conditions, fmt.Sprintf("c.slug = $%d", argIndex))
		args = append(args, params.Category)
		argIndex++
	}

	if params.Featured != nil {
		conditions = append(conditions, fmt.Sprintf("a.featured = $%d", argIndex))
		args = append(args, *params.Featured)
		argIndex++
	}

	if params.Published != nil {
		conditions = append(conditions, fmt.Sprintf("a.published = $%d", argIndex))
		args = append(args, *params.Published)
		argIndex++
	} else {
		// Default to only published articles
		conditions = append(conditions, "a.published = true")
	}

	whereClause := ""
	if len(conditions) > 0 {
		whereClause = "WHERE " + strings.Join(conditions, " AND ")
	}

	// Calculate offset
	offset := (params.Page - 1) * params.Limit

	// Get total count
	countQuery := fmt.Sprintf(`
		SELECT COUNT(*) FROM articles a
		INNER JOIN categories c ON a.category_id = c.id
		INNER JOIN users u ON a.author_id = u.id
		%s`, whereClause)

	var total int
	err := r.db.GetContext(ctx, &total, countQuery, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to count articles: %w", err)
	}

	// Get articles
	query := fmt.Sprintf(`
		SELECT 
			a.id, a.title, a.excerpt, a.content, a.published_at, a.updated_at,
			a.read_time, a.slug, a.featured, a.published, a.view_count, a.like_count,
			c.id as category_id, c.name as category_name, c.color as category_color,
			c.bg_color as category_bg_color, c.slug as category_slug,
			u.id as author_id, u.name as author_name, u.email as author_email
		FROM articles a
		INNER JOIN categories c ON a.category_id = c.id
		INNER JOIN users u ON a.author_id = u.id
		%s
		ORDER BY a.published_at DESC
		LIMIT $%d OFFSET $%d`, whereClause, argIndex, argIndex+1)

	args = append(args, params.Limit, offset)

	var articleDBs []articleDB
	err = r.db.SelectContext(ctx, &articleDBs, query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to get articles: %w", err)
	}

	// Convert to domain models
	articles := make([]*domain.Article, len(articleDBs))
	for i, articleDB := range articleDBs {
		articles[i] = r.dbToArticle(&articleDB)
	}

	// Calculate total pages
	totalPages := (total + params.Limit - 1) / params.Limit

	return &domain.ArticleListResult{
		Articles:   articles,
		Total:      total,
		Page:       params.Page,
		TotalPages: totalPages,
	}, nil
}

func (r *articlePostgresRepository) GetByID(ctx context.Context, id string) (*domain.Article, error) {
	query := `
		SELECT 
			a.id, a.title, a.excerpt, a.content, a.published_at, a.updated_at,
			a.read_time, a.slug, a.featured, a.published, a.view_count, a.like_count,
			c.id as category_id, c.name as category_name, c.color as category_color,
			c.bg_color as category_bg_color, c.slug as category_slug,
			u.id as author_id, u.name as author_name, u.email as author_email
		FROM articles a
		INNER JOIN categories c ON a.category_id = c.id
		INNER JOIN users u ON a.author_id = u.id
		WHERE a.id = $1`

	var articleDB articleDB
	err := r.db.GetContext(ctx, &articleDB, query, id)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, domain.ErrArticleNotFound
		}
		return nil, fmt.Errorf("failed to get article: %w", err)
	}

	// Get tags
	tags, err := r.getArticleTags(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get article tags: %w", err)
	}

	article := r.dbToArticle(&articleDB)
	article.Tags = tags

	return article, nil
}

func (r *articlePostgresRepository) GetBySlug(ctx context.Context, slug string) (*domain.Article, error) {
	query := `
		SELECT 
			a.id, a.title, a.excerpt, a.content, a.published_at, a.updated_at,
			a.read_time, a.slug, a.featured, a.published, a.view_count, a.like_count,
			c.id as category_id, c.name as category_name, c.color as category_color,
			c.bg_color as category_bg_color, c.slug as category_slug,
			u.id as author_id, u.name as author_name, u.email as author_email
		FROM articles a
		INNER JOIN categories c ON a.category_id = c.id
		INNER JOIN users u ON a.author_id = u.id
		WHERE a.slug = $1 AND a.published = true`

	var articleDB articleDB
	err := r.db.GetContext(ctx, &articleDB, query, slug)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, domain.ErrArticleNotFound
		}
		return nil, fmt.Errorf("failed to get article: %w", err)
	}

	// Get tags
	tags, err := r.getArticleTags(ctx, articleDB.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to get article tags: %w", err)
	}

	article := r.dbToArticle(&articleDB)
	article.Tags = tags

	return article, nil
}

func (r *articlePostgresRepository) GetFeatured(ctx context.Context) (*domain.Article, error) {
	query := `
		SELECT 
			a.id, a.title, a.excerpt, a.content, a.published_at, a.updated_at,
			a.read_time, a.slug, a.featured, a.published, a.view_count, a.like_count,
			c.id as category_id, c.name as category_name, c.color as category_color,
			c.bg_color as category_bg_color, c.slug as category_slug,
			u.id as author_id, u.name as author_name, u.email as author_email
		FROM articles a
		INNER JOIN categories c ON a.category_id = c.id
		INNER JOIN users u ON a.author_id = u.id
		WHERE a.featured = true AND a.published = true
		ORDER BY a.published_at DESC
		LIMIT 1`

	var articleDB articleDB
	err := r.db.GetContext(ctx, &articleDB, query)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, domain.ErrArticleNotFound
		}
		return nil, fmt.Errorf("failed to get featured article: %w", err)
	}

	// Get tags
	tags, err := r.getArticleTags(ctx, articleDB.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to get article tags: %w", err)
	}

	article := r.dbToArticle(&articleDB)
	article.Tags = tags

	return article, nil
}

func (r *articlePostgresRepository) Search(ctx context.Context, params domain.SearchParams) (*domain.ArticleListResult, error) {
	searchTerm := "%" + strings.ToLower(params.Query) + "%"
	offset := (params.Page - 1) * params.Limit

	// Count total results
	countQuery := `
		SELECT COUNT(*) FROM articles a
		INNER JOIN categories c ON a.category_id = c.id
		WHERE a.published = true AND (
			LOWER(a.title) LIKE $1 OR 
			LOWER(a.excerpt) LIKE $1 OR 
			LOWER(a.content) LIKE $1
		)`

	var total int
	err := r.db.GetContext(ctx, &total, countQuery, searchTerm)
	if err != nil {
		return nil, fmt.Errorf("failed to count search results: %w", err)
	}

	// Get search results
	query := `
		SELECT 
			a.id, a.title, a.excerpt, a.content, a.published_at, a.updated_at,
			a.read_time, a.slug, a.featured, a.published, a.view_count, a.like_count,
			c.id as category_id, c.name as category_name, c.color as category_color,
			c.bg_color as category_bg_color, c.slug as category_slug,
			u.id as author_id, u.name as author_name, u.email as author_email
		FROM articles a
		INNER JOIN categories c ON a.category_id = c.id
		INNER JOIN users u ON a.author_id = u.id
		WHERE a.published = true AND (
			LOWER(a.title) LIKE $1 OR 
			LOWER(a.excerpt) LIKE $1 OR 
			LOWER(a.content) LIKE $1
		)
		ORDER BY a.published_at DESC
		LIMIT $2 OFFSET $3`

	var articleDBs []articleDB
	err = r.db.SelectContext(ctx, &articleDBs, query, searchTerm, params.Limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to search articles: %w", err)
	}

	// Convert to domain models
	articles := make([]*domain.Article, len(articleDBs))
	for i, articleDB := range articleDBs {
		articles[i] = r.dbToArticle(&articleDB)
	}

	// Calculate total pages
	totalPages := (total + params.Limit - 1) / params.Limit

	return &domain.ArticleListResult{
		Articles:   articles,
		Total:      total,
		Page:       params.Page,
		TotalPages: totalPages,
	}, nil
}

func (r *articlePostgresRepository) Create(ctx context.Context, article *domain.Article) error {
	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	// Insert article
	query := `
		INSERT INTO articles (
			id, title, excerpt, content, category_id, published_at, updated_at,
			read_time, slug, featured, published, author_id, view_count, like_count
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`

	content := sql.NullString{String: article.Content, Valid: article.Content != ""}

	_, err = tx.ExecContext(ctx, query,
		article.ID, article.Title, article.Excerpt, content,
		article.Category.ID, article.PublishedAt, article.UpdatedAt,
		article.ReadTime, article.Slug, article.Featured, article.Published,
		article.Author.ID, 0, 0, // view_count and like_count start at 0
	)
	if err != nil {
		return fmt.Errorf("failed to insert article: %w", err)
	}

	// Insert tags
	if len(article.Tags) > 0 {
		err = r.insertArticleTags(ctx, tx, article.ID, article.Tags)
		if err != nil {
			return fmt.Errorf("failed to insert article tags: %w", err)
		}
	}

	return tx.Commit()
}

func (r *articlePostgresRepository) Update(ctx context.Context, id string, updates domain.UpdateArticleRequest) error {
	// Build dynamic update query
	setParts := []string{}
	args := []interface{}{}
	argIndex := 1

	if updates.Title != "" {
		setParts = append(setParts, fmt.Sprintf("title = $%d", argIndex))
		args = append(args, updates.Title)
		argIndex++
	}

	if updates.Excerpt != "" {
		setParts = append(setParts, fmt.Sprintf("excerpt = $%d", argIndex))
		args = append(args, updates.Excerpt)
		argIndex++
	}

	if updates.Content != "" {
		setParts = append(setParts, fmt.Sprintf("content = $%d", argIndex))
		args = append(args, updates.Content)
		argIndex++
	}

	if updates.CategoryID != "" {
		setParts = append(setParts, fmt.Sprintf("category_id = $%d", argIndex))
		args = append(args, updates.CategoryID)
		argIndex++
	}

	if updates.Featured != nil {
		setParts = append(setParts, fmt.Sprintf("featured = $%d", argIndex))
		args = append(args, *updates.Featured)
		argIndex++
	}

	if updates.Published != nil {
		setParts = append(setParts, fmt.Sprintf("published = $%d", argIndex))
		args = append(args, *updates.Published)
		argIndex++
	}

	if len(setParts) == 0 {
		return nil // Nothing to update
	}

	// Always update updated_at
	setParts = append(setParts, fmt.Sprintf("updated_at = $%d", argIndex))
	args = append(args, time.Now())
	argIndex++

	// Add WHERE clause
	args = append(args, id)

	query := fmt.Sprintf("UPDATE articles SET %s WHERE id = $%d", strings.Join(setParts, ", "), argIndex)

	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	_, err = tx.ExecContext(ctx, query, args...)
	if err != nil {
		return fmt.Errorf("failed to update article: %w", err)
	}

	// Update tags if provided
	if updates.Tags != nil {
		// Delete existing tags
		_, err = tx.ExecContext(ctx, "DELETE FROM article_tags WHERE article_id = $1", id)
		if err != nil {
			return fmt.Errorf("failed to delete existing tags: %w", err)
		}

		// Insert new tags
		if len(updates.Tags) > 0 {
			err = r.insertArticleTags(ctx, tx, id, updates.Tags)
			if err != nil {
				return fmt.Errorf("failed to insert updated tags: %w", err)
			}
		}
	}

	return tx.Commit()
}

func (r *articlePostgresRepository) Delete(ctx context.Context, id string) error {
	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	// Delete tags first (foreign key constraint)
	_, err = tx.ExecContext(ctx, "DELETE FROM article_tags WHERE article_id = $1", id)
	if err != nil {
		return fmt.Errorf("failed to delete article tags: %w", err)
	}

	// Delete article
	_, err = tx.ExecContext(ctx, "DELETE FROM articles WHERE id = $1", id)
	if err != nil {
		return fmt.Errorf("failed to delete article: %w", err)
	}

	return tx.Commit()
}

func (r *articlePostgresRepository) IncrementViewCount(ctx context.Context, id string) error {
	_, err := r.db.ExecContext(ctx, "UPDATE articles SET view_count = view_count + 1 WHERE id = $1", id)
	return err
}

func (r *articlePostgresRepository) IncrementLikeCount(ctx context.Context, id string) (int, error) {
	var newCount int
	err := r.db.GetContext(ctx, &newCount,
		"UPDATE articles SET like_count = like_count + 1 WHERE id = $1 RETURNING like_count", id)
	return newCount, err
}

func (r *articlePostgresRepository) GetStats(ctx context.Context, id string) (*domain.ArticleStats, error) {
	query := "SELECT view_count, like_count FROM articles WHERE id = $1"

	var stats domain.ArticleStats
	err := r.db.GetContext(ctx, &stats, query, id)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, domain.ErrArticleNotFound
		}
		return nil, fmt.Errorf("failed to get article stats: %w", err)
	}

	stats.ArticleID = id
	// TODO: Get comments count from comments table
	stats.Comments = 0

	return &stats, nil
}

// Helper methods

func (r *articlePostgresRepository) dbToArticle(articleDB *articleDB) *domain.Article {
	content := ""
	if articleDB.Content.Valid {
		content = articleDB.Content.String
	}

	authorAvatar := ""
	if articleDB.AuthorAvatar.Valid {
		authorAvatar = articleDB.AuthorAvatar.String
	}

	authorEmail := ""
	if articleDB.AuthorEmail.Valid {
		authorEmail = articleDB.AuthorEmail.String
	}

	return &domain.Article{
		ID:      articleDB.ID,
		Title:   articleDB.Title,
		Excerpt: articleDB.Excerpt,
		Content: content,
		Category: domain.Category{
			ID:      articleDB.CategoryID,
			Name:    articleDB.CategoryName,
			Color:   articleDB.CategoryColor,
			BgColor: articleDB.CategoryBgColor,
			Slug:    articleDB.CategorySlug,
		},
		PublishedAt: articleDB.PublishedAt,
		UpdatedAt:   articleDB.UpdatedAt,
		ReadTime:    articleDB.ReadTime,
		Slug:        articleDB.Slug,
		Featured:    articleDB.Featured,
		Published:   articleDB.Published,
		Author: domain.Author{
			ID:     articleDB.AuthorID,
			Name:   articleDB.AuthorName,
			Email:  authorEmail,
			Avatar: authorAvatar,
		},
		ViewCount: articleDB.ViewCount,
		LikeCount: articleDB.LikeCount,
	}
}

func (r *articlePostgresRepository) getArticleTags(ctx context.Context, articleID string) ([]string, error) {
	query := "SELECT name FROM article_tags WHERE article_id = $1 ORDER BY name"

	var tags []string
	err := r.db.SelectContext(ctx, &tags, query, articleID)
	if err != nil {
		return nil, err
	}

	return tags, nil
}

func (r *articlePostgresRepository) insertArticleTags(ctx context.Context, tx *sqlx.Tx, articleID string, tags []string) error {
	for _, tag := range tags {
		if strings.TrimSpace(tag) == "" {
			continue
		}

		_, err := tx.ExecContext(ctx,
			"INSERT INTO article_tags (article_id, name) VALUES ($1, $2)",
			articleID, strings.TrimSpace(tag))
		if err != nil {
			return err
		}
	}
	return nil
}
