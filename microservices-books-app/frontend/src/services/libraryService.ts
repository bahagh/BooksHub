import { booksApi } from './api';
import { Book } from '../types';

export interface LibraryBook {
  id: string;
  bookId: string;
  userId: string;
  addedAt: string;
  book: Book;
}

export interface PaginatedLibraryResult {
  items: LibraryBook[];
  totalCount: number;
  page: number;
  pageSize: number;
}

class LibraryService {
  private BASE_URL = '/api/library';

  /**
   * Get all books in user's library (with client-side pagination)
   */
  async getLibraryBooks(page: number = 1, pageSize: number = 20): Promise<PaginatedLibraryResult> {
    // Backend returns simple Book[] array, not LibraryBook[]
    const allBooks = await booksApi.get<Book[]>(this.BASE_URL);
    
    // Client-side pagination and convert to LibraryBook format
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedBooks = allBooks.slice(startIndex, endIndex);
    
    // Convert Book[] to LibraryBook[] format expected by UI
    const items: LibraryBook[] = paginatedBooks.map(book => ({
      id: book.id,
      bookId: book.id,
      userId: book.userId,
      addedAt: book.createdAt || new Date().toISOString(),
      book: book
    }));
    
    return {
      items,
      totalCount: allBooks.length,
      page,
      pageSize
    };
  }

  /**
   * Add a book to user's library
   */
  async addToLibrary(bookId: string): Promise<void> {
    await booksApi.post(`${this.BASE_URL}/${bookId}`);
  }

  /**
   * Remove a book from user's library
   */
  async removeFromLibrary(bookId: string): Promise<void> {
    await booksApi.delete(`${this.BASE_URL}/${bookId}`);
  }

  /**
   * Check if a book is in user's library
   */
  async isInLibrary(bookId: string): Promise<boolean> {
    try {
      // Backend returns { inLibrary: boolean }
      const response = await booksApi.get<{ inLibrary: boolean }>(
        `${this.BASE_URL}/${bookId}/status`
      );
      return response.inLibrary;
    } catch (error) {
      console.error('Failed to check library status:', error);
      return false;
    }
  }
}

export const libraryService = new LibraryService();
