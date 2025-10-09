// User Types
export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresAt: string;
}

export interface GoogleAuthRequest {
  idToken: string;
}

// Book Types
export interface Book {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  description?: string;
  genre?: string;
  publicationYear?: number;
  coverImageUrl?: string;
  content?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  averageRating?: number;
  totalRatings?: number;
  totalComments?: number;
  viewCount?: number;
}

export interface CreateBookRequest {
  title: string;
  author: string;
  isbn?: string;
  description?: string;
  genre?: string;
  publicationYear?: number;
  coverImageUrl?: string;
  content?: string;
  metadata?: Record<string, any>;
}

export interface UpdateBookRequest {
  title?: string;
  author?: string;
  isbn?: string;
  description?: string;
  genre?: string;
  publicationYear?: number;
  coverImageUrl?: string;
  content?: string;
  metadata?: Record<string, any>;
}

// Rating Types
export interface BookRating {
  id: string;
  bookId: string;
  userId: string;
  rating: number;
  review?: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

export interface CreateRatingRequest {
  rating: number;
  review?: string;
}

export interface UpdateRatingRequest {
  rating?: number;
  review?: string;
}

// Comment Types
export interface BookComment {
  id: string;
  bookId: string;
  userId: string;
  content: string;
  parentCommentId?: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
  replies?: BookComment[];
  replyCount?: number;
}

export interface CreateCommentRequest {
  content: string;
  parentCommentId?: string;
}

export interface UpdateCommentRequest {
  content: string;
}

// Analytics Types
export interface BookAnalytics {
  totalBooks: number;
  totalViews: number;
  totalRatings: number;
  totalComments: number;
  averageRating: number;
  topRatedBooks: Book[];
  mostViewedBooks: Book[];
  mostCommentedBooks: Book[];
  recentlyAddedBooks: Book[];
}

export interface UserAnalytics {
  totalBooksRead: number;
  totalRatingsGiven: number;
  totalCommentsPosted: number;
  averageRatingGiven: number;
  favoriteGenres: string[];
  readingActivity: ReadingActivity[];
}

export interface ReadingActivity {
  date: string;
  booksRead: number;
  ratingsGiven: number;
  commentsPosted: number;
}

export interface BookRecommendation {
  book: Book;
  score: number;
  reason: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  statusCode?: number;
}

// Query Parameters
export interface BookQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  genre?: string;
  author?: string;
  sortBy?: 'title' | 'author' | 'createdAt' | 'averageRating' | 'viewCount';
  sortDirection?: 'asc' | 'desc';
}

export interface CommentQueryParams {
  page?: number;
  pageSize?: number;
  sortBy?: 'createdAt' | 'updatedAt';
  sortDirection?: 'asc' | 'desc';
}

export interface RatingQueryParams {
  page?: number;
  pageSize?: number;
  sortBy?: 'createdAt' | 'rating';
  sortDirection?: 'asc' | 'desc';
}

// Form Types
export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName?: string;
  lastName?: string;
  acceptTerms: boolean;
}

export interface BookFormData {
  title: string;
  author: string;
  isbn?: string;
  description?: string;
  genre?: string;
  publicationYear?: number;
  coverImageUrl?: string;
  content?: string;
}

export interface RatingFormData {
  rating: number;
  review?: string;
}

export interface CommentFormData {
  content: string;
}

// UI State Types
export interface LoadingState {
  [key: string]: boolean;
}

export interface ErrorState {
  [key: string]: string | null;
}

// Context Types
export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// Theme Types
export interface ThemeContextType {
  darkMode: boolean;
  toggleDarkMode: () => void;
}