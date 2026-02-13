package handler

import (
	"database/sql"
	"fmt"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/prometheus/client_golang/prometheus/promhttp"

	"portfolio/internal/delivery/http/middleware"
	"portfolio/internal/domain/user"
	"portfolio/internal/infrastructure/logger"
	"portfolio/internal/usecase"
)

// NewRouter creates and configures the HTTP router
func NewRouter(
	userUseCase *usecase.UserUseCase,
	projectUseCase *usecase.ProjectUseCase,
	localeUseCase *usecase.LocaleUseCase,
	homepageHandler *HomepageHandler,
	courseHandler *CourseHandler,
	projectHandler *ProjectHandler,
	articleHandler *ArticleHandler,
	logger logger.Logger,
	db *sql.DB,
) *gin.Engine {
	router := gin.Default()
	router.Use(middleware.MetricsMiddleware())

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

	// Prometheus metrics
	router.GET("/metrics", gin.WrapH(promhttp.Handler()))

	// API routes
	api := router.Group("/api")
	{
		// Public endpoints
		public := api.Group("/public")
		{
			// Homepage routes
			public.GET("/homepage/:section", homepageHandler.GetContentBySection)
			public.GET("/tech-stacks", homepageHandler.GetAllTechStacks)

			// Project routes
			public.GET("/projects", projectHandler.GetAllProjects)
			public.GET("/projects/recent", projectHandler.GetRecentProjects)
			public.GET("/projects/:slug", projectHandler.GetProjectBySlug)

			// Article routes
			public.GET("/articles", articleHandler.GetArticles)
			public.GET("/articles/featured", articleHandler.GetFeaturedArticle)
			public.GET("/articles/featured-list", articleHandler.GetFeaturedArticles)
			public.GET("/articles/search", articleHandler.SearchArticles)
			public.GET("/articles/:slug", articleHandler.GetArticle)

			// Categories (public for form access)
			public.GET("/categories", articleHandler.GetCategories)

			// Course routes (public)
			public.GET("/courses", courseHandler.GetCourses)
			public.GET("/courses/:slug", courseHandler.GetCourse)
		}

		// Auth routes
		auth := api.Group("/auth")
		{
			// Customer register
			auth.POST("/register", func(c *gin.Context) {
				var req user.RegisterRequest
				if err := c.ShouldBindJSON(&req); err != nil {
					c.JSON(400, gin.H{"error": "Invalid request format"})
					return
				}

				response, err := userUseCase.Register(c.Request.Context(), req)
				if err != nil {
					c.JSON(400, gin.H{"error": err.Error()})
					return
				}

				c.JSON(200, response)
			})

			// Customer login
			auth.POST("/customer/login", func(c *gin.Context) {
				var req user.LoginRequest
				if err := c.ShouldBindJSON(&req); err != nil {
					c.JSON(400, gin.H{"error": "Invalid request format"})
					return
				}

				response, err := userUseCase.CustomerLogin(c.Request.Context(), req)
				if err != nil {
					c.JSON(401, gin.H{"error": err.Error()})
					return
				}

				c.JSON(200, response)
			})

			// Admin login
			auth.POST("/admin/login", func(c *gin.Context) {
				var req user.LoginRequest
				if err := c.ShouldBindJSON(&req); err != nil {
					c.JSON(400, gin.H{"error": "Invalid request format"})
					return
				}

				response, err := userUseCase.AdminLogin(c.Request.Context(), req)
				if err != nil {
					c.JSON(401, gin.H{"error": err.Error()})
					return
				}

				c.JSON(200, response)
			})

			// Legacy login endpoint (for backward compatibility)
			auth.POST("/login", func(c *gin.Context) {
				var req user.LoginRequest
				if err := c.ShouldBindJSON(&req); err != nil {
					c.JSON(400, gin.H{"error": "Invalid request format"})
					return
				}

				response, err := userUseCase.Login(c.Request.Context(), req)
				if err != nil {
					c.JSON(401, gin.H{"error": err.Error()})
					return
				}

				c.JSON(200, response)
			})
		}

		// Admin endpoints (protected with JWT)
		admin := api.Group("/admin")
		admin.Use(middleware.JWTAuthMiddleware())
		{
			// Article management
			admin.GET("/articles", articleHandler.GetArticles)
			admin.GET("/articles/:id", articleHandler.GetArticleByID)
			admin.POST("/articles", articleHandler.CreateArticle)
			admin.PUT("/articles/:id", articleHandler.UpdateArticle)
			admin.DELETE("/articles/:id", articleHandler.DeleteArticle)

			// User management
			admin.PUT("/change-password", func(c *gin.Context) {
				var req struct {
					CurrentPassword string `json:"current_password" binding:"required"`
					NewPassword     string `json:"new_password" binding:"required"`
				}

				if err := c.ShouldBindJSON(&req); err != nil {
					logger.Error("Failed to bind JSON for change password", err)
					c.JSON(400, gin.H{"error": "Invalid request: " + err.Error()})
					return
				}

				// Get user ID from JWT context
				userIDStr, exists := c.Get("user_id")
				if !exists {
					logger.Error("User ID not found in JWT context", nil)
					c.JSON(401, gin.H{"error": "Unauthorized"})
					return
				}

				// Convert to string
				userID, ok := userIDStr.(string)
				if !ok {
					logger.Error("Failed to convert user ID to string", nil)
					c.JSON(400, gin.H{"error": "Invalid user ID"})
					return
				}

				logger.Info(fmt.Sprintf("Attempting to change password for user ID: %s", userID))

				// Call usecase to change password
				changePasswordReq := user.ChangePasswordRequest{
					CurrentPassword: req.CurrentPassword,
					NewPassword:     req.NewPassword,
				}

				if err := userUseCase.ChangePassword(c.Request.Context(), userID, changePasswordReq); err != nil {
					logger.Error("Failed to change password", err)
					c.JSON(400, gin.H{"error": err.Error()})
					return
				}

				logger.Info(fmt.Sprintf("Password changed successfully for user ID: %s", userID))
				c.JSON(200, gin.H{"message": "Password changed successfully"})
			})

			// Homepage management
			admin.PUT("/homepage", homepageHandler.UpdateContent)
			admin.POST("/tech-stacks", homepageHandler.CreateTechStack)
			admin.PUT("/tech-stacks/:id", homepageHandler.UpdateTechStack)
			admin.DELETE("/tech-stacks/:id", homepageHandler.DeleteTechStack)

			// Project management
			admin.POST("/projects", projectHandler.CreateProject)
			admin.PUT("/projects/:id", projectHandler.UpdateProject)
			admin.DELETE("/projects/:id", projectHandler.DeleteProject)

			// Categories
			admin.GET("/categories", articleHandler.GetCategories)

			// Newsletter
			admin.GET("/newsletter/subscribers", articleHandler.GetSubscribers)

			// Course management (admin)
			admin.GET("/courses", courseHandler.GetAllCourses)     // Get all courses including drafts
			admin.GET("/courses/:id", courseHandler.GetCourseByID) // Get course by ID
			admin.POST("/courses", courseHandler.CreateCourse)
			admin.PUT("/courses/:id", courseHandler.UpdateCourse)
			admin.DELETE("/courses/:id", courseHandler.DeleteCourse)
			admin.GET("/courses/:id/curriculum", courseHandler.GetCourseCurriculum)

			// Section management
			admin.POST("/sections", courseHandler.CreateSection)
			admin.DELETE("/sections/:id", courseHandler.DeleteSection)

			// Lesson management
			admin.POST("/lessons", courseHandler.CreateLesson)
			admin.DELETE("/lessons/:id", courseHandler.DeleteLesson)

			// File uploads
			admin.POST("/upload/video", courseHandler.UploadVideo)
			admin.POST("/upload/thumbnail", courseHandler.UploadThumbnail)
			admin.GET("/upload/thumbnails", courseHandler.ListThumbnails)
			admin.POST("/upload/image", articleHandler.UploadImage)
			admin.GET("/upload/images", articleHandler.ListImages)
		}

		// Student endpoints (protected with JWT)
		student := api.Group("/student")
		student.Use(middleware.JWTAuthMiddleware())
		{
			// Enrollment
			student.POST("/courses/:id/enroll", courseHandler.EnrollCourse)
			student.GET("/enrollments", courseHandler.GetMyEnrollments)

			// Progress tracking
			student.POST("/lessons/:id/complete", courseHandler.MarkLessonComplete)
			student.GET("/courses/:id/progress", courseHandler.GetCourseProgress)
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
