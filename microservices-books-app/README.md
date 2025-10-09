# 📚 Microservices Books Management System

A modern, scalable books management system built with microservices architecture.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend │    │   API Gateway   │    │ User Service    │
│   (Port 3000)   │◄──►│   (Port 5000)   │◄──►│   (Port 5001)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                       │
                                ▼                       ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │  Books Service  │    │ Analytics Service│
                       │   (Port 5002)   │    │   (Port 5003)   │
                       └─────────────────┘    └─────────────────┘
                                │                       │
                                └───────────┬───────────┘
                                            ▼
                                  ┌─────────────────┐
                                  │   PostgreSQL    │
                                  │   (Port 5432)   │
                                  └─────────────────┘
```

## 🚀 Services

### 1. API Gateway (Port 5000)
- Request routing
- Authentication middleware
- Rate limiting
- CORS handling

### 2. User Service (Port 5001)
- User registration/login
- JWT token management
- Google OAuth integration
- Profile management

### 3. Books Service (Port 5002)
- CRUD operations for books
- File upload handling
- Book search and filtering
- PostgreSQL integration

### 4. Analytics Service (Port 5003)
- Word frequency analysis
- Reading statistics
- Book recommendations
- Data visualization endpoints

### 5. React Frontend (Port 3000)
- Modern responsive UI
- Google OAuth login
- Book management interface
- Analytics dashboard

## 🛠️ Technology Stack

- **Backend**: .NET 8, ASP.NET Core Web API
- **Frontend**: React 18, TypeScript, Material-UI
- **Database**: PostgreSQL
- **Authentication**: JWT, Google OAuth 2.0
- **API Gateway**: Ocelot
- **Containerization**: Docker
- **Documentation**: Swagger/OpenAPI

## 📋 Prerequisites

- .NET 8 SDK
- Node.js 18+
- PostgreSQL
- Docker (optional)

## 🏃‍♂️ Quick Start

1. **Setup Database**
   ```bash
   # Create PostgreSQL database 'books'
   # User: postgres, Password: baha123
   ```

2. **Start Services**
   ```bash
   # Start API Gateway
   cd services/ApiGateway
   dotnet run

   # Start User Service
   cd services/UserService
   dotnet run

   # Start Books Service
   cd services/BooksService
   dotnet run

   # Start Analytics Service
   cd services/AnalyticsService
   dotnet run
   ```

3. **Start Frontend**
   ```bash
   cd frontend
   npm install
   npm start
   ```

## 🔧 Configuration

See individual service README files for specific configuration details.

## 📊 Features

- ✅ User authentication with Google OAuth
- ✅ Secure book management
- ✅ Advanced text analytics
- ✅ Responsive design
- ✅ RESTful APIs
- ✅ Microservices architecture
- ✅ Database persistence
- ✅ Swagger documentation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request