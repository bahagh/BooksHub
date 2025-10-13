import { api, handleApiError } from './api';
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
  ApiResponse,
  PaginatedResponse,
} from '../types';

class BooksService {
  private readonly BASE_URL = '/api/books';

  // Book CRUD Operations
  async getBooks(params?: BookQueryParams): Promise<PaginatedResponse<Book>> {
    try {
      const response = await api.get<ApiResponse<PaginatedResponse<Book>>>(
        this.BASE_URL,
        { params }
      );
      return response.data;
    } catch (error: any) {
      console.error('❌ Get books error:', error);
      throw {
        type: error.type || 'BOOKS_FETCH_ERROR',
        message: handleApiError(error, 'Failed to load books. Please try again.')
      };
    }
  }

  async getBookById(id: string): Promise<Book> {
    try {
      if (!id) {
        throw {
          type: 'VALIDATION_ERROR',
          message: 'Book ID is required'
        };
      }

      const response = await api.get<ApiResponse<Book>>(`${this.BASE_URL}/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Get book error:', error);
      
      if (error.status === 404) {
        throw {
          type: 'NOT_FOUND_ERROR',
          message: 'Book not found'
        };
      }
      
      throw {
        type: error.type || 'BOOK_FETCH_ERROR',
        message: handleApiError(error, 'Failed to load book details')
      };
    }
  }

  async createBook(bookData: CreateBookRequest): Promise<Book> {
    try {
      // Validate required fields
      if (!bookData.title?.trim()) {
        throw {
          type: 'VALIDATION_ERROR',
          message: 'Book title is required'
        };
      }

      if (!bookData.author?.trim()) {
        throw {
          type: 'VALIDATION_ERROR',
          message: 'Author name is required'
        };
      }

      if (!bookData.isbn?.trim()) {
        throw {
          type: 'VALIDATION_ERROR',
          message: 'ISBN is required'
        };
      }

      // Validate ISBN format (basic check)
      const isbnRegex = /^(?:ISBN(?:-1[03])?:? )?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)(?:97[89][- ]?)?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9X]$/;
      if (!isbnRegex.test(bookData.isbn.replace(/[- ]/g, ''))) {
        throw {
          type: 'VALIDATION_ERROR',
          message: 'Please enter a valid ISBN'
        };
      }

      if (bookData.publicationYear && bookData.publicationYear > new Date().getFullYear()) {
        throw {
          type: 'VALIDATION_ERROR',
          message: 'Publication year cannot be in the future'
        };
      }

      const response = await api.post<ApiResponse<Book>>(this.BASE_URL, bookData);
      console.log('✅ Book created successfully');
      return response.data;
    } catch (error: any) {
      console.error('❌ Create book error:', error);
      
      if (error.status === 409) {
        throw {
          type: 'CONFLICT_ERROR',
          message: 'A book with this ISBN already exists'
        };
      }

      if (error.status === 401) {
        throw {
          type: 'AUTH_ERROR',
          message: 'You must be logged in to create books'
        };
      }

      if (error.status === 403) {
        throw {
          type: 'FORBIDDEN_ERROR',
          message: 'You do not have permission to create books'
        };
      }
      
      throw {
        type: error.type || 'BOOK_CREATE_ERROR',
        message: handleApiError(error, 'Failed to create book. Please try again.')
      };
    }
  }

  async updateBook(id: string, bookData: UpdateBookRequest): Promise<Book> {
    try {
      if (!id) {
        throw {
          type: 'VALIDATION_ERROR',
          message: 'Book ID is required'
        };
      }

      // Validate fields if they are provided
      if (bookData.title !== undefined && !bookData.title?.trim()) {
        throw {
          type: 'VALIDATION_ERROR',
          message: 'Book title cannot be empty'
        };
      }

      if (bookData.author !== undefined && !bookData.author?.trim()) {
        throw {
          type: 'VALIDATION_ERROR',
          message: 'Author name cannot be empty'
        };
      }

      if (bookData.publicationYear && bookData.publicationYear > new Date().getFullYear()) {
        throw {
          type: 'VALIDATION_ERROR',
          message: 'Publication year cannot be in the future'
        };
      }

      const response = await api.put<ApiResponse<Book>>(`${this.BASE_URL}/${id}`, bookData);
      console.log('✅ Book updated successfully');
      return response.data;
    } catch (error: any) {
      console.error('❌ Update book error:', error);
      
      if (error.status === 404) {
        throw {
          type: 'NOT_FOUND_ERROR',
          message: 'Book not found'
        };
      }

      if (error.status === 401) {
        throw {
          type: 'AUTH_ERROR',
          message: 'You must be logged in to update books'
        };
      }

      if (error.status === 403) {
        throw {
          type: 'FORBIDDEN_ERROR',
          message: 'You do not have permission to update this book'
        };
      }
      
      throw {
        type: error.type || 'BOOK_UPDATE_ERROR',
        message: handleApiError(error, 'Failed to update book. Please try again.')
      };
    }
  }

  async deleteBook(id: string): Promise<void> {
    try {
      if (!id) {
        throw {
          type: 'VALIDATION_ERROR',
          message: 'Book ID is required'
        };
      }

      await api.delete(`${this.BASE_URL}/${id}`);
      console.log('✅ Book deleted successfully');
    } catch (error: any) {
      console.error('❌ Delete book error:', error);
      
      if (error.status === 404) {
        throw {
          type: 'NOT_FOUND_ERROR',
          message: 'Book not found'
        };
      }

      if (error.status === 401) {
        throw {
          type: 'AUTH_ERROR',
          message: 'You must be logged in to delete books'
        };
      }

      if (error.status === 403) {
        throw {
          type: 'FORBIDDEN_ERROR',
          message: 'You do not have permission to delete this book'
        };
      }
      
      throw {
        type: error.type || 'BOOK_DELETE_ERROR',
        message: handleApiError(error, 'Failed to delete book. Please try again.')
      };
    }
  }

  // Search functionality
  async searchBooks(query: string, params?: Omit<BookQueryParams, 'search'>): Promise<PaginatedResponse<Book>> {
    const response = await api.get<ApiResponse<PaginatedResponse<Book>>>(
      `${this.BASE_URL}/search`,
      { params: { search: query, ...params } }
    );
    return response.data;
  }

  // Book viewing (for analytics)
  async recordBookView(id: string): Promise<void> {
    await api.post(`${this.BASE_URL}/${id}/view`);
  }

  // Rating Operations
  async getBookRatings(bookId: string, params?: RatingQueryParams): Promise<PaginatedResponse<BookRating>> {
    const response = await api.get<ApiResponse<PaginatedResponse<BookRating>>>(
      `${this.BASE_URL}/${bookId}/ratings`,
      { params }
    );
    return response.data;
  }

  async getUserRating(bookId: string): Promise<BookRating | null> {
    try {
      const response = await api.get<ApiResponse<BookRating>>(
        `${this.BASE_URL}/${bookId}/ratings/my-rating`
      );
      return response.data;
    } catch (error: any) {
      if (error.statusCode === 404) {
        return null;
      }
      throw error;
    }
  }

  async createRating(bookId: string, ratingData: CreateRatingRequest): Promise<BookRating> {
    const response = await api.post<ApiResponse<BookRating>>(
      `${this.BASE_URL}/${bookId}/ratings`,
      ratingData
    );
    return response.data;
  }

  async updateRating(bookId: string, ratingData: UpdateRatingRequest): Promise<BookRating> {
    const response = await api.put<ApiResponse<BookRating>>(
      `${this.BASE_URL}/${bookId}/ratings/my-rating`,
      ratingData
    );
    return response.data;
  }

  async deleteRating(bookId: string): Promise<void> {
    await api.delete(`${this.BASE_URL}/${bookId}/ratings/my-rating`);
  }

  // Comment Operations
  async getBookComments(bookId: string, params?: CommentQueryParams): Promise<PaginatedResponse<BookComment>> {
    const response = await api.get<ApiResponse<PaginatedResponse<BookComment>>>(
      `${this.BASE_URL}/${bookId}/comments`,
      { params }
    );
    return response.data;
  }

  async createComment(bookId: string, commentData: CreateCommentRequest): Promise<BookComment> {
    const response = await api.post<ApiResponse<BookComment>>(
      `${this.BASE_URL}/${bookId}/comments`,
      commentData
    );
    return response.data;
  }

  async updateComment(bookId: string, commentId: string, commentData: UpdateCommentRequest): Promise<BookComment> {
    const response = await api.put<ApiResponse<BookComment>>(
      `${this.BASE_URL}/${bookId}/comments/${commentId}`,
      commentData
    );
    return response.data;
  }

  async deleteComment(bookId: string, commentId: string): Promise<void> {
    await api.delete(`${this.BASE_URL}/${bookId}/comments/${commentId}`);
  }

  async getCommentReplies(bookId: string, commentId: string, params?: CommentQueryParams): Promise<PaginatedResponse<BookComment>> {
    const response = await api.get<ApiResponse<PaginatedResponse<BookComment>>>(
      `${this.BASE_URL}/${bookId}/comments/${commentId}/replies`,
      { params }
    );
    return response.data;
  }

  // Analytics Operations
  async getBookAnalytics(): Promise<BookAnalytics> {
    const response = await api.get<ApiResponse<BookAnalytics>>(`${this.BASE_URL}/analytics`);
    return response.data;
  }

  async getBookRecommendations(limit?: number): Promise<BookRecommendation[]> {
    const response = await api.get<ApiResponse<BookRecommendation[]>>(
      `${this.BASE_URL}/recommendations`,
      { params: { limit } }
    );
    return response.data;
  }

  async getUserBookRecommendations(userId: string, limit?: number): Promise<BookRecommendation[]> {
    const response = await api.get<ApiResponse<BookRecommendation[]>>(
      `${this.BASE_URL}/recommendations/user/${userId}`,
      { params: { limit } }
    );
    return response.data;
  }

  // Popular and trending books
  async getPopularBooks(limit?: number): Promise<Book[]> {
    const response = await api.get<ApiResponse<Book[]>>(
      `${this.BASE_URL}/popular`,
      { params: { limit } }
    );
    return response.data;
  }

  async getTrendingBooks(limit?: number): Promise<Book[]> {
    const response = await api.get<ApiResponse<Book[]>>(
      `${this.BASE_URL}/trending`,
      { params: { limit } }
    );
    return response.data;
  }

  async getRecentBooks(limit?: number): Promise<Book[]> {
    const response = await api.get<ApiResponse<Book[]>>(
      `${this.BASE_URL}/recent`,
      { params: { limit } }
    );
    return response.data;
  }

  // Genre operations
  async getGenres(): Promise<string[]> {
    const response = await api.get<ApiResponse<string[]>>(`${this.BASE_URL}/genres`);
    return response.data;
  }

  async getBooksByGenre(genre: string, params?: Omit<BookQueryParams, 'genre'>): Promise<PaginatedResponse<Book>> {
    const response = await api.get<ApiResponse<PaginatedResponse<Book>>>(
      `${this.BASE_URL}/genre/${encodeURIComponent(genre)}`,
      { params }
    );
    return response.data;
  }

  // Author operations
  async getAuthors(): Promise<string[]> {
    const response = await api.get<ApiResponse<string[]>>(`${this.BASE_URL}/authors`);
    return response.data;
  }

  async getBooksByAuthor(author: string, params?: Omit<BookQueryParams, 'author'>): Promise<PaginatedResponse<Book>> {
    const response = await api.get<ApiResponse<PaginatedResponse<Book>>>(
      `${this.BASE_URL}/author/${encodeURIComponent(author)}`,
      { params }
    );
    return response.data;
  }

  // File operations
  async uploadBookCover(bookId: string, file: File): Promise<string> {
    const formData = new FormData();
    formData.append('cover', file);

    const response = await api.post<ApiResponse<{ coverImageUrl: string }>>(
      `${this.BASE_URL}/${bookId}/cover`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.coverImageUrl;
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
    const response = await api.put<ApiResponse<Book[]>>(`${this.BASE_URL}/bulk`, updates);
    return response.data;
  }
}

export const booksService = new BooksService();
export default booksService;