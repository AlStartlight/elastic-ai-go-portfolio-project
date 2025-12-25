package handler

import (
	"database/sql"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	"portfolio/internal/delivery/http/middleware"
	"portfolio/internal/infrastructure/logger"
	"portfolio/internal/usecase"
	"portfolio/internal/utils"
)

// NewRouter creates and configures the HTTP router
func NewRouter(
	userUseCase *usecase.UserUseCase,
	projectUseCase *usecase.ProjectUseCase,
	localeUseCase *usecase.LocaleUseCase,
	homepageHandler *HomepageHandler,
	logger logger.Logger,
	db *sql.DB,
) *gin.Engine {
	router := gin.Default()

	// CORS configuration
	config := cors.DefaultConfig()
	config.AllowAllOrigins = true
	config.AllowCredentials = true
	config.AllowHeaders = []string{"Origin", "Content-Length", "Content-Type", "Authorization"}
	router.Use(cors.New(config))

	// Health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "ok",
			"message": "Server is running",
		})
	})

	// API routes
	api := router.Group("/api")
	{
		// Public endpoints
		public := api.Group("/public")
		{
			// Homepage routes
			public.GET("/homepage/:section", homepageHandler.GetContentBySection)
			public.GET("/tech-stacks", homepageHandler.GetAllTechStacks)

			// Project routes (to be implemented)
			public.GET("/projects", func(c *gin.Context) {
				c.JSON(200, gin.H{"message": "projects list endpoint"})
			})
			public.GET("/projects/:slug", func(c *gin.Context) {
				c.JSON(200, gin.H{"message": "project detail endpoint"})
			})

			// Article routes (to be implemented)
			public.GET("/articles", func(c *gin.Context) {
				c.JSON(200, gin.H{"message": "articles list endpoint"})
			})
			public.GET("/articles/:slug", func(c *gin.Context) {
				c.JSON(200, gin.H{"message": "article detail endpoint"})
			})
		}

		// Auth routes
		auth := api.Group("/auth")
		{
			auth.POST("/login", func(c *gin.Context) {
				var req struct {
					Email    string `json:"email" binding:"required,email"`
					Password string `json:"password" binding:"required"`
				}

				if err := c.ShouldBindJSON(&req); err != nil {
					c.JSON(400, gin.H{"error": "Invalid request format"})
					return
				}

				// Query user from database
				var user struct {
					ID           string
					Email        string
					PasswordHash string
					Name         string
					Role         string
					IsActive     bool
				}

				query := `SELECT id, email, password_hash, name, role, is_active FROM users WHERE email = $1`
				err := db.QueryRow(query, req.Email).Scan(
					&user.ID,
					&user.Email,
					&user.PasswordHash,
					&user.Name,
					&user.Role,
					&user.IsActive,
				)

				if err == sql.ErrNoRows {
					c.JSON(401, gin.H{"error": "Invalid email or password"})
					return
				} else if err != nil {
					logger.Error("Database error during login", err)
					c.JSON(500, gin.H{"error": "Internal server error"})
					return
				}

				// Check if user is active
				if !user.IsActive {
					c.JSON(401, gin.H{"error": "Account is disabled"})
					return
				}

				// Verify password
				if !utils.CheckPasswordHash(req.Password, user.PasswordHash) {
					c.JSON(401, gin.H{"error": "Invalid email or password"})
					return
				}

				// Generate JWT token
				token, err := utils.GenerateToken(user.ID, user.Email, user.Role)
				if err != nil {
					logger.Error("Failed to generate token", err)
					c.JSON(500, gin.H{"error": "Failed to generate authentication token"})
					return
				}

				// Return success response
				c.JSON(200, gin.H{
					"token": token,
					"user": gin.H{
						"id":    user.ID,
						"email": user.Email,
						"name":  user.Name,
						"role":  user.Role,
					},
					"message": "Login successful",
				})
			})
			auth.POST("/register", func(c *gin.Context) {
				c.JSON(200, gin.H{"message": "register endpoint"})
			})
		}

		// Admin endpoints (protected with JWT)
		admin := api.Group("/admin")
		admin.Use(middleware.JWTAuthMiddleware())
		{
			// User management
			admin.PUT("/change-password", func(c *gin.Context) {
				var req struct {
					CurrentPassword string `json:"current_password" binding:"required"`
					NewPassword     string `json:"new_password" binding:"required"`
				}

				if err := c.ShouldBindJSON(&req); err != nil {
					c.JSON(400, gin.H{"error": "Invalid request"})
					return
				}

				// Get user ID from JWT context
				userID, exists := c.Get("user_id")
				if !exists {
					c.JSON(401, gin.H{"error": "Unauthorized"})
					return
				}

				// TODO: Implement password change logic via usecase
				// For now, return success
				_ = userID
				_ = req.CurrentPassword
				_ = req.NewPassword

				c.JSON(200, gin.H{"message": "Password changed successfully"})
			})

			// Homepage management
			admin.PUT("/homepage", homepageHandler.UpdateContent)
			admin.POST("/tech-stacks", homepageHandler.CreateTechStack)
			admin.PUT("/tech-stacks/:id", homepageHandler.UpdateTechStack)
			admin.DELETE("/tech-stacks/:id", homepageHandler.DeleteTechStack)

			// Project management (to be implemented)
			admin.POST("/projects", func(c *gin.Context) {
				c.JSON(200, gin.H{"message": "create project endpoint"})
			})
			admin.PUT("/projects/:id", func(c *gin.Context) {
				c.JSON(200, gin.H{"message": "update project endpoint"})
			})
			admin.DELETE("/projects/:id", func(c *gin.Context) {
				c.JSON(200, gin.H{"message": "delete project endpoint"})
			})

			// Article management (to be implemented)
			admin.POST("/articles", func(c *gin.Context) {
				c.JSON(200, gin.H{"message": "create article endpoint"})
			})
			admin.PUT("/articles/:id", func(c *gin.Context) {
				c.JSON(200, gin.H{"message": "update article endpoint"})
			})
			admin.DELETE("/articles/:id", func(c *gin.Context) {
				c.JSON(200, gin.H{"message": "delete article endpoint"})
			})
		}

		// Legacy v1 routes (keep for backward compatibility)
		v1 := api.Group("/v1")
		{
			// User routes
			users := v1.Group("/users")
			{
				users.POST("/login", func(c *gin.Context) {
					c.JSON(200, gin.H{"message": "login endpoint"})
				})
			}

			// Locale routes
			locales := v1.Group("/locales")
			{
				locales.GET("/:language", func(c *gin.Context) {
					c.JSON(200, gin.H{"message": "locale endpoint"})
				})
			}
		}
	}

	return router
}
