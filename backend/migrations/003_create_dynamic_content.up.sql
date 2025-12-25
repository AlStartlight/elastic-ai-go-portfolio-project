-- Homepage Content
CREATE TABLE IF NOT EXISTS homepage_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section VARCHAR(100) NOT NULL UNIQUE,
    title VARCHAR(255),
    subtitle VARCHAR(255),
    description TEXT,
    image_url VARCHAR(500),
    cta_primary_text VARCHAR(100),
    cta_primary_link VARCHAR(255),
    cta_secondary_text VARCHAR(100),
    cta_secondary_link VARCHAR(255),
    metadata JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default hero content
INSERT INTO homepage_content (section, title, description, image_url, cta_primary_text, cta_primary_link, cta_secondary_text, cta_secondary_link) 
VALUES (
    'hero',
    E'FULL STACK\nDEVELOPER',
    'Professional Full Stack Developer with expertise in React, TypeScript, Go, and modern web technologies.',
    'sabas.png',
    'View Projects',
    '/projects',
    'Download CV',
    '/cv.pdf'
);

-- Tech Stacks
CREATE TABLE IF NOT EXISTS tech_stacks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    category VARCHAR(50),
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default tech stacks
INSERT INTO tech_stacks (title, description, icon, category, display_order) VALUES
('Mobile', 'React Native, Kotlin Multi Platform, SwiftUI', '📱', 'mobile', 1),
('Frontend', 'Nextjs, React, TypeScript, Tailwind CSS', '🎨', 'frontend', 2),
('Backend', 'Golang, Node.js, PostgreSQL, Redis', '⚙️', 'backend', 3),
('DevOps', 'Docker, Kubernetes, CI/CD, AWS', '🚀', 'devops', 4);

-- Projects Enhancement
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    short_description VARCHAR(500),
    thumbnail_url VARCHAR(500),
    project_url VARCHAR(500),
    github_url VARCHAR(500),
    technologies JSONB DEFAULT '[]'::jsonb,
    category VARCHAR(100),
    featured BOOLEAN DEFAULT false,
    display_order INT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'published',
    started_at DATE,
    completed_at DATE,
    slug VARCHAR(255) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_homepage_section ON homepage_content(section);
CREATE INDEX idx_tech_stacks_active ON tech_stacks(is_active);
CREATE INDEX idx_tech_stacks_order ON tech_stacks(display_order);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_featured ON projects(featured);
