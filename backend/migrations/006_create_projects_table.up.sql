-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    short_description TEXT,
    thumbnail_url VARCHAR(500),
    project_url VARCHAR(500),
    github_url VARCHAR(500),
    technologies TEXT[],
    category VARCHAR(100),
    featured BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'published',
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    slug VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create index on slug for faster lookups
CREATE INDEX idx_projects_slug ON projects(slug);

-- Create index on status for filtering
CREATE INDEX idx_projects_status ON projects(status);

-- Create index on featured for filtering
CREATE INDEX idx_projects_featured ON projects(featured);

-- Create index on category for filtering
CREATE INDEX idx_projects_category ON projects(category);
