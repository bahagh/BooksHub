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
  content: string;
  userId: string;
  description?: string;
  author?: string;
  genre?: string;
  language?: string;
  wordCount?: number;
  characterCount?: number;
  readingTimeMinutes?: number;
  status: number | string; // Backend returns number: 0=Draft, 1=InReview, 2=Published, 3=Archived
  isPublic: boolean;
  viewCount?: number;
  averageRating?: number;
  ratingCount?: number;
  commentCount?: number;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookRequest {
  title: string;
  content: string;
  description?: string;
  author?: string;
  genre?: string;
  language?: string;
  isPublic?: boolean;
  status?: number; // 0=Draft, 1=InReview, 2=Published, 3=Archived
  tags?: string[];
}

export interface UpdateBookRequest {
  title?: string;
  content?: string;
  description?: string;
  author?: string;
  genre?: string;
  language?: string;
  isPublic?: boolean;
  status?: number; // 0=Draft, 1=InReview, 2=Published, 3=Archived
  tags?: string[];
}

// Rating Types
export interface BookRating {
  id: string;
  bookId: string;
  userId?: string; // Now optional (nullable for anonymous)
  username?: string; // Display name (anonymous or real)
  rating: number;
  review?: string;
  createdAt: string;
  updatedAt: string;
  isAnonymous: boolean; // NEW: Flag for anonymous ratings
  anonymousUsername?: string; // NEW: Anonymous display name
  user?: User;
}

export interface CreateRatingRequest {
  rating: number;
  review?: string;
  isAnonymous?: boolean; // NEW: Allow anonymous rating
  anonymousUsername?: string; // NEW: Required if isAnonymous is true
}

export interface UpdateRatingRequest {
  rating?: number;
  review?: string;
}

// Comment Types
export interface BookComment {
  id: string;
  bookId: string;
  userId?: string; // Now optional (nullable for anonymous)
  username?: string; // Display name (anonymous or real)
  content: string;
  parentCommentId?: string;
  createdAt: string;
  updatedAt: string;
  isAnonymous: boolean; // NEW: Flag for anonymous comments
  anonymousUsername?: string; // NEW: Anonymous display name
  isEdited?: boolean; // Existing field
  user?: User;
  replies?: BookComment[];
  replyCount?: number;
}

export interface CreateCommentRequest {
  content: string;
  parentCommentId?: string;
  isAnonymous?: boolean; // NEW: Allow anonymous comment
  anonymousUsername?: string; // NEW: Required if isAnonymous is true
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
  items: T[];  // Backend uses 'Items' (lowercase 'items' in JSON)
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

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: 'CommentReply' | 'NewRating' | 'BookUpdate' | 'NewFollower';
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface CreateNotificationRequest {
  userId: string;
  type: string;
  title: string;
  message: string;
  link?: string;
}

export interface UpdateNotificationRequest {
  isRead: boolean;
}

export interface NotificationPreferences {
  id: string;
  userId: string;
  emailNotifications: boolean;
  emailOnCommentReply: boolean;
  emailOnNewRating: boolean;
  emailOnBookUpdate: boolean;
  emailOnNewFollower: boolean;
  inAppNotifications: boolean;
  inAppOnCommentReply: boolean;
  inAppOnNewRating: boolean;
  inAppOnBookUpdate: boolean;
  inAppOnNewFollower: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateNotificationPreferencesRequest {
  emailNotifications: boolean;
  emailOnCommentReply: boolean;
  emailOnNewRating: boolean;
  emailOnBookUpdate: boolean;
  emailOnNewFollower: boolean;
  inAppNotifications: boolean;
  inAppOnCommentReply: boolean;
  inAppOnNewRating: boolean;
  inAppOnBookUpdate: boolean;
  inAppOnNewFollower: boolean;
}

export interface NotificationSummary {
  totalCount: number;
  unreadCount: number;
  recentNotifications: Notification[];
}

export interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isConnected: boolean;
  isLoading: boolean;
  fetchNotifications: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  deleteAllRead: () => Promise<void>;
  preferences: NotificationPreferences | null;
  updatePreferences: (prefs: UpdateNotificationPreferencesRequest) => Promise<void>;
}