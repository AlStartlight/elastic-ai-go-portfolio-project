package user

import (
	"time"
)

// User represents a user entity
type User struct {
	ID           string    `json:"id" db:"id"`
	Email        string    `json:"email" db:"email" binding:"required,email"`
	PasswordHash string    `json:"-" db:"password_hash" binding:"required,min=6"`
	Name         string    `json:"name" db:"name" binding:"required"`
	Role         string    `json:"role" db:"role"`
	UserType     string    `json:"user_type" db:"user_type"` // admin or customer
	IsActive     bool      `json:"is_active" db:"is_active"`
	CreatedAt    time.Time `json:"created_at" db:"created_at"`
	UpdatedAt    time.Time `json:"updated_at" db:"updated_at"`
}

// UserProfile represents user profile response
type UserProfile struct {
	ID       string `json:"id"`
	Email    string `json:"email"`
	Name     string `json:"name"`
	Role     string `json:"role"`
	UserType string `json:"user_type"`
	IsActive bool   `json:"is_active"`
}

// LoginRequest represents login request payload
type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

// LoginResponse represents login response
type LoginResponse struct {
	Token   string      `json:"token"`
	User    UserProfile `json:"user"`
	Expires time.Time   `json:"expires"`
}

// CreateUserRequest represents create user request payload
type CreateUserRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
	Name     string `json:"name" binding:"required"`
	Role     string `json:"role"`
	UserType string `json:"user_type"` // admin or customer
}

// RegisterRequest represents customer registration request
type RegisterRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
	Name     string `json:"name" binding:"required"`
}

// UpdateUserRequest represents update user request payload
type UpdateUserRequest struct {
	Name     string `json:"name,omitempty"`
	Email    string `json:"email,omitempty" binding:"omitempty,email"`
	Role     string `json:"role,omitempty"`
	IsActive *bool  `json:"is_active,omitempty"`
}

// ChangePasswordRequest represents change password request payload
type ChangePasswordRequest struct {
	CurrentPassword string `json:"current_password" binding:"required"`
	NewPassword     string `json:"new_password" binding:"required,min=6"`
}

// ToProfile converts User to UserProfile
func (u *User) ToProfile() UserProfile {
	return UserProfile{
		ID:       u.ID,
		Email:    u.Email,
		Name:     u.Name,
		Role:     u.Role,
		UserType: u.UserType,
		IsActive: u.IsActive,
	}
}
