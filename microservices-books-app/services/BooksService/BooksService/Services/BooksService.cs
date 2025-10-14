using AutoMapper;
using Microsoft.EntityFrameworkCore;
using BooksService.Data;
using BooksService.DTOs;
using BooksService.Models;
using System.Linq.Expressions;

namespace BooksService.Services
{
    public interface IBooksService
    {
        Task<BookDto> CreateBookAsync(CreateBookDto createBookDto, Guid userId);
        Task<BookDto?> GetBookByIdAsync(Guid id, Guid? userId = null);
        Task<PaginatedResult<BookListDto>> GetBooksAsync(BookSearchDto searchDto, Guid? userId = null);
        Task<BookDto?> UpdateBookAsync(Guid id, UpdateBookDto updateBookDto, Guid userId);
        Task<bool> DeleteBookAsync(Guid id, Guid userId);
        Task<BookDto?> PublishBookAsync(Guid id, Guid userId);
        Task<PaginatedResult<BookListDto>> GetUserBooksAsync(Guid userId, BookSearchDto searchDto);
        Task<PaginatedResult<BookListDto>> GetPublicBooksAsync(BookSearchDto searchDto);
        Task<BookAnalyticsDto?> GetBookAnalyticsAsync(Guid bookId, Guid userId);
        Task<bool> IncrementViewCountAsync(Guid bookId, Guid? userId = null);
        Task<List<string>> GetGenresAsync();
    }

    public class BooksService : IBooksService
    {
        private readonly BooksDbContext _context;
        private readonly IMapper _mapper;
        private readonly ILogger<BooksService> _logger;

        public BooksService(BooksDbContext context, IMapper mapper, ILogger<BooksService> logger)
        {
            _context = context;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<BookDto> CreateBookAsync(CreateBookDto createBookDto, Guid userId)
        {
            _logger.LogInformation("Creating book with title: {Title} for user: {UserId}", 
                createBookDto.Title, userId);

            var book = _mapper.Map<Book>(createBookDto);
            book.UserId = userId;

            _context.Books.Add(book);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Successfully created book with ID: {BookId}", book.Id);

            return _mapper.Map<BookDto>(book);
        }

        public async Task<BookDto?> GetBookByIdAsync(Guid id, Guid? userId = null)
        {
            var query = _context.Books.AsQueryable();

            if (userId.HasValue)
            {
                // User can see their own books or public published books
                query = query.Where(b => b.Id == id && 
                    (b.UserId == userId.Value || (b.IsPublic && b.Status == BookStatus.Published)));
            }
            else
            {
                // Anonymous users can only see public published books
                query = query.Where(b => b.Id == id && b.IsPublic && b.Status == BookStatus.Published);
            }

            var book = await query.FirstOrDefaultAsync();
            if (book == null)
            {
                return null;
            }

            return _mapper.Map<BookDto>(book);
        }

        public async Task<PaginatedResult<BookListDto>> GetBooksAsync(BookSearchDto searchDto, Guid? userId = null)
        {
            var query = _context.Books.AsQueryable();

            // Apply security filters
            if (userId.HasValue)
            {
                query = query.Where(b => b.UserId == userId.Value || (b.IsPublic && b.Status == BookStatus.Published));
            }
            else
            {
                query = query.Where(b => b.IsPublic && b.Status == BookStatus.Published);
            }

            // Apply search filters
            query = ApplySearchFilters(query, searchDto);

            // Get total count before pagination
            var totalCount = await query.CountAsync();

            // Apply sorting
            query = ApplySorting(query, searchDto.SortBy, searchDto.SortOrder);

            // Apply pagination
            var books = await query
                .Skip((searchDto.Page - 1) * searchDto.PageSize)
                .Take(searchDto.PageSize)
                .ToListAsync();

            var bookDtos = _mapper.Map<List<BookListDto>>(books);

            return new PaginatedResult<BookListDto>
            {
                Items = bookDtos,
                TotalCount = totalCount,
                Page = searchDto.Page,
                PageSize = searchDto.PageSize
            };
        }

        public async Task<BookDto?> UpdateBookAsync(Guid id, UpdateBookDto updateBookDto, Guid userId)
        {
            var book = await _context.Books
                .FirstOrDefaultAsync(b => b.Id == id && b.UserId == userId);

            if (book == null)
            {
                return null;
            }

            // Store original values for comparison
            var originalContent = book.Content;

            _mapper.Map(updateBookDto, book);

            // Recalculate metrics if content changed
            if (updateBookDto.Content != null && updateBookDto.Content != originalContent)
            {
                book.WordCount = CountWords(updateBookDto.Content);
                book.CharacterCount = updateBookDto.Content.Length;
                book.ReadingTimeMinutes = CalculateReadingTime(updateBookDto.Content);
            }

            // Handle status changes
            if (updateBookDto.Status.HasValue && updateBookDto.Status.Value == BookStatus.Published && !book.PublishedAt.HasValue)
            {
                book.PublishedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();

            _logger.LogInformation("Updated book with ID: {BookId}", book.Id);

            return _mapper.Map<BookDto>(book);
        }

        public async Task<bool> DeleteBookAsync(Guid id, Guid userId)
        {
            var book = await _context.Books
                .FirstOrDefaultAsync(b => b.Id == id && b.UserId == userId);

            if (book == null)
            {
                return false;
            }

            _context.Books.Remove(book);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Deleted book with ID: {BookId}", book.Id);

            return true;
        }

        public async Task<BookDto?> PublishBookAsync(Guid id, Guid userId)
        {
            var book = await _context.Books
                .FirstOrDefaultAsync(b => b.Id == id && b.UserId == userId);

            if (book == null)
            {
                return null;
            }

            book.Status = BookStatus.Published;
            book.IsPublic = true;
            book.PublishedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Published book with ID: {BookId}", book.Id);

            return _mapper.Map<BookDto>(book);
        }

        public async Task<PaginatedResult<BookListDto>> GetUserBooksAsync(Guid userId, BookSearchDto searchDto)
        {
            var query = _context.Books.Where(b => b.UserId == userId);

            query = ApplySearchFilters(query, searchDto);

            var totalCount = await query.CountAsync();

            query = ApplySorting(query, searchDto.SortBy, searchDto.SortOrder);

            var books = await query
                .Skip((searchDto.Page - 1) * searchDto.PageSize)
                .Take(searchDto.PageSize)
                .ToListAsync();

            var bookDtos = _mapper.Map<List<BookListDto>>(books);

            return new PaginatedResult<BookListDto>
            {
                Items = bookDtos,
                TotalCount = totalCount,
                Page = searchDto.Page,
                PageSize = searchDto.PageSize
            };
        }

        public async Task<PaginatedResult<BookListDto>> GetPublicBooksAsync(BookSearchDto searchDto)
        {
            var query = _context.Books.Where(b => b.IsPublic && b.Status == BookStatus.Published);

            query = ApplySearchFilters(query, searchDto);

            var totalCount = await query.CountAsync();

            query = ApplySorting(query, searchDto.SortBy, searchDto.SortOrder);

            var books = await query
                .Skip((searchDto.Page - 1) * searchDto.PageSize)
                .Take(searchDto.PageSize)
                .ToListAsync();

            var bookDtos = _mapper.Map<List<BookListDto>>(books);

            return new PaginatedResult<BookListDto>
            {
                Items = bookDtos,
                TotalCount = totalCount,
                Page = searchDto.Page,
                PageSize = searchDto.PageSize
            };
        }

        public async Task<BookAnalyticsDto?> GetBookAnalyticsAsync(Guid bookId, Guid userId)
        {
            var book = await _context.Books
                .FirstOrDefaultAsync(b => b.Id == bookId && b.UserId == userId);

            if (book == null)
            {
                return null;
            }

            var analytics = new BookAnalyticsDto
            {
                BookId = book.Id,
                TotalViews = book.ViewCount,
                AverageRating = book.AverageRating,
                TotalRatings = book.RatingCount
            };

            // Get detailed analytics
            var views = await _context.BookViews
                .Where(v => v.BookId == bookId)
                .ToListAsync();

            analytics.UniqueViewers = views.GroupBy(v => v.UserId).Count();

            var comments = await _context.BookComments
                .Where(c => c.BookId == bookId && !c.IsDeleted)
                .CountAsync();

            analytics.TotalComments = comments;

            return analytics;
        }

        public async Task<bool> IncrementViewCountAsync(Guid bookId, Guid? userId = null)
        {
            var book = await _context.Books.FindAsync(bookId);
            if (book == null)
            {
                return false;
            }

            book.ViewCount++;

            if (userId.HasValue)
            {
                var bookView = new BookView
                {
                    BookId = bookId,
                    UserId = userId.Value,
                    ViewedAt = DateTime.UtcNow
                };

                _context.BookViews.Add(bookView);
            }

            await _context.SaveChangesAsync();
            return true;
        }

        private IQueryable<Book> ApplySearchFilters(IQueryable<Book> query, BookSearchDto searchDto)
        {
            if (!string.IsNullOrEmpty(searchDto.SearchTerm))
            {
                query = query.Where(b => b.Title.Contains(searchDto.SearchTerm) ||
                                        (b.Description != null && b.Description.Contains(searchDto.SearchTerm)) ||
                                        (b.Author != null && b.Author.Contains(searchDto.SearchTerm)));
            }

            if (!string.IsNullOrEmpty(searchDto.Author))
            {
                query = query.Where(b => b.Author != null && b.Author.Contains(searchDto.Author));
            }

            if (!string.IsNullOrEmpty(searchDto.Genre))
            {
                query = query.Where(b => b.Genre != null && b.Genre.Contains(searchDto.Genre));
            }

            if (!string.IsNullOrEmpty(searchDto.Language))
            {
                query = query.Where(b => b.Language == searchDto.Language);
            }

            if (searchDto.Status.HasValue)
            {
                query = query.Where(b => b.Status == searchDto.Status.Value);
            }

            if (searchDto.IsPublic.HasValue)
            {
                query = query.Where(b => b.IsPublic == searchDto.IsPublic.Value);
            }

            if (searchDto.MinWordCount.HasValue)
            {
                query = query.Where(b => b.WordCount >= searchDto.MinWordCount.Value);
            }

            if (searchDto.MaxWordCount.HasValue)
            {
                query = query.Where(b => b.WordCount <= searchDto.MaxWordCount.Value);
            }

            if (searchDto.MinRating.HasValue)
            {
                query = query.Where(b => b.AverageRating >= searchDto.MinRating.Value);
            }

            if (searchDto.CreatedAfter.HasValue)
            {
                query = query.Where(b => b.CreatedAt >= searchDto.CreatedAfter.Value);
            }

            if (searchDto.CreatedBefore.HasValue)
            {
                query = query.Where(b => b.CreatedAt <= searchDto.CreatedBefore.Value);
            }

            return query;
        }

        private IQueryable<Book> ApplySorting(IQueryable<Book> query, string sortBy, string sortOrder)
        {
            Expression<Func<Book, object>> sortExpression = sortBy.ToLower() switch
            {
                "title" => b => b.Title,
                "createdat" => b => b.CreatedAt,
                "updatedat" => b => b.UpdatedAt,
                "wordcount" => b => b.WordCount,
                "viewcount" => b => b.ViewCount,
                "averagerating" => b => b.AverageRating,
                _ => b => b.CreatedAt
            };

            return sortOrder.ToLower() == "asc" 
                ? query.OrderBy(sortExpression)
                : query.OrderByDescending(sortExpression);
        }

        public async Task<List<string>> GetGenresAsync()
        {
            _logger.LogInformation("Getting all distinct genres");

            var genres = await _context.Books
                .Where(b => !string.IsNullOrWhiteSpace(b.Genre))
                .Where(b => b.IsPublic && b.Status == BookStatus.Published)
                .Select(b => b.Genre!)
                .Distinct()
                .OrderBy(g => g)
                .ToListAsync();

            _logger.LogInformation("Found {Count} genres", genres.Count);
            return genres;
        }

        private static int CountWords(string content)
        {
            if (string.IsNullOrWhiteSpace(content))
                return 0;

            return content.Split(new char[] { ' ', '\t', '\n', '\r' }, 
                StringSplitOptions.RemoveEmptyEntries).Length;
        }

        private static double CalculateReadingTime(string content)
        {
            const double wordsPerMinute = 200.0;
            var wordCount = CountWords(content);
            return Math.Max(1.0, wordCount / wordsPerMinute);
        }

        private static Dictionary<string, int> AnalyzeTopWords(string content, int topCount)
        {
            if (string.IsNullOrWhiteSpace(content))
                return new Dictionary<string, int>();

            var words = content.ToLower()
                .Split(new char[] { ' ', '\t', '\n', '\r', '.', ',', '!', '?', ';', ':', '"', '\'', '(', ')' }, 
                    StringSplitOptions.RemoveEmptyEntries)
                .Where(w => w.Length > 3) // Filter short words
                .Where(w => !IsStopWord(w));

            return words
                .GroupBy(w => w)
                .OrderByDescending(g => g.Count())
                .Take(topCount)
                .ToDictionary(g => g.Key, g => g.Count());
        }

        private static bool IsStopWord(string word)
        {
            var stopWords = new HashSet<string> 
            { 
                "the", "and", "for", "are", "but", "not", "you", "all", "can", "had", "her", "was", "one", "our", "out", "day", "get", "has", "him", "his", "how", "man", "new", "now", "old", "see", "two", "way", "who", "boy", "did", "its", "let", "put", "say", "she", "too", "use"
            };
            return stopWords.Contains(word);
        }
    }
}