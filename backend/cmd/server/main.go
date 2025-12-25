package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	handler "portfolio/internal/delivery/http"
	"portfolio/internal/infrastructure/config"
	"portfolio/internal/infrastructure/db"
	"portfolio/internal/infrastructure/logger"
	"portfolio/internal/repository"
	"portfolio/internal/usecase"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	// Initialize logger
	zapLogger := logger.NewZapLogger()
	defer zapLogger.Sync()

	// Load configuration
	cfg := config.New()

	// Initialize database
	database, err := db.NewPostgresConnection(cfg)
	if err != nil {
		zapLogger.Fatal("Failed to connect to database", err)
	}
	defer database.Close()

	// Initialize repositories
	userRepo := repository.NewUserPostgresRepository(database)
	projectRepo := repository.NewProjectPostgresRepository(database.DB)
	localeRepo := repository.NewLocaleFileSystemRepository()
	homepageRepo := repository.NewHomepageRepository(database.DB)

	// Initialize use cases
	userUseCase := usecase.NewUserUseCase(userRepo, zapLogger)
	projectUseCase := usecase.NewProjectUseCase(projectRepo)
	localeUseCase := usecase.NewLocaleUseCase(localeRepo, zapLogger)
	homepageUseCase := usecase.NewHomepageUsecase(homepageRepo)

	// Initialize handlers
	homepageHandler := handler.NewHomepageHandler(homepageUseCase)

	// Initialize HTTP server
	if cfg.Environment == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	router := handler.NewRouter(userUseCase, projectUseCase, localeUseCase, homepageHandler, zapLogger, database.DB)

	server := &http.Server{
		Addr:    cfg.ServerAddress,
		Handler: router,
	}

	// Start server in a goroutine
	go func() {
		zapLogger.Info("Starting server on " + cfg.ServerAddress)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			zapLogger.Fatal("Server failed to start", err)
		}
	}()

	// Wait for interrupt signal to gracefully shutdown the server
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	zapLogger.Info("Shutting down server...")

	// Give outstanding requests a deadline for completion
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		zapLogger.Fatal("Server forced to shutdown", err)
	}

	zapLogger.Info("Server exited")
}
