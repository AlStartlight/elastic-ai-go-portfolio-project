package usecase

import (
	"context"
	"errors"
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
	if err := bcrypt.CompareHashAndPassword([]byte(foundUser.Password), []byte(req.Password)); err != nil {
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

// GetProfile retrieves user profile by ID
func (uc *UserUseCase) GetProfile(ctx context.Context, userID uint) (*user.UserProfile, error) {
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

	// Create user entity
	newUser := &user.User{
		Email:     req.Email,
		Password:  string(hashedPassword),
		Name:      req.Name,
		Role:      role,
		IsActive:  true,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	// Save user
	if err := uc.userRepo.Create(ctx, newUser); err != nil {
		uc.logger.Error("Failed to create user", err)
		return errors.New("failed to create user")
	}

	return nil
}

// UpdateUser updates user information
func (uc *UserUseCase) UpdateUser(ctx context.Context, userID uint, req user.UpdateUserRequest) error {
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
			Subject:   string(rune(user.ID)),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(utils.GetJWTSecret()))
	if err != nil {
		return "", time.Time{}, err
	}

	return tokenString, expiresAt, nil
}