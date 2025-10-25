import { booksApi as api, handleApiError } from './api';
import { createAppError } from '../utils/errors';
import {
  Book,
  CreateBookRequest,
  UpdateBookRequest,
  BookQueryParams,
  BookRating,
  CreateRatingRequest,
  UpdateRatingRequest,
  RatingQueryParams,
  BookComment,
  CreateCommentRequest,
  UpdateCommentRequest,
  CommentQueryParams,
  BookAnalytics,
  BookRecommendation,
  PaginatedResponse,
} from '../types';

class BooksService {
  private readonly BASE_URL = '/api/books';

  // Book CRUD Operations
  async getBooks(params?: BookQueryParams): Promise<PaginatedResponse<Book>> {
    try {
      const response = await api.get<PaginatedResponse<Book>>(
        this.BASE_URL,
        { params }
      );
      // booksApi.get() already unwraps response.data, so response IS the data
      return response;
    } catch (error: any) {
      console.error('❌ Get books error:', error);
      throw createAppError(handleApiError(error, 'Failed to load books. Please try again.'), error.type || 'BOOKS_FETCH_ERROR');
    }
  }

  async getBookById(id: string): Promise<Book> {
    try {
      if (!id) {
        throw createAppError('Book ID is required', 'VALIDATION_ERROR');
      }

      const response = await api.get<Book>(`${this.BASE_URL}/${id}`);
      return response; // Already unwrapped by booksApi
    } catch (error: any) {
      console.error('❌ Get book error:', error);
      
      if (error.status === 404) {
        throw createAppError('Book not found', 'NOT_FOUND_ERROR', error.status);
      }
      
      throw createAppError(handleApiError(error, 'Failed to load book details'), error.type || 'BOOK_FETCH_ERROR');
    }
  }

  async createBook(bookData: CreateBookRequest): Promise<Book> {
    try {
      // Validate required fields
      if (!bookData.title?.trim()) {
        throw createAppError('Book title is required', 'VALIDATION_ERROR');
      }

      if (!bookData.content?.trim()) {
        throw createAppError('Book content is required', 'VALIDATION_ERROR');
      }

      if (bookData.content.trim().length < 10) {
        throw createAppError('Book content must be at least 10 characters', 'VALIDATION_ERROR');
      }

      console.log('📤 Sending book data:', JSON.stringify(bookData, null, 2));
      const response = await api.post<Book>(this.BASE_URL, bookData);
      console.log('✅ Book created successfully');
      return response;
    } catch (error: any) {
      console.error('❌ Create book error:', error);
      console.error('❌ Error response data:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      
      if (error.status === 409) {
        throw createAppError('A book with this ISBN already exists', 'CONFLICT_ERROR', error.status);
      }

      if (error.status === 401) {
        throw createAppError('You must be logged in to create books', 'AUTH_ERROR', error.status);
      }

      if (error.status === 403) {
        throw createAppError('You do not have permission to create books', 'FORBIDDEN_ERROR', error.status);
      }

      // Extract backend validation error message
      const backendMessage = error.response?.data?.message || 
                            error.response?.data?.title ||
                            error.response?.data?.errors;
      
      if (backendMessage) {
        console.error('❌ Backend error message:', backendMessage);
      }
      
      throw createAppError(backendMessage || handleApiError(error, 'Failed to create book. Please try again.'), error.type || 'BOOK_CREATE_ERROR', error.response?.status, error.response?.data);
    }
  }

  async updateBook(id: string, bookData: UpdateBookRequest): Promise<Book> {
    try {
      if (!id) {
        throw createAppError('Book ID is required', 'VALIDATION_ERROR');
      }

      // Validate fields if they are provided
      if (bookData.title !== undefined && !bookData.title?.trim()) {
        throw createAppError('Book title cannot be empty', 'VALIDATION_ERROR');
      }

      if (bookData.author !== undefined && !bookData.author?.trim()) {
        throw createAppError('Author name cannot be empty', 'VALIDATION_ERROR');
      }

      if (bookData.content !== undefined && bookData.content.trim().length < 10) {
        throw createAppError('Content must be at least 10 characters long', 'VALIDATION_ERROR');
      }

      console.log('📤 Updating book with data:', JSON.stringify(bookData, null, 2));
      const response = await api.put<Book>(`${this.BASE_URL}/${id}`, bookData);
      console.log('✅ Book updated successfully');
      return response; // Already unwrapped by booksApi
    } catch (error: any) {
      console.error('❌ Update book error:', error);
      
      if (error.status === 404) {
        throw createAppError('Book not found', 'NOT_FOUND_ERROR', error.status);
      }

      if (error.status === 401) {
        throw createAppError('You must be logged in to update books', 'AUTH_ERROR', error.status);
      }

      if (error.status === 403) {
        throw createAppError('You do not have permission to update this book', 'FORBIDDEN_ERROR', error.status);
      }
      
      throw createAppError(handleApiError(error, 'Failed to update book. Please try again.'), error.type || 'BOOK_UPDATE_ERROR');
    }
  }

  async deleteBook(id: string): Promise<void> {
    try {
      if (!id) {
        throw createAppError('Book ID is required', 'VALIDATION_ERROR');
      }

      await api.delete(`${this.BASE_URL}/${id}`);
      console.log('✅ Book deleted successfully');
    } catch (error: any) {
      console.error('❌ Delete book error:', error);
      
      if (error.status === 404) {
        throw createAppError('Book not found', 'NOT_FOUND_ERROR', error.status);
      }

      if (error.status === 401) {
        throw createAppError('You must be logged in to delete books', 'AUTH_ERROR', error.status);
      }

      if (error.status === 403) {
        throw createAppError('You do not have permission to delete this book', 'FORBIDDEN_ERROR', error.status);
      }
      
      throw createAppError(handleApiError(error, 'Failed to delete book. Please try again.'), error.type || 'BOOK_DELETE_ERROR');
    }
  }

  // Search functionality
  async searchBooks(query: string, params?: Omit<BookQueryParams, 'search'>): Promise<PaginatedResponse<Book>> {
    const response = await api.get<PaginatedResponse<Book>>(
      `${this.BASE_URL}/search`,
      { params: { search: query, ...params } }
    );
    return response; // Already unwrapped by booksApi
  }

  // Book viewing (for analytics)
  async recordBookView(id: string): Promise<void> {
    await api.post(`${this.BASE_URL}/${id}/view`);
  }

  // Rating Operations
  async getBookRatings(bookId: string, params?: RatingQueryParams): Promise<PaginatedResponse<BookRating>> {
    const response = await api.get<PaginatedResponse<BookRating>>(
      `${this.BASE_URL}/${bookId}/ratings`,
      { params }
    );
    return response; // Already unwrapped by booksApi
  }

  async getUserRating(bookId: string): Promise<BookRating | null> {
    try {
      const response = await api.get<BookRating>(
        `${this.BASE_URL}/${bookId}/ratings/my-rating`
      );
      return response; // Already unwrapped by booksApi
    } catch (error: any) {
      if (error.statusCode === 404) {
        return null;
      }
      throw error;
    }
  }

  async createRating(bookId: string, ratingData: CreateRatingRequest): Promise<BookRating> {
    const response = await api.post<BookRating>(
      `${this.BASE_URL}/${bookId}/ratings`,
      ratingData
    );
    return response; // Already unwrapped by booksApi
  }

  async updateRating(bookId: string, ratingId: string, ratingData: UpdateRatingRequest): Promise<BookRating> {
    const response = await api.put<BookRating>(
      `${this.BASE_URL}/${bookId}/ratings/${ratingId}`,
      ratingData
    );
    return response; // Already unwrapped by booksApi
  }

  async deleteRating(bookId: string, ratingId: string): Promise<void> {
    await api.delete(`${this.BASE_URL}/${bookId}/ratings/${ratingId}`);
  }

  // Comment Operations
  async getBookComments(bookId: string, params?: CommentQueryParams): Promise<PaginatedResponse<BookComment>> {
    const response = await api.get<PaginatedResponse<BookComment>>(
      `${this.BASE_URL}/${bookId}/comments`,
      { params }
    );
    return response; // Already unwrapped by booksApi
  }

  async createComment(bookId: string, commentData: CreateCommentRequest): Promise<BookComment> {
    const response = await api.post<BookComment>(
      `${this.BASE_URL}/${bookId}/comments`,
      commentData
    );
    return response; // Already unwrapped by booksApi
  }

  async updateComment(bookId: string, commentId: string, commentData: UpdateCommentRequest): Promise<BookComment> {
    const response = await api.put<BookComment>(
      `${this.BASE_URL}/${bookId}/comments/${commentId}`,
      commentData
    );
    return response; // Already unwrapped by booksApi
  }

  async deleteComment(bookId: string, commentId: string): Promise<void> {
    await api.delete(`${this.BASE_URL}/${bookId}/comments/${commentId}`);
  }

  async getCommentReplies(bookId: string, commentId: string, params?: CommentQueryParams): Promise<PaginatedResponse<BookComment>> {
    const response = await api.get<PaginatedResponse<BookComment>>(
      `${this.BASE_URL}/${bookId}/comments/${commentId}/replies`,
      { params }
    );
    return response; // Already unwrapped by booksApi
  }

  // Analytics Operations
  async getBookAnalytics(): Promise<BookAnalytics> {
    const response = await api.get<BookAnalytics>(`${this.BASE_URL}/analytics`);
    return response; // Already unwrapped by booksApi
  }

  async getBookRecommendations(limit?: number): Promise<BookRecommendation[]> {
    const response = await api.get<BookRecommendation[]>(
      `${this.BASE_URL}/recommendations`,
      { params: { limit } }
    );
    return response; // Already unwrapped by booksApi
  }

  async getUserBookRecommendations(userId: string, limit?: number): Promise<BookRecommendation[]> {
    const response = await api.get<BookRecommendation[]>(
      `${this.BASE_URL}/recommendations/user/${userId}`,
      { params: { limit } }
    );
    return response; // Already unwrapped by booksApi
  }

  // Popular and trending books
  async getPopularBooks(limit?: number): Promise<Book[]> {
    const response = await api.get<Book[]>(
      `${this.BASE_URL}/popular`,
      { params: { limit } }
    );
    return response; // Already unwrapped by booksApi
  }

  async getTrendingBooks(limit?: number): Promise<Book[]> {
    const response = await api.get<Book[]>(
      `${this.BASE_URL}/trending`,
      { params: { limit } }
    );
    return response; // Already unwrapped by booksApi
  }

  async getRecentBooks(limit?: number): Promise<Book[]> {
    const response = await api.get<Book[]>(
      `${this.BASE_URL}/recent`,
      { params: { limit } }
    );
    return response; // Already unwrapped by booksApi
  }

  // Genre operations
  async getGenres(): Promise<string[]> {
    try {
      const response = await api.get<string[]>(`${this.BASE_URL}/genres`);
      // booksApi.get() already unwraps response.data, so response IS the data
      return Array.isArray(response) ? response : [];
    } catch (error: any) {
      console.error('❌ Get genres error:', error);
      throw createAppError(handleApiError(error, 'Failed to load genres'), error.type || 'GENRES_FETCH_ERROR');
    }
  }

  async getBooksByGenre(genre: string, params?: Omit<BookQueryParams, 'genre'>): Promise<PaginatedResponse<Book>> {
    const response = await api.get<PaginatedResponse<Book>>(
      `${this.BASE_URL}/genre/${encodeURIComponent(genre)}`,
      { params }
    );
    return response; // Already unwrapped by booksApi
  }

  // Author operations
  async getAuthors(): Promise<string[]> {
    const response = await api.get<string[]>(`${this.BASE_URL}/authors`);
    return response; // Already unwrapped by booksApi
  }

  async getBooksByAuthor(author: string, params?: Omit<BookQueryParams, 'author'>): Promise<PaginatedResponse<Book>> {
    const response = await api.get<PaginatedResponse<Book>>(
      `${this.BASE_URL}/author/${encodeURIComponent(author)}`,
      { params }
    );
    return response; // Already unwrapped by booksApi
  }

  // File operations
  async uploadBookCover(bookId: string, file: File): Promise<string> {
    const formData = new FormData();
    formData.append('cover', file);

    const response = await api.post<{ coverImageUrl: string }>(
      `${this.BASE_URL}/${bookId}/cover`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.coverImageUrl; // Already unwrapped by booksApi
  }

  async uploadBookContent(bookId: string, file: File): Promise<void> {
    const formData = new FormData();
    formData.append('content', file);

    await api.post(
      `${this.BASE_URL}/${bookId}/content`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
  }

  // Bulk operations
  async bulkDeleteBooks(bookIds: string[]): Promise<void> {
    await api.delete(`${this.BASE_URL}/bulk`, {
      data: { bookIds },
    });
  }

  async bulkUpdateBooks(updates: Array<{ id: string } & UpdateBookRequest>): Promise<Book[]> {
    const response = await api.put<Book[]>(`${this.BASE_URL}/bulk`, updates);
    return response; // Already unwrapped by booksApi
  }
}

export const booksService = new BooksService();
export default booksService;
