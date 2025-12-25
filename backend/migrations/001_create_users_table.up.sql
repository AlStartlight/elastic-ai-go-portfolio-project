-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on email for faster lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Insert default admin user
-- Email: admin@portfolio.com
-- Password: admin123 (hashed with bcrypt)
-- Note: Please change this password after first login!
INSERT INTO users (email, password_hash, name, role, is_active) 
VALUES (
    'admin@portfolio.com',
    '$2a$10$f/IdajxDdO9kpUkqsgjMpuHmYvQ4nzFzShgU5YFCcbiKEO241fLlW',
    'Admin',
    'admin',
    true
);
