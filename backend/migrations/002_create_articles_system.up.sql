-- Migration: Create articles system tables
-- Up migration

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    color VARCHAR(100) NOT NULL,
    bg_color VARCHAR(100) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Articles table
CREATE TABLE IF NOT EXISTS articles (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    excerpt TEXT NOT NULL,
    content TEXT,
    category_id VARCHAR(255) NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    published_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    read_time INTEGER NOT NULL DEFAULT 1,
    slug VARCHAR(500) NOT NULL UNIQUE,
    featured BOOLEAN NOT NULL DEFAULT FALSE,
    published BOOLEAN NOT NULL DEFAULT FALSE,
    author_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    view_count INTEGER NOT NULL DEFAULT 0,
    like_count INTEGER NOT NULL DEFAULT 0
);

-- Article tags table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS article_tags (
    id SERIAL PRIMARY KEY,
    article_id VARCHAR(255) NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(article_id, name)
);

-- Newsletter subscriptions table
CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    subscribed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    token VARCHAR(255) NOT NULL UNIQUE -- for unsubscribe functionality
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_articles_category_id ON articles(category_id);
CREATE INDEX IF NOT EXISTS idx_articles_author_id ON articles(author_id);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_featured ON articles(featured) WHERE featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published) WHERE published = TRUE;
CREATE INDEX IF NOT EXISTS idx_article_tags_article_id ON article_tags(article_id);
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_active ON newsletter_subscriptions(active) WHERE active = TRUE;

-- Full-text search index for article content
CREATE INDEX IF NOT EXISTS idx_articles_content_search ON articles USING gin(to_tsvector('english', title || ' ' || excerpt || ' ' || COALESCE(content, '')));

-- Insert default categories
INSERT INTO categories (id, name, color, bg_color, slug) VALUES
    ('arch-001', 'Architecture', 'text-green-300', 'bg-green-500/20', 'architecture'),
    ('back-001', 'Backend', 'text-purple-300', 'bg-purple-500/20', 'backend'),
    ('mobi-001', 'Mobile', 'text-blue-300', 'bg-blue-500/20', 'mobile'),
    ('fron-001', 'Frontend', 'text-cyan-300', 'bg-cyan-500/20', 'frontend'),
    ('uxui-001', 'UX/UI', 'text-yellow-300', 'bg-yellow-500/20', 'ux-ui'),
    ('devo-001', 'DevOps', 'text-indigo-300', 'bg-indigo-500/20', 'devops')
ON CONFLICT (id) DO NOTHING;

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for articles table
DROP TRIGGER IF EXISTS update_articles_updated_at ON articles;
CREATE TRIGGER update_articles_updated_at
    BEFORE UPDATE ON articles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for categories table
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();