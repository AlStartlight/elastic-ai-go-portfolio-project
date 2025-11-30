# Portfolio Project

A full-stack portfolio application built with Golang (clean architecture) backend and React TypeScript frontend with internationalization support.

## 🚀 Features

- **Backend (Golang)**
  - Clean Architecture pattern
  - RESTful API
  - JWT Authentication
  - PostgreSQL database
  - Multi-language support
  - Structured logging with Zap

- **Frontend (React + TypeScript)**
  - Modern React with TypeScript
  - Tailwind CSS for styling
  - i18next for internationalization
  - Responsive design
  - Admin dashboard

## 📦 Project Structure

```
root_project/
├── backend/                  # Golang clean architecture
├── frontend/                 # React + TypeScript + Tailwind + i18n
├── docker-compose.yml
├── .env
├── Makefile
└── README.md
```

## 🛠️ Prerequisites

- Go 1.19+
- Node.js 18+
- PostgreSQL 13+
- Docker & Docker Compose (optional)

## 🏃‍♂️ Quick Start

### Using Make Commands

1. **Setup the project:**
   ```bash
   make setup
   ```

2. **Run development servers:**
   ```bash
   make run
   ```

3. **Using Docker Compose:**
   ```bash
   make docker-up
   ```

### Manual Setup

#### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   go mod tidy
   ```

3. Set up environment variables:
   ```bash
   cp ../.env.example ../.env
   # Edit .env with your database credentials
   ```

4. Run the server:
   ```bash
   go run cmd/server/main.go
   ```

#### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

## 🐳 Docker Development

1. **Start all services:**
   ```bash
   docker-compose up -d
   ```

2. **View logs:**
   ```bash
   docker-compose logs -f
   ```

3. **Stop services:**
   ```bash
   docker-compose down
   ```

## 📚 API Documentation

The API server runs on `http://localhost:8080` with the following endpoints:

- `GET /api/health` - Health check
- `POST /api/auth/login` - User authentication
- `GET /api/users/profile` - Get user profile
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create new project (admin)
- `GET /api/locales/:lang` - Get translations

## 🌍 Internationalization

The application supports multiple languages:
- English (en)
- Indonesian (id)

Language files are located in:
- Backend: `backend/internal/infrastructure/localization/`
- Frontend: `frontend/public/locales/`

## 🧪 Testing

### Backend Tests
```bash
cd backend
go test ./...
```

### Frontend Tests
```bash
cd frontend
npm test
```

### Test Coverage
```bash
make test-coverage
```

## 📁 Architecture

### Backend (Clean Architecture)
- **Domain**: Business entities and repository interfaces
- **Use Cases**: Business logic and application rules
- **Repository**: Data access implementations
- **Delivery**: HTTP handlers and routing
- **Infrastructure**: External services and configurations

### Frontend (Component-based)
- **Components**: Reusable UI components
- **Pages**: Route-specific components
- **Hooks**: Custom React hooks
- **Context**: Global state management
- **API**: HTTP client and API calls

## 🚀 Deployment

### Production Build

1. **Build backend:**
   ```bash
   make backend-build
   ```

2. **Build frontend:**
   ```bash
   make frontend-build
   ```

3. **Using Docker:**
   ```bash
   make docker-build
   docker-compose -f docker-compose.prod.yml up -d
   ```

## 📝 Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=portfolio_db

# JWT
JWT_SECRET=your-secret-key

# Server
SERVER_PORT=8080
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- Clean Architecture by Robert C. Martin
- Go community
- React community