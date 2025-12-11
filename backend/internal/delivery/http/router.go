package handler

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	"portfolio/internal/infrastructure/logger"
	"portfolio/internal/usecase"
)

// NewRouter creates and configures the HTTP router
func NewRouter(
	userUseCase *usecase.UserUseCase,
	projectUseCase *usecase.ProjectUseCase,
	localeUseCase *usecase.LocaleUseCase,
	logger logger.Logger,
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

	// API v1 routes
	v1 := router.Group("/api/v1")
	{
		// User routes (will be implemented later)
		users := v1.Group("/users")
		{
			users.POST("/login", func(c *gin.Context) {
				c.JSON(200, gin.H{"message": "login endpoint"})
			})
		}

		// Project routes (will be implemented later)
		projects := v1.Group("/projects")
		{
			projects.GET("", func(c *gin.Context) {
				c.JSON(200, gin.H{"message": "projects list endpoint"})
			})
		}

		// Locale routes (will be implemented later)
		locales := v1.Group("/locales")
		{
			locales.GET("/:language", func(c *gin.Context) {
				c.JSON(200, gin.H{"message": "locale endpoint"})
			})
		}
	}

	return router
}
