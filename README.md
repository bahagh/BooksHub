# Books Management System - Microservices Architecture

A production-ready, cloud-native book management platform built with microservices architecture, demonstrating modern software engineering practices including event-driven design, real-time communication, and containerized deployment.

🌐 **Live Demo:** [https://frontend-production-9845.up.railway.app](https://frontend-production-9845.up.railway.app)

---

## 🏗️ Architecture Overview

### System Architecture

The application follows a **microservices architecture** pattern with the following components:

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (React)                     │
│                    https://frontend.railway.app              │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTPS/WSS
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Gateway (Ocelot)                      │
│              Route Aggregation & Load Balancing              │
└──────┬────────────────────────────────────┬─────────────────┘
       │                                    │
       ▼                                    ▼
┌──────────────────┐              ┌──────────────────────┐
│  UserService     │              │   BooksService       │
│  Port: 5555      │              │   Port: 5556         │
│                  │              │                      │
│ - Authentication │              │ - Books CRUD         │
│ - User Mgmt      │              │ - Library Mgmt       │
│ - Notifications  │◄────────────►│ - Ratings/Comments   │
│ - SignalR Hub    │     HTTP     │ - Analytics          │
└────────┬─────────┘              └──────────┬───────────┘
         │                                   │
         └───────────┬───────────────────────┘
                     ▼
            ┌─────────────────┐
            │   PostgreSQL    │
            │   Shared DB     │
            └─────────────────┘
```

### Service Responsibilities

#### **1. UserService** (Authentication & User Management)
- **Technologies:** .NET 9, Entity Framework Core, SignalR
- **Responsibilities:**
  - User authentication (JWT-based with HS256)
  - User registration and profile management
  - Password reset with email verification
  - Real-time notifications via SignalR WebSocket
  - Google OAuth integration
- **Database:** Users, Notifications tables
- **API Endpoints:** `/api/auth/*`, `/api/notifications/*`, `/hubs/notifications`

#### **2. BooksService** (Content & Library Management)
- **Technologies:** .NET 9, Entity Framework Core
- **Responsibilities:**
  - Book CRUD operations with full-text search
  - Personal library management (add/remove books)
  - Rating and review system
  - Comments with threaded replies
  - Reading analytics and recommendations
- **Database:** Books, Library, Ratings, Comments tables
- **API Endpoints:** `/api/books/*`, `/api/library/*`, `/api/analytics/*`

#### **3. API Gateway** (Ocelot)
- **Technologies:** Ocelot Gateway, .NET 9
- **Responsibilities:**
  - Request routing and aggregation
  - JWT token validation
  - CORS policy enforcement
  - Rate limiting and throttling
  - Service discovery via Railway internal networking
- **Configuration:** Dynamic routing with ocelot.json

#### **4. Frontend** (Single Page Application)
- **Technologies:** React 18, TypeScript, Material-UI
- **Features:**
  - Responsive design with mobile-first approach
  - Real-time notifications with SignalR client
  - Google OAuth integration
  - Book search with filters (genre, author, rating)
  - Paginated book listings
  - Material-UI theming
- **State Management:** React Context API + TanStack Query
- **Deployment:** nginx Alpine serving static build

---

## 🛠️ Technology Stack

### Backend
- **.NET 9** - Modern C# with minimal APIs
- **Entity Framework Core 9** - ORM with PostgreSQL provider
- **SignalR** - Real-time WebSocket communication
- **Ocelot** - API Gateway routing
- **JWT (HS256)** - Stateless authentication
- **Serilog** - Structured logging

### Frontend
- **React 18** - UI library with hooks
- **TypeScript** - Type-safe JavaScript
- **Material-UI (MUI)** - Component library
- **TanStack Query** - Server state management
- **Formik + Yup** - Form validation
- **Axios** - HTTP client
- **@microsoft/signalr** - SignalR client

### Infrastructure
- **PostgreSQL 14** - Relational database
- **Docker** - Containerization with multi-stage builds
- **nginx** - Static file serving and reverse proxy
- **Railway.app** - Cloud hosting platform
- **GitHub Actions** - CI/CD pipeline

---

## 🔐 Security Implementation

### Authentication & Authorization
- **JWT Tokens:** HS256 symmetric signing with 60-minute expiration
- **Password Hashing:** BCrypt with salt rounds
- **CORS Policy:** Whitelist-based origin validation
- **SQL Injection Prevention:** Parameterized queries via EF Core
- **XSS Protection:** Content Security Policy headers

### Network Security
- **TLS/SSL:** All traffic encrypted in transit (Railway provides SSL)
- **Private Networking:** Microservices communicate via Railway internal network
- **Environment Variables:** Secrets managed via Railway's encrypted storage
- **Database Isolation:** Connection pooling with SSL mode required

---

## 📊 Database Schema

### Shared PostgreSQL Database

**UserService Schema:**
- `Users` - User accounts and profiles
- `Notifications` - Real-time notification queue

**BooksService Schema:**
- `Books` - Book metadata and content
- `Library` - User-book many-to-many relationship
- `Ratings` - Book ratings (1-5 stars)
- `Comments` - Nested comments with replies

### Key Design Decisions
- **Shared Database:** Simplified transactions, reduced latency
- **Soft Deletes:** Books/Users marked as deleted, not physically removed
- **Indexing:** Composite indexes on (UserId, BookId) for library queries
- **Timestamps:** CreatedAt/UpdatedAt for audit trails

---

## 🚀 DevOps & Deployment

### CI/CD Pipeline (GitHub Actions)
1. **Build Stage:**
   - Restore .NET dependencies
   - Compile with Release configuration
   - Run unit tests (if available)
   - Build React production bundle

2. **Containerization:**
   - Multi-stage Docker builds
   - .NET SDK (build) → .NET Runtime (final)
   - React build → nginx Alpine
   - Layer caching optimization

3. **Image Registry:**
   - Push to GitHub Container Registry (ghcr.io)
   - Tagged with commit SHA and branch name

### Railway Deployment
- **Auto-deployment:** Triggered on GitHub push
- **Environment:** Production with Railway-provided variables
- **Scaling:** Vertical scaling available (currently single instance)
- **Monitoring:** Railway metrics + service logs
- **Cost:** ~$4/month usage within $5 free credit

### Docker Configuration
- **UserService:** .NET 9 runtime, exposed on port 5555
- **BooksService:** .NET 9 runtime, exposed on port 5556
- **ApiGateway:** .NET 9 runtime, exposed on port 5000
- **Frontend:** nginx:alpine serving on port 80

---

## 🌟 Key Features Implemented

### User Features
- ✅ Email/Password authentication
- ✅ Google OAuth 2.0 login
- ✅ Password reset via email
- ✅ Real-time browser notifications
- ✅ User profile management

### Book Features
- ✅ Create/Edit/Delete books
- ✅ Book title, content, description
- ✅ Author and genre metadata
- ✅ Public/Private visibility
- ✅ Word count and reading time calculation

### Library Features
- ✅ Personal book collections
- ✅ Add/Remove books from library
- ✅ View library books
- ✅ Recently added tracking

### Social Features
- ✅ 5-star rating system
- ✅ Comments with threading
- ✅ Author profiles
- ✅ Book recommendations

### Search & Discovery
- ✅ Full-text search
- ✅ Genre filtering
- ✅ Author filtering
- ✅ Rating-based sorting
- ✅ Most viewed books

---

## 📈 Performance Optimizations

- **Database Connection Pooling:** Reuse connections across requests
- **Entity Framework Query Optimization:** Explicit includes, no tracking for read-only queries
- **Frontend State Management:** TanStack Query with stale-while-revalidate caching
- **Docker Multi-stage Builds:** Optimized image sizes with layer caching
- **SignalR Backpressure:** Message buffering for high-frequency updates

---

## 🧪 Testing

### Implemented Tests
- **Unit Tests:** xUnit test projects for UserService and BooksService
  - AuthController tests (registration, login, Google OAuth)
  - UserService business logic tests
  - NotificationService tests
  - BookService and LibraryService tests
- **Test Framework:** xUnit with Moq for mocking
- **Coverage:** Core authentication and business logic flows

### Test Execution
Tests run automatically in GitHub Actions CI/CD pipeline on every push.

---

## 📦 Project Structure

```
books/
├── .github/
│   └── workflows/
│       └── ci-cd.yml              # GitHub Actions pipeline
├── microservices-books-app/
│   ├── services/
│   │   ├── UserService/
│   │   │   └── UserService/
│   │   │       ├── Controllers/   # API endpoints
│   │   │       ├── Data/          # EF Core DbContext
│   │   │       ├── Models/        # Domain entities
│   │   │       ├── DTOs/          # Data transfer objects
│   │   │       ├── Services/      # Business logic
│   │   │       ├── Hubs/          # SignalR hubs
│   │   │       └── Program.cs     # Application entry
│   │   ├── BooksService/
│   │   │   └── BooksService/
│   │   │       ├── Controllers/
│   │   │       ├── Data/
│   │   │       ├── Models/
│   │   │       ├── DTOs/
│   │   │       ├── Services/
│   │   │       └── Program.cs
│   ├── api-gateway/
│   │   └── ApiGateway/
│   │       ├── ocelot.json        # Route configuration
│   │       └── Program.cs
│   ├── frontend/
│   │   ├── src/
│   │   │   ├── components/        # React components
│   │   │   ├── pages/             # Route pages
│   │   │   ├── services/          # API clients
│   │   │   ├── contexts/          # Global state
│   │   │   └── types/             # TypeScript types
│   │   ├── nginx.conf             # nginx configuration
│   │   └── Dockerfile
│   └── docker-compose.yml         # Local development
└── README.md
```

---

## 🔧 Environment Variables

### Production (Railway)

**UserService:**
- `DATABASE_URL` - PostgreSQL connection string
- `JwtSettings__Secret` - JWT signing key
- `JwtSettings__Issuer` - Token issuer
- `JwtSettings__Audience` - Token audience

**BooksService:**
- `DATABASE_URL` - PostgreSQL connection string
- `Jwt__Key` - JWT signing key (same as UserService)
- `Jwt__Issuer` - Token issuer
- `Jwt__Audience` - Token audience
- `UserServiceUrl` - Internal URL to UserService

**ApiGateway:**
- `Jwt__Key` - JWT validation key
- `Jwt__Issuer` - Token issuer
- `Jwt__Audience` - Token audience

**Frontend:**
- `REACT_APP_API_GATEWAY_URL` - Public ApiGateway URL
- `REACT_APP_GOOGLE_CLIENT_ID` - Google OAuth client ID

---


## 👨‍💻 Author

**Baha Eddine Leghrissi**  
GitHub: [@bahagh](https://github.com/bahagh)