package user

import (
	"context"
)

// Repository interface defines the contract for user data operations
type Repository interface {
	// Create creates a new user
	Create(ctx context.Context, user *User) error
	
	// GetByID retrieves a user by ID
	GetByID(ctx context.Context, id uint) (*User, error)
	
	// GetByEmail retrieves a user by email
	GetByEmail(ctx context.Context, email string) (*User, error)
	
	// Update updates a user
	Update(ctx context.Context, id uint, updates UpdateUserRequest) error
	
	// Delete deletes a user
	Delete(ctx context.Context, id uint) error
	
	// List retrieves all users with pagination
	List(ctx context.Context, limit, offset int) ([]*User, error)
	
	// Count returns the total number of users
	Count(ctx context.Context) (int64, error)
}