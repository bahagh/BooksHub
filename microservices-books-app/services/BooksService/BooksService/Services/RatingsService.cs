using AutoMapper;
using Microsoft.EntityFrameworkCore;
using BooksService.Data;
using BooksService.DTOs;
using BooksService.Models;

namespace BooksService.Services
{
    public interface IRatingsService
    {
        Task<RatingDto> CreateRatingAsync(Guid bookId, CreateRatingDto createRatingDto, Guid? userId);
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
        private readonly INotificationClient _notificationClient;
        private readonly IUserClient _userClient;

        public RatingsService(
            BooksDbContext context,
            IMapper mapper,
            ILogger<RatingsService> logger,
            INotificationClient notificationClient,
            IUserClient userClient)
        {
            _context = context;
            _mapper = mapper;
            _logger = logger;
            _notificationClient = notificationClient;
            _userClient = userClient;
        }

        public async Task<RatingDto> CreateRatingAsync(Guid bookId, CreateRatingDto createRatingDto, Guid? userId)
        {
            // Check if book exists
            var book = await _context.Books.FindAsync(bookId);
            if (book == null)
                throw new InvalidOperationException("Book not found");

            // Check if authenticated user already rated this book
            if (userId.HasValue && !createRatingDto.IsAnonymous)
            {
                var existingRating = await _context.BookRatings
                    .FirstOrDefaultAsync(r => r.BookId == bookId && r.UserId == userId && !r.IsAnonymous);

                if (existingRating != null)
                    throw new InvalidOperationException("User has already rated this book");
            }

            var rating = _mapper.Map<BookRating>(createRatingDto);
            rating.BookId = bookId;
            rating.UserId = userId; // Can be null for anonymous ratings
            rating.IsAnonymous = createRatingDto.IsAnonymous;
            rating.AnonymousUsername = createRatingDto.AnonymousUsername;

            _context.BookRatings.Add(rating);
            await _context.SaveChangesAsync();

            // Update book's average rating AFTER saving the new rating
            await UpdateBookAverageRating(bookId);
            await _context.SaveChangesAsync();

            if (userId.HasValue && !createRatingDto.IsAnonymous)
            {
                _logger.LogInformation("User {UserId} rated book {BookId} with {Rating} stars", 
                    userId, bookId, createRatingDto.Rating);
            }
            else
            {
                _logger.LogInformation("Anonymous user '{AnonymousUsername}' rated book {BookId} with {Rating} stars", 
                    createRatingDto.AnonymousUsername, bookId, createRatingDto.Rating);
            }

            var ratingDto = _mapper.Map<RatingDto>(rating);
            
            // Set display username
            string displayName;
            if (ratingDto.IsAnonymous)
            {
                ratingDto.Username = ratingDto.AnonymousUsername;
                displayName = ratingDto.AnonymousUsername ?? "Anonymous";
            }
            else if (userId.HasValue)
            {
                // Fetch username from UserService
                var userInfo = await _userClient.GetUserInfoAsync(userId.Value);
                ratingDto.Username = userInfo?.FullName ?? "Unknown User";
                displayName = ratingDto.Username;
            }
            else
            {
                ratingDto.Username = "Anonymous";
                displayName = "Anonymous";
            }

            // Trigger notification for new rating (only if rating someone else's book)
            if (book.UserId != Guid.Empty && book.UserId != userId)
            {
                // Trigger notification (fire and forget - don't wait for response)
                _ = _notificationClient.NotifyNewRatingAsync(
                    book.UserId,
                    displayName,
                    createRatingDto.Rating,
                    book.Title,
                    bookId.ToString());
            }

            return ratingDto;
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

            // Fetch real usernames for all ratings
            var userIds = ratingDtos
                .Where(r => !r.IsAnonymous && r.UserId.HasValue)
                .Select(r => r.UserId!.Value)
                .Distinct()
                .ToList();

            // Fetch user info in batch
            if (userIds.Any())
            {
                var usersInfo = await _userClient.GetUsersInfoAsync(userIds);

                // Update usernames for all ratings
                foreach (var rating in ratingDtos)
                {
                    if (rating.IsAnonymous)
                    {
                        rating.Username = rating.AnonymousUsername ?? "Anonymous";
                    }
                    else if (rating.UserId.HasValue && usersInfo.ContainsKey(rating.UserId.Value))
                    {
                        var userInfo = usersInfo[rating.UserId.Value];
                        rating.Username = userInfo.FullName;
                    }
                    else
                    {
                        rating.Username = "Unknown User";
                    }
                }
            }
            else
            {
                // Set usernames for anonymous ratings
                foreach (var rating in ratingDtos)
                {
                    if (rating.IsAnonymous)
                    {
                        rating.Username = rating.AnonymousUsername ?? "Anonymous";
                    }
                }
            }

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