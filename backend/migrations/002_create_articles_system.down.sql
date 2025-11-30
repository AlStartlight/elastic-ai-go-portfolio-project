-- Migration: Drop articles system tables
-- Down migration

-- Drop triggers
DROP TRIGGER IF EXISTS update_articles_updated_at ON articles;
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;

-- Drop function
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop indexes
DROP INDEX IF EXISTS idx_articles_content_search;
DROP INDEX IF EXISTS idx_newsletter_active;
DROP INDEX IF EXISTS idx_newsletter_email;
DROP INDEX IF EXISTS idx_article_tags_article_id;
DROP INDEX IF EXISTS idx_articles_published;
DROP INDEX IF EXISTS idx_articles_featured;
DROP INDEX IF EXISTS idx_articles_slug;
DROP INDEX IF EXISTS idx_articles_published_at;
DROP INDEX IF EXISTS idx_articles_author_id;
DROP INDEX IF EXISTS idx_articles_category_id;

-- Drop tables (in reverse order due to foreign key constraints)
DROP TABLE IF EXISTS newsletter_subscriptions;
DROP TABLE IF EXISTS article_tags;
DROP TABLE IF EXISTS articles;
DROP TABLE IF EXISTS categories;