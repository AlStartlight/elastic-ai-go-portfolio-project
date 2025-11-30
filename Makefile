# Makefile for Portfolio Project

.PHONY: help build run clean test docker-build docker-up docker-down

# Variables
BACKEND_DIR = ./backend
FRONTEND_DIR = ./frontend
BINARY_NAME = portfolio-server

# Default target
help:
	@echo "Available commands:"
	@echo "  build          - Build both backend and frontend"
	@echo "  run            - Run both backend and frontend in development"
	@echo "  clean          - Clean build artifacts"
	@echo "  test           - Run tests for backend"
	@echo "  docker-build   - Build Docker images"
	@echo "  docker-up      - Start services with docker-compose"
	@echo "  docker-down    - Stop services"
	@echo "  backend-build  - Build only backend"
	@echo "  backend-run    - Run only backend"
	@echo "  frontend-build - Build only frontend"
	@echo "  frontend-dev   - Run frontend in development mode"

# Build targets
build: backend-build frontend-build

backend-build:
	@echo "Building backend..."
	cd $(BACKEND_DIR) && go build -o bin/$(BINARY_NAME) cmd/server/main.go

frontend-build:
	@echo "Building frontend..."
	cd $(FRONTEND_DIR) && npm run build

# Run targets
run:
	@echo "Starting development servers..."
	make -j2 backend-run frontend-dev

backend-run:
	@echo "Starting backend server..."
	cd $(BACKEND_DIR) && go run cmd/server/main.go

frontend-dev:
	@echo "Starting frontend development server..."
	cd $(FRONTEND_DIR) && npm run dev

# Test targets
test:
	@echo "Running backend tests..."
	cd $(BACKEND_DIR) && go test ./...

test-coverage:
	@echo "Running tests with coverage..."
	cd $(BACKEND_DIR) && go test -coverprofile=coverage.out ./...
	cd $(BACKEND_DIR) && go tool cover -html=coverage.out

# Docker targets
docker-build:
	@echo "Building Docker images..."
	docker-compose build

docker-up:
	@echo "Starting services with Docker Compose..."
	docker-compose up -d

docker-down:
	@echo "Stopping services..."
	docker-compose down

docker-logs:
	@echo "Showing logs..."
	docker-compose logs -f

# Setup targets
setup: setup-backend setup-frontend
	@echo "Project setup complete!"

setup-backend:
	@echo "Setting up backend dependencies..."
	cd $(BACKEND_DIR) && go mod tidy

setup-frontend:
	@echo "Setting up frontend dependencies..."
	cd $(FRONTEND_DIR) && npm install

# Clean targets
clean:
	@echo "Cleaning build artifacts..."
	rm -rf $(BACKEND_DIR)/bin
	rm -rf $(FRONTEND_DIR)/dist
	rm -rf $(FRONTEND_DIR)/node_modules/.cache

clean-all: clean
	@echo "Cleaning all dependencies..."
	rm -rf $(FRONTEND_DIR)/node_modules
	cd $(BACKEND_DIR) && go clean -modcache

# Migration targets
migrate-up:
	@echo "Running database migrations..."
	cd $(BACKEND_DIR) && go run cmd/migrate/main.go up

migrate-down:
	@echo "Rolling back database migrations..."
	cd $(BACKEND_DIR) && go run cmd/migrate/main.go down

# Linting targets
lint: lint-backend lint-frontend

lint-backend:
	@echo "Linting backend code..."
	cd $(BACKEND_DIR) && golangci-lint run

lint-frontend:
	@echo "Linting frontend code..."
	cd $(FRONTEND_DIR) && npm run lint