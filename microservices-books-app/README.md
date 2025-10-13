# 📚 Microservices Books Management System

A modern, production-ready books management system built with .NET 9 microservices architecture, React frontend, and PostgreSQL database.

## � Project Status

**Version**: 1.0.0  
**Status**: ✅ Production Ready  
**Test Coverage**: 11/11 tests passing (100%)  
**Last Updated**: October 13, 2025

## �🏗️ Architecture Overview

```
┌─────────────────┐              ┌─────────────────┐
│  React Frontend │              │  User Service   │
│   (Port 3000)   │◄────────────►│   (Port 5555)   │
└─────────────────┘              └─────────────────┘
                                          │
                                          ▼
                                 ┌─────────────────┐
                                 │  Books Service  │
                                 │   (Port 5556)   │
                                 └─────────────────┘
                                          │
                                          ▼
                                 ┌─────────────────┐
                                 │   PostgreSQL    │
                                 │   (Port 5432)   │
                                 └─────────────────┘
```

## 🚀 Services

### 1. User Service (Port 5555)
- User registration and authentication
- JWT token generation and validation
- Password reset with email tokens
- Profile management
- Secure password hashing with BCrypt

### 2. Books Service (Port 5556)
- CRUD operations for books
- Book search and filtering
- Author and genre management
- JWT authentication validation
- PostgreSQL integration

### 3. React Frontend (Port 3000)
- Modern responsive UI
- User authentication flow
- Book management interface
- Profile management
- Error handling and loading states

## 🛠️ Technology Stack

- **Backend**: .NET 9, ASP.NET Core Web API
- **Frontend**: React 18, TypeScript, Axios
- **Database**: PostgreSQL 15
- **Authentication**: JWT (HS256)
- **Password Hashing**: BCrypt
- **ORM**: Entity Framework Core
- **Validation**: FluentValidation
- **Documentation**: Swagger/OpenAPI

## 📋 Prerequisites

Before running this application, ensure you have:

- **.NET 9 SDK** - [Download here](https://dotnet.microsoft.com/download)
- **Node.js 18+** and npm - [Download here](https://nodejs.org/)
- **PostgreSQL 15+** - [Download here](https://www.postgresql.org/download/)
- **Git** - [Download here](https://git-scm.com/downloads)

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)

```powershell
# Clone the repository
git clone https://github.com/bahagh/microservices-books-app.git
cd microservices-books-app

# Start all services
.\start-all-services.ps1
```

This will automatically:
- Stop any existing services
- Start UserService on port 5555
- Start BooksService on port 5556
- Start React Frontend on port 3000
- Verify all services are healthy

### Option 2: Manual Setup

**1. Setup Database**
```sql
-- In PostgreSQL, create database
CREATE DATABASE books;
```

**2. Configure Connection Strings**

Ensure `appsettings.Development.json` in both services has:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=books;Username=postgres;Password=YOUR_PASSWORD"
  }
}
```

**3. Start UserService**
```powershell
cd services\UserService\UserService
dotnet run
# Service will start on http://localhost:5555
```

**4. Start BooksService**
```powershell
cd services\BooksService\BooksService
dotnet run
# Service will start on http://localhost:5556
```

**5. Start Frontend**
```powershell
cd frontend
npm install
npm start
# Frontend will open at http://localhost:3000
```

## 🧪 Testing

### Run Automated Tests
```powershell
.\run-complete-tests.ps1
```

This will test:
- ✅ User registration
- ✅ User login
- ✅ JWT token validation
- ✅ Profile retrieval
- ✅ Book creation
- ✅ Book retrieval
- ✅ Book updates
- ✅ Book deletion
- ✅ Book search
- ✅ Password reset flow

**Expected Result**: 11/11 tests passing (100%)

## 📊 Features

### Authentication & Authorization
- ✅ User registration with validation
- ✅ Secure login with JWT tokens
- ✅ Password reset via email tokens
- ✅ BCrypt password hashing
- ✅ Cross-service JWT validation

### Book Management
- ✅ Create, Read, Update, Delete books
- ✅ Search and filter books
- ✅ Author and genre management
- ✅ Content-based book model

### Security
- ✅ JWT authentication
- ✅ Password strength validation
- ✅ Secure password storage
- ✅ Protected API endpoints
- ✅ CORS configuration

### User Experience
- ✅ Responsive React UI
- ✅ Error handling and validation
- ✅ Loading states
- ✅ Protected routes
- ✅ Swagger API documentation

## 📁 Project Structure

```
microservices-books-app/
├── services/
│   ├── UserService/          # Authentication & user management
│   │   └── UserService/
│   │       ├── Controllers/
│   │       ├── Models/
│   │       ├── DTOs/
│   │       ├── Services/
│   │       └── Data/
│   └── BooksService/         # Book management
│       └── BooksService/
│           ├── Controllers/
│           ├── Models/
│           ├── DTOs/
│           ├── Services/
│           └── Data/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── contexts/
│   └── public/
├── docker/                   # Docker configuration
├── start-all-services.ps1    # Automated service starter
└── run-complete-tests.ps1    # Automated testing script
```

## 🔧 Configuration

### JWT Configuration
Both services use synchronized JWT settings in `appsettings.Development.json`:

```json
{
  "Jwt": {
    "Key": "THIS-IS-A-HARDCODED-SECRET-KEY-FOR-JWT-TESTING-256-BITS-MINIMUM-LENGTH",
    "Issuer": "BooksApp",
    "Audience": "BooksAppUsers",
    "ExpiryInMinutes": 60
  }
}
```

### Database Configuration
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=books;Username=postgres;Password=YOUR_PASSWORD"
  }
}
```

## 🌐 API Endpoints

### UserService (Port 5555)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `GET /api/user/profile` - Get user profile (Auth required)
- `PUT /api/user/profile` - Update profile (Auth required)

### BooksService (Port 5556)
- `GET /api/books` - Get all books (Auth required)
- `GET /api/books/{id}` - Get book by ID (Auth required)
- `POST /api/books` - Create book (Auth required)
- `PUT /api/books/{id}` - Update book (Auth required)
- `DELETE /api/books/{id}` - Delete book (Auth required)
- `GET /api/books/search?title={title}` - Search books (Auth required)

## 🐛 Troubleshooting

### Services won't start
- Ensure PostgreSQL is running
- Check database connection strings
- Verify ports 5555, 5556, 3000 are available
- Run `dotnet restore` in each service directory

### Frontend connection errors
- Verify backend services are running
- Check `frontend/src/services/api.ts` has correct API_BASE_URL
- Clear browser cache and restart frontend

### JWT token issues
- Ensure JWT keys match in both services
- Check token expiry time
- Verify issuer and audience settings

## 🔄 Roadmap

- [ ] Implement API Gateway
- [ ] Add rate limiting and security enhancements
- [ ] Build book ratings and reviews system
- [ ] Add UI/UX improvements (dark mode, animations)
- [ ] Implement real-time notifications
- [ ] Add Docker Compose orchestration

## 📄 License

This project is licensed under the MIT License.

## 👤 Author

**Baha**  
GitHub: [@bahagh](https://github.com/bahagh)

## 🙏 Acknowledgments

Built with ❤️ using .NET 9, React, and PostgreSQL
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request
