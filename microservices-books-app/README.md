# Books Management System

A full-stack microservices application for managing books, personal libraries, ratings, and comments with real-time notifications.

## Tech Stack

**Backend:**
- .NET 9 (UserService, BooksService, API Gateway)
- PostgreSQL 14
- JWT Authentication (HS256)
- SignalR (real-time notifications)
- Entity Framework Core
- BCrypt password hashing
- Ocelot API Gateway

**Frontend:**
- React 18 + TypeScript
- Material-UI
- Axios
- Google OAuth

**Infrastructure:**
- Docker & Docker Compose
- PostgreSQL (shared database)
- Nginx

## Quick Start

### Prerequisites
- Docker & Docker Compose

### Run with Docker

1. Clone the repository:
```bash
git clone https://github.com/bahagh/Books-Project-Restructured-.git
cd Books-Project-Restructured-/microservices-books-app
```

2. Create `.env` file in the root:
```env
POSTGRES_DB=books
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
JWT_KEY=your_jwt_secret_key_at_least_32_chars
GOOGLE_CLIENT_ID=your_google_client_id
```

3. Start all services:
```bash
docker compose up -d
```

4. Access the application:
- **Frontend:** http://localhost:3000
- **API Gateway:** http://localhost:5000
- **UserService:** http://localhost:5555
- **BooksService:** http://localhost:5556

### Stop Services
```bash
docker compose down
```

## Features

- ✅ User registration and authentication (email/password)
- ✅ Google OAuth login
- ✅ JWT token-based authentication
- ✅ Book management (create, read, update, delete)
- ✅ Personal library (Reading, Read, Want to Read)
- ✅ Book ratings (1-5 stars)
- ✅ Book comments
- ✅ Real-time notifications via SignalR
- ✅ Book search and filtering
- ✅ User profile management
- ✅ Password reset

## Architecture

### Microservices
- **API Gateway (Port 5000)**: Routes all requests using Ocelot
- **UserService (Port 5555)**: Authentication, users, notifications
- **BooksService (Port 5556)**: Books, library, ratings, comments
- **Frontend (Port 3000)**: React SPA

### Database
- Single PostgreSQL database shared between services
- Entity Framework Core migrations
- Separate tables per service domain

## Project Structure

```
microservices-books-app/
├── api-gateway/
│   └── ApiGateway/              # Ocelot API Gateway
├── services/
│   ├── UserService/
│   │   ├── UserService/         # Auth & notifications service
│   │   └── UserService.Tests/   # Unit tests (xUnit)
│   └── BooksService/
│       ├── BooksService/        # Books & library service
│       └── BooksService.Tests/  # Unit tests (xUnit)
├── frontend/                    # React application
├── docker/
│   └── init.sql                 # Database initialization
├── docker-compose.yml
└── README.md
```

## Local Development

### Backend (.NET 9 SDK required)

**UserService:**
```bash
cd services/UserService/UserService
dotnet restore
dotnet run
```

**BooksService:**
```bash
cd services/BooksService/BooksService
dotnet restore
dotnet run
```

**API Gateway:**
```bash
cd api-gateway/ApiGateway
dotnet restore
dotnet run
```

### Frontend (Node.js 18+ required)

```bash
cd frontend
npm install
npm start       # Development server (http://localhost:3000)
npm run build   # Production build
```

### Running Tests

```bash
# UserService tests
cd services/UserService/UserService.Tests
dotnet test

# BooksService tests
cd services/BooksService/BooksService.Tests
dotnet test
```

## API Endpoints

### Authentication (UserService)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/google` - Login with Google OAuth
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Books (BooksService)
- `GET /api/books` - Get all books
- `POST /api/books` - Create book
- `GET /api/books/{id}` - Get book by ID
- `PUT /api/books/{id}` - Update book
- `DELETE /api/books/{id}` - Delete book
- `GET /api/books/search?query={q}` - Search books

### Library (BooksService)
- `GET /api/library` - Get user's library
- `POST /api/library` - Add book to library
- `PUT /api/library/{id}` - Update library item status
- `DELETE /api/library/{id}` - Remove from library

### Ratings & Comments (BooksService)
- `POST /api/ratings` - Rate a book
- `GET /api/ratings/book/{bookId}` - Get book ratings
- `POST /api/comments` - Add comment
- `GET /api/comments/book/{bookId}` - Get book comments

### Notifications (UserService)
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/{id}/read` - Mark as read
- `DELETE /api/notifications/{id}` - Delete notification

## CI/CD

GitHub Actions pipeline configured in `.github/workflows/ci-cd.yml`:
- Builds all .NET services
- Runs unit tests
- Builds React frontend
- Creates Docker images

Triggers: Push to `main`/`develop`, pull requests to `main`

## License

MIT

