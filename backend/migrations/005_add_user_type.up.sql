-- Add user_type column to differentiate admin and customer
ALTER TABLE users ADD COLUMN IF NOT EXISTS user_type VARCHAR(50) NOT NULL DEFAULT 'customer';

-- Update existing admin user to have user_type = 'admin'
UPDATE users SET user_type = 'admin' WHERE role = 'admin';

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_user_type ON users(user_type);

-- Add some sample customer users for testing
INSERT INTO users (email, password_hash, name, role, user_type, is_active) 
VALUES 
    ('customer1@example.com', '$2a$10$f/IdajxDdO9kpUkqsgjMpuHmYvQ4nzFzShgU5YFCcbiKEO241fLlW', 'Customer One', 'user', 'customer', true),
    ('customer2@example.com', '$2a$10$f/IdajxDdO9kpUkqsgjMpuHmYvQ4nzFzShgU5YFCcbiKEO241fLlW', 'Customer Two', 'user', 'customer', true)
ON CONFLICT (email) DO NOTHING;
