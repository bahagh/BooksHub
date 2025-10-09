using AutoMapper;
using Microsoft.EntityFrameworkCore;
using BooksService.Data;
using BooksService.DTOs;
using BooksService.Models;

namespace BooksService.Services
{
    public interface IRatingsService
    {
        Task<RatingDto> CreateRatingAsync(Guid bookId, CreateRatingDto createRatingDto, Guid userId);
        Task<RatingDto?> UpdateRatingAsync(Guid bookId, Guid ratingId, UpdateRatingDto updateRatingDto, Guid userId);
        Task<bool> DeleteRatingAsync(Guid bookId, Guid ratingId, Guid userId);
        Task<RatingDto?> GetUserRatingForBookAsync(Guid bookId, Guid userId);
        Task<PaginatedResult<RatingDto>> GetBookRatingsAsync(Guid bookId, int page = 1, int pageSize = 10);
        Task<Dictionary<int, int>> GetRatingDistributionAsync(Guid bookId);
    }

    public class RatingsService : IRatingsService
    {
        private readonly BooksDbContext _context;
        private readonly IMapper _mapper;
        private readonly ILogger<RatingsService> _logger;

        public RatingsService(BooksDbContext context, IMapper mapper, ILogger<RatingsService> logger)
        {
            _context = context;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<RatingDto> CreateRatingAsync(Guid bookId, CreateRatingDto createRatingDto, Guid userId)
        {
            // Check if book exists
            var book = await _context.Books.FindAsync(bookId);
            if (book == null)
                throw new InvalidOperationException("Book not found");

            // Check if user already rated this book
            var existingRating = await _context.BookRatings
                .FirstOrDefaultAsync(r => r.BookId == bookId && r.UserId == userId);

            if (existingRating != null)
                throw new InvalidOperationException("User has already rated this book");

            var rating = _mapper.Map<BookRating>(createRatingDto);
            rating.BookId = bookId;
            rating.UserId = userId;

            _context.BookRatings.Add(rating);

            // Update book's average rating
            await UpdateBookAverageRating(bookId);

            await _context.SaveChangesAsync();

            _logger.LogInformation("User {UserId} rated book {BookId} with {Rating} stars", 
                userId, bookId, createRatingDto.Rating);

            return _mapper.Map<RatingDto>(rating);
        }

        public async Task<RatingDto?> UpdateRatingAsync(Guid bookId, Guid ratingId, UpdateRatingDto updateRatingDto, Guid userId)
        {
            var rating = await _context.BookRatings
                .FirstOrDefaultAsync(r => r.Id == ratingId && r.BookId == bookId && r.UserId == userId);

            if (rating == null)
                return null;

            _mapper.Map(updateRatingDto, rating);

            // Update book's average rating
            await UpdateBookAverageRating(bookId);

            await _context.SaveChangesAsync();

            _logger.LogInformation("User {UserId} updated rating {RatingId} for book {BookId}", 
                userId, ratingId, bookId);

            return _mapper.Map<RatingDto>(rating);
        }

        public async Task<bool> DeleteRatingAsync(Guid bookId, Guid ratingId, Guid userId)
        {
            var rating = await _context.BookRatings
                .FirstOrDefaultAsync(r => r.Id == ratingId && r.BookId == bookId && r.UserId == userId);

            if (rating == null)
                return false;

            _context.BookRatings.Remove(rating);

            // Update book's average rating
            await UpdateBookAverageRating(bookId);

            await _context.SaveChangesAsync();

            _logger.LogInformation("User {UserId} deleted rating {RatingId} for book {BookId}", 
                userId, ratingId, bookId);

            return true;
        }

        public async Task<RatingDto?> GetUserRatingForBookAsync(Guid bookId, Guid userId)
        {
            var rating = await _context.BookRatings
                .FirstOrDefaultAsync(r => r.BookId == bookId && r.UserId == userId);

            return rating != null ? _mapper.Map<RatingDto>(rating) : null;
        }

        public async Task<PaginatedResult<RatingDto>> GetBookRatingsAsync(Guid bookId, int page = 1, int pageSize = 10)
        {
            var query = _context.BookRatings
                .Where(r => r.BookId == bookId)
                .OrderByDescending(r => r.CreatedAt);

            var totalCount = await query.CountAsync();

            var ratings = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var ratingDtos = _mapper.Map<List<RatingDto>>(ratings);

            return new PaginatedResult<RatingDto>
            {
                Items = ratingDtos,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            };
        }

        public async Task<Dictionary<int, int>> GetRatingDistributionAsync(Guid bookId)
        {
            var distribution = await _context.BookRatings
                .Where(r => r.BookId == bookId)
                .GroupBy(r => r.Rating)
                .Select(g => new { Rating = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.Rating, x => x.Count);

            // Ensure all ratings 1-5 are represented
            for (int i = 1; i <= 5; i++)
            {
                if (!distribution.ContainsKey(i))
                    distribution[i] = 0;
            }

            return distribution;
        }

        private async Task UpdateBookAverageRating(Guid bookId)
        {
            var book = await _context.Books.FindAsync(bookId);
            if (book == null) return;

            var ratings = await _context.BookRatings
                .Where(r => r.BookId == bookId)
                .Select(r => r.Rating)
                .ToListAsync();

            if (ratings.Any())
            {
                book.AverageRating = Math.Round(ratings.Average(), 2);
                book.RatingCount = ratings.Count;
            }
            else
            {
                book.AverageRating = 0;
                book.RatingCount = 0;
            }
        }
    }
}