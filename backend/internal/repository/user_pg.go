package repository

import (
	"context"
	"database/sql"
	"fmt"
	"strings"
	"time"

	"github.com/jmoiron/sqlx"

	"portfolio/internal/domain/user"
)

// UserPostgresRepository implements user.Repository using PostgreSQL
type UserPostgresRepository struct {
	db *sqlx.DB
}

// NewUserPostgresRepository creates a new UserPostgresRepository instance
func NewUserPostgresRepository(db *sqlx.DB) user.Repository {
	return &UserPostgresRepository{db: db}
}

// Create creates a new user
func (r *UserPostgresRepository) Create(ctx context.Context, user *user.User) error {
	query := `
		INSERT INTO users (email, password_hash, name, role, user_type, is_active, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id`

	err := r.db.QueryRowxContext(ctx, query,
		user.Email, user.PasswordHash, user.Name, user.Role, user.UserType,
		user.IsActive, user.CreatedAt, user.UpdatedAt,
	).Scan(&user.ID)

	return err
}

// GetByID retrieves a user by ID
func (r *UserPostgresRepository) GetByID(ctx context.Context, id string) (*user.User, error) {
	var u user.User
	query := `
		SELECT id, email, password_hash, name, role, user_type, is_active, created_at, updated_at
		FROM users
		WHERE id = $1`

	err := r.db.GetContext(ctx, &u, query, id)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, err
		}
		return nil, err
	}

	return &u, nil
}

// GetByEmail retrieves a user by email
func (r *UserPostgresRepository) GetByEmail(ctx context.Context, email string) (*user.User, error) {
	var u user.User
	query := `
		SELECT id, email, password_hash, name, role, user_type, is_active, created_at, updated_at
		FROM users
		WHERE email = $1`

	err := r.db.GetContext(ctx, &u, query, email)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, err
		}
		return nil, err
	}

	return &u, nil
}

// Update updates a user
func (r *UserPostgresRepository) Update(ctx context.Context, id string, updates user.UpdateUserRequest) error {
	setParts := []string{}
	args := []interface{}{}
	argIndex := 1

	if updates.Name != "" {
		setParts = append(setParts, fmt.Sprintf("name = $%d", argIndex))
		args = append(args, updates.Name)
		argIndex++
	}

	if updates.Email != "" {
		setParts = append(setParts, fmt.Sprintf("email = $%d", argIndex))
		args = append(args, updates.Email)
		argIndex++
	}

	if updates.Role != "" {
		setParts = append(setParts, fmt.Sprintf("role = $%d", argIndex))
		args = append(args, updates.Role)
		argIndex++
	}

	if updates.IsActive != nil {
		setParts = append(setParts, fmt.Sprintf("is_active = $%d", argIndex))
		args = append(args, *updates.IsActive)
		argIndex++
	}

	if len(setParts) == 0 {
		return nil // No updates to perform
	}

	// Add updated_at
	setParts = append(setParts, fmt.Sprintf("updated_at = $%d", argIndex))
	args = append(args, time.Now())
	argIndex++

	// Add id for WHERE clause
	args = append(args, id)

	query := fmt.Sprintf("UPDATE users SET %s WHERE id = $%d", strings.Join(setParts, ", "), argIndex)

	_, err := r.db.ExecContext(ctx, query, args...)
	return err
}

// UpdatePassword updates user password
func (r *UserPostgresRepository) UpdatePassword(ctx context.Context, id string, hashedPassword string) error {
	query := `
		UPDATE users 
		SET password_hash = $1, updated_at = $2 
		WHERE id = $3`

	_, err := r.db.ExecContext(ctx, query, hashedPassword, time.Now(), id)
	return err
}

// Delete deletes a user
func (r *UserPostgresRepository) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM users WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}

// List retrieves all users with pagination
func (r *UserPostgresRepository) List(ctx context.Context, limit, offset int) ([]*user.User, error) {
	var users []*user.User
	query := `
		SELECT id, email, password, name, role, is_active, created_at, updated_at
		FROM users
		ORDER BY created_at DESC
		LIMIT $1 OFFSET $2`

	err := r.db.SelectContext(ctx, &users, query, limit, offset)
	return users, err
}

// Count returns the total number of users
func (r *UserPostgresRepository) Count(ctx context.Context) (int64, error) {
	var count int64
	query := `SELECT COUNT(*) FROM users`
	err := r.db.GetContext(ctx, &count, query)
	return count, err
}
