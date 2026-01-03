package usecase

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v4"
	"golang.org/x/crypto/bcrypt"

	"portfolio/internal/domain/user"
	"portfolio/internal/infrastructure/logger"
	"portfolio/internal/utils"
)

// UserUseCase handles business logic for user operations
type UserUseCase struct {
	userRepo user.Repository
	logger   logger.Logger
}

// NewUserUseCase creates a new UserUseCase instance
func NewUserUseCase(userRepo user.Repository, logger logger.Logger) *UserUseCase {
	return &UserUseCase{
		userRepo: userRepo,
		logger:   logger,
	}
}

// Login authenticates a user and returns a JWT token
func (uc *UserUseCase) Login(ctx context.Context, req user.LoginRequest) (*user.LoginResponse, error) {
	// Get user by email
	foundUser, err := uc.userRepo.GetByEmail(ctx, req.Email)
	if err != nil {
		uc.logger.Error("Failed to find user by email", err)
		return nil, errors.New("invalid credentials")
	}

	// Check if user is active
	if !foundUser.IsActive {
		return nil, errors.New("user account is deactivated")
	}

	// Verify password
	if err := bcrypt.CompareHashAndPassword([]byte(foundUser.PasswordHash), []byte(req.Password)); err != nil {
		uc.logger.Error("Password verification failed", err)
		return nil, errors.New("invalid credentials")
	}

	// Generate JWT token
	token, expiresAt, err := uc.generateJWT(foundUser)
	if err != nil {
		uc.logger.Error("Failed to generate JWT token", err)
		return nil, errors.New("failed to generate authentication token")
	}

	return &user.LoginResponse{
		Token:   token,
		User:    foundUser.ToProfile(),
		Expires: expiresAt,
	}, nil
}

// AdminLogin authenticates an admin user and returns a JWT token
func (uc *UserUseCase) AdminLogin(ctx context.Context, req user.LoginRequest) (*user.LoginResponse, error) {
	// Get user by email
	foundUser, err := uc.userRepo.GetByEmail(ctx, req.Email)
	if err != nil {
		uc.logger.Error("Failed to find user by email", err)
		return nil, errors.New("invalid credentials")
	}

	// Check if user is admin
	if foundUser.UserType != "admin" {
		return nil, errors.New("unauthorized: admin access only")
	}

	// Check if user is active
	if !foundUser.IsActive {
		return nil, errors.New("user account is deactivated")
	}

	// Verify password
	if err := bcrypt.CompareHashAndPassword([]byte(foundUser.PasswordHash), []byte(req.Password)); err != nil {
		uc.logger.Error("Password verification failed", err)
		return nil, errors.New("invalid credentials")
	}

	// Generate JWT token
	token, expiresAt, err := uc.generateJWT(foundUser)
	if err != nil {
		uc.logger.Error("Failed to generate JWT token", err)
		return nil, errors.New("failed to generate authentication token")
	}

	return &user.LoginResponse{
		Token:   token,
		User:    foundUser.ToProfile(),
		Expires: expiresAt,
	}, nil
}

// CustomerLogin authenticates a customer user and returns a JWT token
func (uc *UserUseCase) CustomerLogin(ctx context.Context, req user.LoginRequest) (*user.LoginResponse, error) {
	// Get user by email
	foundUser, err := uc.userRepo.GetByEmail(ctx, req.Email)
	if err != nil {
		uc.logger.Error("Failed to find user by email", err)
		return nil, errors.New("invalid credentials")
	}

	// Check if user is customer
	if foundUser.UserType != "customer" {
		return nil, errors.New("unauthorized: customer access only")
	}

	// Check if user is active
	if !foundUser.IsActive {
		return nil, errors.New("user account is deactivated")
	}

	// Verify password
	if err := bcrypt.CompareHashAndPassword([]byte(foundUser.PasswordHash), []byte(req.Password)); err != nil {
		uc.logger.Error("Password verification failed", err)
		return nil, errors.New("invalid credentials")
	}

	// Generate JWT token
	token, expiresAt, err := uc.generateJWT(foundUser)
	if err != nil {
		uc.logger.Error("Failed to generate JWT token", err)
		return nil, errors.New("failed to generate authentication token")
	}

	return &user.LoginResponse{
		Token:   token,
		User:    foundUser.ToProfile(),
		Expires: expiresAt,
	}, nil
}

// Register creates a new customer account
func (uc *UserUseCase) Register(ctx context.Context, req user.RegisterRequest) (*user.LoginResponse, error) {
	// Check if user with email already exists
	_, err := uc.userRepo.GetByEmail(ctx, req.Email)
	if err == nil {
		return nil, errors.New("user with this email already exists")
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		uc.logger.Error("Failed to hash password", err)
		return nil, errors.New("failed to process password")
	}

	// Create user entity
	newUser := &user.User{
		Email:        req.Email,
		PasswordHash: string(hashedPassword),
		Name:         req.Name,
		Role:         "user",
		UserType:     "customer",
		IsActive:     true,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	// Save user
	if err := uc.userRepo.Create(ctx, newUser); err != nil {
		uc.logger.Error("Failed to create user", err)
		return nil, errors.New("failed to create user")
	}

	// Auto-login after registration
	token, expiresAt, err := uc.generateJWT(newUser)
	if err != nil {
		uc.logger.Error("Failed to generate JWT token", err)
		return nil, errors.New("registration successful but failed to auto-login")
	}

	return &user.LoginResponse{
		Token:   token,
		User:    newUser.ToProfile(),
		Expires: expiresAt,
	}, nil
}

// GetProfile retrieves user profile by ID
func (uc *UserUseCase) GetProfile(ctx context.Context, userID string) (*user.UserProfile, error) {
	foundUser, err := uc.userRepo.GetByID(ctx, userID)
	if err != nil {
		uc.logger.Error("Failed to get user by ID", err)
		return nil, errors.New("user not found")
	}

	profile := foundUser.ToProfile()
	return &profile, nil
}

// CreateUser creates a new user
func (uc *UserUseCase) CreateUser(ctx context.Context, req user.CreateUserRequest) error {
	// Check if user with email already exists
	_, err := uc.userRepo.GetByEmail(ctx, req.Email)
	if err == nil {
		return errors.New("user with this email already exists")
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		uc.logger.Error("Failed to hash password", err)
		return errors.New("failed to process password")
	}

	// Set default role if not provided
	role := req.Role
	if role == "" {
		role = "user"
	}

	// Set default user_type if not provided
	userType := req.UserType
	if userType == "" {
		userType = "customer"
	}

	// Create user entity
	newUser := &user.User{
		Email:        req.Email,
		PasswordHash: string(hashedPassword),
		Name:         req.Name,
		Role:         role,
		UserType:     userType,
		IsActive:     true,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	// Save user
	if err := uc.userRepo.Create(ctx, newUser); err != nil {
		uc.logger.Error("Failed to create user", err)
		return errors.New("failed to create user")
	}

	return nil
}

// UpdateUser updates user information
func (uc *UserUseCase) UpdateUser(ctx context.Context, userID string, req user.UpdateUserRequest) error {
	// Check if user exists
	_, err := uc.userRepo.GetByID(ctx, userID)
	if err != nil {
		uc.logger.Error("User not found for update", err)
		return errors.New("user not found")
	}

	// Check if email is being changed and if it's already taken
	if req.Email != "" {
		existingUser, err := uc.userRepo.GetByEmail(ctx, req.Email)
		if err == nil && existingUser.ID != userID {
			return errors.New("email is already taken by another user")
		}
	}

	// Update user
	if err := uc.userRepo.Update(ctx, userID, req); err != nil {
		uc.logger.Error("Failed to update user", err)
		return errors.New("failed to update user")
	}

	return nil
}

// generateJWT generates a JWT token for the user
func (uc *UserUseCase) generateJWT(user *user.User) (string, time.Time, error) {
	expiresAt := time.Now().Add(24 * time.Hour) // Token expires in 24 hours

	claims := &utils.JWTClaims{
		UserID: user.ID,
		Email:  user.Email,
		Role:   user.Role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expiresAt),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Subject:   user.ID,
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(utils.GetJWTSecret()))
	if err != nil {
		return "", time.Time{}, err
	}

	return tokenString, expiresAt, nil
}

// ChangePassword changes user password after verifying current password
func (uc *UserUseCase) ChangePassword(ctx context.Context, userID string, req user.ChangePasswordRequest) error {
	// Get user by ID
	foundUser, err := uc.userRepo.GetByID(ctx, userID)
	if err != nil {
		uc.logger.Error("Failed to find user by ID", err)
		return errors.New("user not found")
	}

	// Verify current password
	if err := bcrypt.CompareHashAndPassword([]byte(foundUser.PasswordHash), []byte(req.CurrentPassword)); err != nil {
		uc.logger.Error("Current password verification failed", err)
		return errors.New("current password is incorrect")
	}

	// Hash new password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		uc.logger.Error("Failed to hash new password", err)
		return errors.New("failed to process new password")
	}

	// Update password
	if err := uc.userRepo.UpdatePassword(ctx, userID, string(hashedPassword)); err != nil {
		uc.logger.Error("Failed to update password", err)
		return errors.New("failed to update password")
	}

	uc.logger.Info(fmt.Sprintf("Password changed successfully for user ID: %s", userID))
	return nil
}
