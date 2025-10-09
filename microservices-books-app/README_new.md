# 📚 Books Microservices Application

A comprehensive, enterprise-grade books management platform built with microservices architecture, featuring advanced analytics, social features, and modern authentication.

## 🏗️ Architecture Overview

This application follows a **microservices architecture** with the following components:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│  React Frontend │────│   API Gateway   │────│   User Service  │
│     (Port 3000) │    │   (Port 5000)   │    │   (Port 5001)   │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                 │                        │
                                 │                        │
                                 │               ┌─────────────────┐
                                 │               │                 │
                                 │───────────────│ PostgreSQL DB   │
                                 │               │   (Port 5432)   │
                                 │               │                 │
                       ┌─────────────────┐      └─────────────────┘
                       │                 │               │
                       │  Books Service  │───────────────┘
                       │   (Port 5002)   │
                       │                 │
                       └─────────────────┘
```

## 🚀 Features

### 🔐 Authentication & Authorization
- **JWT-based authentication** with refresh tokens
- **Google OAuth 2.0 integration** for social login
- **Role-based access control** (Admin, User)
- **Secure password hashing** with BCrypt
- **Session management** with refresh token rotation

### 📖 Books Management
- **CRUD operations** for books with rich metadata
- **Advanced search & filtering** with full-text search
- **Book categorization** by genre, author, language
- **Public/private book visibility** controls
- **Rich content support** with word count analytics
- **Tag-based organization** system

### 📊 Analytics & Insights
- **Reading analytics** per user and platform-wide
- **Popular books** tracking with custom scoring
- **Genre trending** analysis with growth metrics
- **User engagement** scoring and activity patterns
- **View tracking** with unique visitor analytics
- **Reading patterns** by time and preferences

### 💬 Social Features
- **Rating system** (1-5 stars) with review support
- **Threaded comments** with nested replies
- **User interaction** tracking and analytics
- **Recommendation engine** based on reading patterns
- **Social activity** feeds and user preferences

### 🛠️ Technical Excellence
- **Microservices architecture** with API Gateway
- **Clean Architecture** patterns and DDD principles
- **Entity Framework Core** with PostgreSQL
- **AutoMapper** for object-to-object mapping
- **FluentValidation** for comprehensive validation
- **Serilog** structured logging
- **Swagger/OpenAPI** documentation
- **Docker containerization**
- **Health checks** and monitoring

## 🗄️ Database Schema

### Users Table
```sql
- Id (uuid, primary key)
- Email (varchar, unique)
- Username (varchar, unique)
- PasswordHash (varchar)
- GoogleId (varchar, nullable)
- Role (enum: User, Admin)
- CreatedAt, UpdatedAt (timestamp)
```

### Books Table
```sql
- Id (uuid, primary key)
- UserId (uuid, foreign key)
- Title (varchar, required)
- Content (text, required)
- Description (varchar, optional)
- Author (varchar, optional)
- Genre (varchar, optional)
- Language (varchar, default: 'en')
- Status (enum: Draft, InReview, Published, Archived)
- IsPublic (boolean, default: false)
- ViewCount, AverageRating, RatingCount (analytics)
- Tags (jsonb array)
- Metadata (jsonb object)
- CreatedAt, UpdatedAt, PublishedAt (timestamp)
```

### Social Features Tables
```sql
-- Book Ratings
- Id, BookId, UserId (uuid)
- Rating (int, 1-5)
- Review (text, optional)
- CreatedAt, UpdatedAt

-- Book Comments
- Id, BookId, UserId, ParentCommentId (uuid)
- Content (text, required)
- IsEdited, IsDeleted (boolean)
- CreatedAt, UpdatedAt

-- Book Views (Analytics)
- Id, BookId, UserId (uuid)
- ViewedAt (timestamp)
- ReadingDuration (interval)
```

## 🔧 Technology Stack

### Backend Services
- **.NET 9** - Latest ASP.NET Core framework
- **C# 13** - Modern C# with latest features
- **PostgreSQL 15** - Robust relational database
- **Entity Framework Core** - ORM with migrations
- **Ocelot** - API Gateway with routing & auth
- **JWT Bearer** - Stateless authentication
- **Google OAuth 2.0** - Social authentication
- **BCrypt** - Secure password hashing
- **AutoMapper** - Object mapping
- **FluentValidation** - Input validation
- **Serilog** - Structured logging
- **Swagger/OpenAPI** - API documentation

### Frontend (Planned)
- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe JavaScript
- **Material-UI** - Modern component library
- **Axios** - HTTP client
- **React Router** - Client-side routing
- **React Query** - Server state management
- **Formik** - Form handling
- **Yup** - Client-side validation

### Infrastructure
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **PostgreSQL** - Database server
- **Nginx** (planned) - Reverse proxy & load balancer

## 🚀 Quick Start

### Prerequisites
- **.NET 9 SDK**
- **Docker & Docker Compose**
- **PostgreSQL** (or use Docker)
- **Google OAuth credentials** (optional)

### 1. Clone & Setup
```bash
git clone <repository-url>
cd microservices-books-app
```

### 2. Environment Configuration
Create a `.env` file in the root directory:
```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### 3. Database Setup
```bash
# Start PostgreSQL with Docker
docker-compose up postgres -d

# Or use local PostgreSQL
# Ensure database 'books' exists with user 'postgres' and password 'baha123'
```

### 4. Run Services

#### Option A: Docker Compose (Recommended)
```bash
# Build and start all services
docker-compose up --build

# Or start individual services
docker-compose up postgres api-gateway user-service books-service
```

#### Option B: Local Development
```bash
# Terminal 1 - User Service
cd services/UserService/UserService
dotnet run

# Terminal 2 - Books Service  
cd services/BooksService/BooksService
dotnet run

# Terminal 3 - API Gateway
cd api-gateway/ApiGateway
dotnet run

# Terminal 4 - Frontend (when ready)
cd frontend
npm start
```

### 5. Verify Installation
- **API Gateway**: http://localhost:5000
- **User Service**: http://localhost:5001/swagger
- **Books Service**: http://localhost:5002/swagger
- **Frontend**: http://localhost:3000 (when ready)
- **Database**: localhost:5432

## 📚 API Documentation

### Authentication Endpoints
```http
POST /api/auth/register         # User registration
POST /api/auth/login           # User login
POST /api/auth/google          # Google OAuth login
POST /api/auth/refresh         # Refresh JWT token
POST /api/auth/logout          # User logout
```

### Books Management
```http
GET    /api/books              # Get books with filters
GET    /api/books/{id}         # Get specific book
POST   /api/books              # Create new book
PUT    /api/books/{id}         # Update book
DELETE /api/books/{id}         # Delete book
```

### Social Features
```http
GET    /api/books/{id}/ratings          # Get book ratings
POST   /api/books/{id}/ratings          # Rate a book
PUT    /api/books/{id}/ratings/{id}     # Update rating
DELETE /api/books/{id}/ratings/{id}     # Delete rating

GET    /api/books/{id}/comments         # Get book comments
POST   /api/books/{id}/comments         # Add comment
PUT    /api/books/{id}/comments/{id}    # Update comment
DELETE /api/books/{id}/comments/{id}    # Delete comment
```

### Analytics & Insights
```http
GET /api/analytics/books/{id}           # Book analytics
GET /api/analytics/users/me/reading     # User reading analytics
GET /api/analytics/books/popular        # Popular books
GET /api/analytics/recommendations      # Personalized recommendations
GET /api/analytics/genres/trending      # Trending genres
GET /api/analytics/platform             # Platform analytics (admin)
```

## 🏗️ Project Structure

```
microservices-books-app/
├── api-gateway/
│   └── ApiGateway/                 # Ocelot API Gateway
│       ├── Program.cs
│       ├── ocelot.json
│       └── Dockerfile
├── services/
│   ├── UserService/               # Authentication & User Management
│   │   └── UserService/
│   │       ├── Controllers/       # API endpoints
│   │       ├── Models/           # Domain models
│   │       ├── Services/         # Business logic
│   │       ├── Data/             # Database context
│   │       └── DTOs/             # Data transfer objects
│   └── BooksService/             # Books & Analytics & Social Features
│       └── BooksService/
│           ├── Controllers/      # Books, Ratings, Comments, Analytics
│           ├── Models/           # Book, Rating, Comment, View models
│           ├── Services/         # Business logic services
│           ├── Data/             # EF Core context
│           ├── DTOs/             # Request/response models
│           ├── Validators/       # FluentValidation rules
│           └── Mappings/         # AutoMapper profiles
├── frontend/                     # React frontend (planned)
├── docker/
│   └── init.sql                  # Database initialization
├── docker-compose.yml            # Multi-service orchestration
└── README.md                     # This file
```

## 🔧 Development

### Adding New Features
1. **Define models** in appropriate service
2. **Create DTOs** with validation attributes
3. **Add FluentValidation** rules
4. **Implement services** with business logic
5. **Create controllers** with endpoints
6. **Add AutoMapper** mappings
7. **Write tests** for new functionality
8. **Update API documentation**

### Database Migrations
```bash
# Add new migration
cd services/BooksService/BooksService
dotnet ef migrations add MigrationName

# Update database
dotnet ef database update
```

### Testing
```bash
# Run all tests
dotnet test

# Run specific project tests
cd services/UserService/UserService
dotnet test
```

## 🚀 Deployment

### Docker Production
```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy to production
docker-compose -f docker-compose.prod.yml up -d
```

### Cloud Deployment
- **Azure Container Instances** for easy container hosting
- **AWS ECS/Fargate** for scalable container orchestration  
- **Google Cloud Run** for serverless container deployment
- **Kubernetes** for advanced orchestration

## 📈 Performance & Scalability

### Database Optimizations
- **Indexed columns** for fast queries
- **JSONB support** for flexible metadata
- **Connection pooling** for efficiency
- **Query optimization** with EF Core

### Caching Strategy
- **In-memory caching** for frequently accessed data
- **Redis integration** for distributed caching
- **Response caching** for static content

### Monitoring & Observability
- **Structured logging** with Serilog
- **Health checks** for service monitoring
- **Metrics collection** for performance tracking
- **Distributed tracing** (planned)

## 🤝 Contributing

1. **Fork the repository**
2. **Create feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit changes** (`git commit -m 'Add amazing feature'`)
4. **Push to branch** (`git push origin feature/amazing-feature`)
5. **Open Pull Request**

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Microsoft** for .NET and Entity Framework Core
- **Ocelot** for the excellent API Gateway solution
- **PostgreSQL** for the robust database system
- **FluentValidation** for comprehensive validation
- **AutoMapper** for object mapping
- **Serilog** for structured logging

---

**Built with ❤️ using modern .NET technologies and microservices best practices**