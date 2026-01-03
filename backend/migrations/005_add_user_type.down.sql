-- Rollback: Remove user_type column
DROP INDEX IF EXISTS idx_users_user_type;
ALTER TABLE users DROP COLUMN IF EXISTS user_type;
