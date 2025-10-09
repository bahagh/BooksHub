# BookHub Frontend

A modern React frontend application for the BookHub microservices platform, built with TypeScript, Material-UI, and React Query.

## 🚀 Features

- **Modern UI/UX**: Built with Material-UI for beautiful, responsive design
- **Authentication**: JWT-based authentication with Google OAuth integration
- **State Management**: React Query for efficient server state management
- **Routing**: React Router for client-side navigation
- **Form Handling**: Formik with Yup validation
- **TypeScript**: Full type safety throughout the application
- **Responsive Design**: Mobile-first design approach

## 🛠 Tech Stack

- **Framework**: React 18 with TypeScript
- **UI Library**: Material-UI (MUI) v5
- **State Management**: React Query v3
- **Routing**: React Router v6
- **Form Handling**: Formik + Yup
- **HTTP Client**: Axios
- **Build Tool**: Create React App

## 📦 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Auth/           # Authentication components
│   └── Layout/         # Layout components
├── contexts/           # React contexts
│   └── AuthContext.tsx # Authentication context
├── pages/              # Page components
│   ├── Auth/           # Login, Register pages
│   ├── Books/          # Book-related pages
│   ├── Dashboard/      # Dashboard page
│   └── Profile/        # User profile pages
├── services/           # API services
│   ├── api.ts          # Base API configuration
│   ├── authService.ts  # Authentication API calls
│   └── booksService.ts # Books API calls
├── types/              # TypeScript type definitions
│   └── index.ts        # All type definitions
├── utils/              # Utility functions
├── App.tsx             # Main app component
└── index.tsx           # App entry point
```

## 🚦 Getting Started

### Prerequisites

- Node.js 16+ and npm
- Backend services running (UserService, BooksService, API Gateway)

### Installation

1. **Navigate to the frontend directory**:
   ```bash
   cd microservices-books-app/frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment**:
   ```bash
   cp .env.example .env
   ```
   Update the `.env` file with your API endpoints and configuration.

4. **Start the development server**:
   ```bash
   npm start
   ```
   Or use the provided scripts:
   ```bash
   # Windows PowerShell
   .\start-dev.ps1
   
   # Bash/WSL
   ./start-dev.sh
   ```

The application will open at `http://localhost:3000`.

## 🔧 Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App (not recommended)

## 🔐 Authentication Flow

1. **Login/Register**: Users can authenticate with email/password or Google OAuth
2. **JWT Tokens**: Access tokens with 15-minute expiry, refresh tokens with 7-day expiry
3. **Auto-refresh**: Automatic token refresh when tokens are close to expiry
4. **Protected Routes**: Route guards to ensure only authenticated users can access protected pages

## 📱 Pages & Features

### Authentication Pages
- **Login**: Email/password and Google OAuth login
- **Register**: User registration with validation

### Dashboard
- **Overview**: Reading statistics and recent activity
- **Quick Actions**: Easy access to common features
- **Recommendations**: Personalized book recommendations

### Books
- **Browse**: Search and filter books by genre, author, rating
- **Details**: Detailed book information, ratings, and comments
- **Reading**: Book reading interface (to be implemented)

### Profile
- **User Info**: View and edit profile information
- **Statistics**: Reading statistics and achievements
- **Settings**: Account and privacy settings

## 🌐 API Integration

The frontend communicates with the backend through the API Gateway at `http://localhost:5000` (configurable).

### Key Services
- **Authentication**: `/api/auth/*` - Login, register, token refresh
- **Books**: `/api/books/*` - CRUD operations, search, ratings, comments
- **Analytics**: `/api/books/analytics` - Reading statistics and recommendations

### Error Handling
- Automatic token refresh on 401 errors
- Network error handling with user-friendly messages
- Form validation with detailed error messages

## 🎨 Theming & Styling

The application uses Material-UI's theming system:

- **Primary Color**: Blue (#1976d2)
- **Secondary Color**: Pink (#dc004e)
- **Typography**: Roboto font family
- **Responsive Breakpoints**: Mobile-first design

## 🔧 Configuration

### Environment Variables

```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id_here
```

### Build Configuration

The application is configured for modern browsers and includes:
- TypeScript compilation
- ES6+ features
- CSS preprocessing
- Image optimization
- Bundle splitting

## 🧪 Testing (To be implemented)

- Unit tests with Jest and React Testing Library
- Integration tests for key user flows
- E2E tests with Cypress

## 📋 TODO

- [ ] Implement Google OAuth integration
- [ ] Add book reading interface
- [ ] Implement advanced search and filters
- [ ] Add dark mode theme
- [ ] Implement notifications system
- [ ] Add offline support with service workers
- [ ] Implement comprehensive testing suite
- [ ] Add accessibility features (a11y)
- [ ] Implement internationalization (i18n)

## 🐛 Troubleshooting

### Common Issues

1. **Port already in use**: Change the port in package.json scripts or kill the process using port 3000
2. **API connection issues**: Ensure backend services are running and API_URL is correct
3. **Build errors**: Clear node_modules and reinstall dependencies

### Development Tips

- Use React DevTools browser extension for debugging
- Enable React Query DevTools for API state inspection
- Check browser console for detailed error messages

## 📄 License

This project is part of the BookHub microservices platform.