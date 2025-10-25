# Books Management System

A microservices-based book management platform where users can create, share, and discover books with ratings, comments, and real-time notifications.

## Tech Stack

- **.NET 9** - Backend microservices
- **React 18 + TypeScript** - Frontend
- **PostgreSQL** - Database
- **Docker** - Containerization
- **SignalR** - Real-time notifications
- **JWT** - Authentication

## Quick Start

### Run Locally

1. Clone repository:
```bash
git clone https://github.com/bahagh/Books-Project-Restructured-.git
cd Books-Project-Restructured-/microservices-books-app
```

2. Create `.env` file:
```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
POSTGRES_DB=books
JWT_KEY=your_jwt_secret_key_min_32_chars
```

3. Start with Docker:
```bash
docker-compose up -d
```

4. Access:
- Frontend: http://localhost:3000
- API Gateway: http://localhost:5000

## Deploy to Web (Free)

Deploy on **Railway.app** for free:

1. **Sign up** at [railway.app](https://railway.app) with GitHub

2. **Create project** from GitHub repo

3. **Add PostgreSQL**: Click "+ New" → "Database" → "Add PostgreSQL"

4. **Deploy each service**:

   **UserService:**
   - Root Directory: `microservices-books-app/services/UserService`
   - Dockerfile Path: `UserService/Dockerfile`
   - Environment Variables:
     ```
     ASPNETCORE_ENVIRONMENT=Production
     ASPNETCORE_URLS=http://0.0.0.0:$PORT
     ConnectionStrings__DefaultConnection=${{Postgres.DATABASE_URL}}
     JWT__Key=your-secret-key-min-32-chars
     JWT__Issuer=BooksApp
     JWT__Audience=BooksApp
     ```

   **BooksService:**
   - Root Directory: `microservices-books-app/services/BooksService`
   - Dockerfile Path: `BooksService/Dockerfile`
   - Environment Variables:
     ```
     ASPNETCORE_ENVIRONMENT=Production
     ASPNETCORE_URLS=http://0.0.0.0:$PORT
     ConnectionStrings__DefaultConnection=${{Postgres.DATABASE_URL}}
     UserServiceUrl=https://${{userservice.RAILWAY_PUBLIC_DOMAIN}}
     ```

   **API Gateway:**
   - Root Directory: `microservices-books-app/api-gateway`
   - Dockerfile Path: `ApiGateway/Dockerfile`
   - Environment Variables:
     ```
     ASPNETCORE_ENVIRONMENT=Production
     ASPNETCORE_URLS=http://0.0.0.0:$PORT
     ```

   **Frontend:**
   - Root Directory: `microservices-books-app/frontend`
   - Dockerfile Path: `Dockerfile`
   - Environment Variables:
     ```
     REACT_APP_API_URL=https://${{apigateway.RAILWAY_PUBLIC_DOMAIN}}
     ```

5. **Generate domains**: Settings → Networking → "Generate Domain" for each service

6. **Update CORS** in backend code with your Railway frontend URL, then commit and push

Your app will be live at: `https://[your-frontend].up.railway.app`

**Cost:** $0/month (within $5 free credit)

## Features

- User authentication (email/password + Google OAuth)
- Book management (create, edit, delete)
- Personal library system
- Ratings and comments
- Real-time notifications
- Search and filtering

## Project Structure

```
microservices-books-app/
├── services/
│   ├── UserService/        # Authentication & users
│   ├── BooksService/       # Books & library
├── api-gateway/            # Ocelot gateway
├── frontend/               # React app
└── docker-compose.yml
```

## License

MIT