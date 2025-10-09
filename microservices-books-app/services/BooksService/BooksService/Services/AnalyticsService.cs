using BooksService.Data;
using BooksService.DTOs;
using BooksService.Models;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace BooksService.Services
{
    public class AnalyticsService : IAnalyticsService
    {
        private readonly BooksDbContext _context;
        private readonly ILogger<AnalyticsService> _logger;

        public AnalyticsService(BooksDbContext context, ILogger<AnalyticsService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<BookAnalyticsDto> GetBookAnalyticsAsync(Guid bookId)
        {
            var book = await _context.Books
                .Include(b => b.Ratings)
                .Include(b => b.Comments)
                .Include(b => b.Views)
                .FirstOrDefaultAsync(b => b.Id == bookId);

            if (book == null)
                throw new InvalidOperationException("Book not found");

            var totalViews = book.Views.Count;
            var uniqueViewers = book.Views.Select(v => v.UserId).Distinct().Count();
            var totalComments = book.Comments.Count(c => !c.IsDeleted);
            var totalRatings = book.Ratings.Count;
            var averageRating = book.Ratings.Any() ? book.Ratings.Average(r => r.Rating) : 0;

            // Calculate daily views for the last 30 days
            var thirtyDaysAgo = DateTime.UtcNow.AddDays(-30);
            var dailyViews = await _context.BookViews
                .Where(v => v.BookId == bookId && v.ViewedAt >= thirtyDaysAgo)
                .GroupBy(v => v.ViewedAt.Date)
                .Select(g => new DailyAnalyticsDto
                {
                    Date = g.Key,
                    Count = g.Count()
                })
                .OrderBy(d => d.Date)
                .ToListAsync();

            // Most active time periods
            var hourlyActivity = await _context.BookViews
                .Where(v => v.BookId == bookId && v.ViewedAt >= thirtyDaysAgo)
                .GroupBy(v => v.ViewedAt.Hour)
                .Select(g => new HourlyActivityDto
                {
                    Hour = g.Key,
                    Count = g.Count()
                })
                .OrderByDescending(h => h.Count)
                .Take(5)
                .ToListAsync();

            return new BookAnalyticsDto
            {
                BookId = bookId,
                TotalViews = totalViews,
                UniqueViewers = uniqueViewers,
                TotalComments = totalComments,
                TotalRatings = totalRatings,
                AverageRating = Math.Round(averageRating, 2),
                DailyViews = dailyViews,
                PeakViewingHours = hourlyActivity
            };
        }

        public async Task<UserReadingAnalyticsDto> GetUserReadingAnalyticsAsync(Guid userId)
        {
            var userViews = await _context.BookViews
                .Where(v => v.UserId == userId)
                .Include(v => v.Book)
                .ToListAsync();

            var userRatings = await _context.BookRatings
                .Where(r => r.UserId == userId)
                .Include(r => r.Book)
                .ToListAsync();

            var userComments = await _context.BookComments
                .Where(c => c.UserId == userId && !c.IsDeleted)
                .Include(c => c.Book)
                .ToListAsync();

            var totalBooksViewed = userViews.Select(v => v.BookId).Distinct().Count();
            var totalBooksRated = userRatings.Count;
            var totalComments = userComments.Count;
            var averageRatingGiven = userRatings.Any() ? userRatings.Average(r => r.Rating) : 0;

            // Favorite genres based on views and ratings
            var genreActivity = userViews
                .Where(v => !string.IsNullOrEmpty(v.Book.Genre))
                .GroupBy(v => v.Book.Genre)
                .Select(g => new GenreActivityDto
                {
                    Genre = g.Key,
                    ViewCount = g.Count(),
                    AverageRating = userRatings
                        .Where(r => r.Book.Genre == g.Key)
                        .Select(r => (double?)r.Rating)
                        .Average() ?? 0
                })
                .OrderByDescending(g => g.ViewCount)
                .Take(5)
                .ToList();

            // Reading patterns - most active days and times
            var dailyActivity = userViews
                .GroupBy(v => v.ViewedAt.DayOfWeek)
                .Select(g => new DayOfWeekActivityDto
                {
                    DayOfWeek = g.Key.ToString(),
                    Count = g.Count()
                })
                .OrderByDescending(d => d.Count)
                .ToList();

            return new UserReadingAnalyticsDto
            {
                UserId = userId,
                TotalBooksViewed = totalBooksViewed,
                TotalBooksRated = totalBooksRated,
                TotalComments = totalComments,
                AverageRatingGiven = Math.Round(averageRatingGiven, 2),
                FavoriteGenres = genreActivity,
                ReadingPatternByDay = dailyActivity,
                LastActivityDate = userViews.Any() ? userViews.Max(v => v.ViewedAt) : null
            };
        }

        public async Task<IEnumerable<PopularBookDto>> GetPopularBooksAsync(int topCount = 10)
        {
            var thirtyDaysAgo = DateTime.UtcNow.AddDays(-30);

            var popularBooks = await _context.Books
                .Select(b => new PopularBookDto
                {
                    BookId = b.Id,
                    Title = b.Title,
                    Author = b.Author,
                    Genre = b.Genre,
                    AverageRating = b.Ratings.Any() ? b.Ratings.Average(r => r.Rating) : 0,
                    TotalRatings = b.Ratings.Count,
                    RecentViews = b.Views.Count(v => v.ViewedAt >= thirtyDaysAgo),
                    TotalViews = b.Views.Count,
                    CommentCount = b.Comments.Count(c => !c.IsDeleted),
                    PopularityScore = CalculatePopularityScore(
                        b.Views.Count(v => v.ViewedAt >= thirtyDaysAgo),
                        b.Ratings.Count,
                        b.Ratings.Any() ? b.Ratings.Average(r => r.Rating) : 0,
                        b.Comments.Count(c => !c.IsDeleted)
                    )
                })
                .OrderByDescending(p => p.PopularityScore)
                .Take(topCount)
                .ToListAsync();

            return popularBooks;
        }

        public async Task<IEnumerable<BookDto>> GetRecommendedBooksAsync(Guid userId, int count = 5)
        {
            // Get user's reading history and preferences
            var userGenres = await _context.BookViews
                .Where(v => v.UserId == userId)
                .Include(v => v.Book)
                .Select(v => v.Book.Genre)
                .Where(g => !string.IsNullOrEmpty(g))
                .GroupBy(g => g)
                .OrderByDescending(g => g.Count())
                .Take(3)
                .Select(g => g.Key)
                .ToListAsync();

            var userRatedBooks = await _context.BookRatings
                .Where(r => r.UserId == userId)
                .Select(r => r.BookId)
                .ToListAsync();

            var userViewedBooks = await _context.BookViews
                .Where(v => v.UserId == userId)
                .Select(v => v.BookId)
                .Distinct()
                .ToListAsync();

            // Find books in preferred genres that user hasn't interacted with
            var recommendations = await _context.Books
                .Where(b => userGenres.Contains(b.Genre) && 
                           !userViewedBooks.Contains(b.Id) && 
                           !userRatedBooks.Contains(b.Id))
                .Where(b => b.Ratings.Any()) // Only recommend books with ratings
                .OrderByDescending(b => b.Ratings.Average(r => r.Rating))
                .ThenByDescending(b => b.Ratings.Count)
                .Take(count)
                .Select(b => new BookDto
                {
                    Id = b.Id,
                    Title = b.Title,
                    Author = b.Author,
                    Genre = b.Genre,
                    Description = b.Description,
                    Language = b.Language,
                    CreatedAt = b.CreatedAt,
                    UpdatedAt = b.UpdatedAt,
                    AverageRating = b.Ratings.Any() ? Math.Round(b.Ratings.Average(r => r.Rating), 2) : 0
                })
                .ToListAsync();

            return recommendations;
        }

        public async Task<PlatformAnalyticsDto> GetPlatformAnalyticsAsync()
        {
            var totalBooks = await _context.Books.CountAsync();
            var totalUsers = await _context.BookViews.Select(v => v.UserId).Distinct().CountAsync();
            var totalViews = await _context.BookViews.CountAsync();
            var totalRatings = await _context.BookRatings.CountAsync();
            var totalComments = await _context.BookComments.CountAsync(c => !c.IsDeleted);

            var thirtyDaysAgo = DateTime.UtcNow.AddDays(-30);
            var activeUsersLast30Days = await _context.BookViews
                .Where(v => v.ViewedAt >= thirtyDaysAgo)
                .Select(v => v.UserId)
                .Distinct()
                .CountAsync();

            var averageRating = await _context.BookRatings.AverageAsync(r => (double?)r.Rating) ?? 0;

            // Most popular genres
            var topGenres = await _context.Books
                .Where(b => !string.IsNullOrEmpty(b.Genre))
                .GroupBy(b => b.Genre)
                .Select(g => new GenrePopularityDto
                {
                    Genre = g.Key,
                    BookCount = g.Count(),
                    TotalViews = g.Sum(b => b.Views.Count),
                    AverageRating = g.SelectMany(b => b.Ratings).Any() 
                        ? g.SelectMany(b => b.Ratings).Average(r => r.Rating) 
                        : 0
                })
                .OrderByDescending(g => g.TotalViews)
                .Take(10)
                .ToListAsync();

            return new PlatformAnalyticsDto
            {
                TotalBooks = totalBooks,
                TotalUsers = totalUsers,
                TotalViews = totalViews,
                TotalRatings = totalRatings,
                TotalComments = totalComments,
                ActiveUsersLast30Days = activeUsersLast30Days,
                AverageRatingAcrossPlatform = Math.Round(averageRating, 2),
                TopGenres = topGenres
            };
        }

        public async Task<IEnumerable<TrendingGenreDto>> GetTrendingGenresAsync(int topCount = 5)
        {
            var thirtyDaysAgo = DateTime.UtcNow.AddDays(-30);
            var sixtyDaysAgo = DateTime.UtcNow.AddDays(-60);

            var trendingGenres = await _context.Books
                .Where(b => !string.IsNullOrEmpty(b.Genre))
                .GroupBy(b => b.Genre)
                .Select(g => new TrendingGenreDto
                {
                    Genre = g.Key,
                    CurrentPeriodViews = g.Sum(b => b.Views.Count(v => v.ViewedAt >= thirtyDaysAgo)),
                    PreviousPeriodViews = g.Sum(b => b.Views.Count(v => v.ViewedAt >= sixtyDaysAgo && v.ViewedAt < thirtyDaysAgo)),
                    CurrentPeriodRatings = g.Sum(b => b.Ratings.Count(r => r.CreatedAt >= thirtyDaysAgo)),
                    BookCount = g.Count()
                })
                .Where(g => g.CurrentPeriodViews > 0)
                .ToListAsync();

            // Calculate growth percentage and order by trend
            foreach (var genre in trendingGenres)
            {
                if (genre.PreviousPeriodViews > 0)
                {
                    genre.GrowthPercentage = Math.Round(
                        ((double)(genre.CurrentPeriodViews - genre.PreviousPeriodViews) / genre.PreviousPeriodViews) * 100, 
                        2);
                }
                else
                {
                    genre.GrowthPercentage = genre.CurrentPeriodViews > 0 ? 100 : 0;
                }
            }

            return trendingGenres
                .OrderByDescending(g => g.GrowthPercentage)
                .ThenByDescending(g => g.CurrentPeriodViews)
                .Take(topCount);
        }

        public async Task<UserEngagementDto> GetUserEngagementAnalyticsAsync(Guid userId)
        {
            var thirtyDaysAgo = DateTime.UtcNow.AddDays(-30);

            var engagementData = new UserEngagementDto
            {
                UserId = userId
            };

            // Views in last 30 days
            var recentViews = await _context.BookViews
                .Where(v => v.UserId == userId && v.ViewedAt >= thirtyDaysAgo)
                .CountAsync();

            // Ratings in last 30 days
            var recentRatings = await _context.BookRatings
                .Where(r => r.UserId == userId && r.CreatedAt >= thirtyDaysAgo)
                .CountAsync();

            // Comments in last 30 days
            var recentComments = await _context.BookComments
                .Where(c => c.UserId == userId && !c.IsDeleted && c.CreatedAt >= thirtyDaysAgo)
                .CountAsync();

            // Calculate engagement score (weighted)
            var engagementScore = (recentViews * 1) + (recentRatings * 3) + (recentComments * 5);

            // Determine engagement level
            string engagementLevel = engagementScore switch
            {
                >= 50 => "High",
                >= 20 => "Medium",
                >= 5 => "Low",
                _ => "Inactive"
            };

            engagementData.ViewsLast30Days = recentViews;
            engagementData.RatingsLast30Days = recentRatings;
            engagementData.CommentsLast30Days = recentComments;
            engagementData.EngagementScore = engagementScore;
            engagementData.EngagementLevel = engagementLevel;

            return engagementData;
        }

        public async Task RecordBookViewAsync(Guid bookId, Guid userId)
        {
            // Check if this user has viewed this book in the last hour (to avoid spam)
            var oneHourAgo = DateTime.UtcNow.AddHours(-1);
            var recentView = await _context.BookViews
                .FirstOrDefaultAsync(v => v.BookId == bookId && v.UserId == userId && v.ViewedAt >= oneHourAgo);

            if (recentView == null)
            {
                var bookView = new BookView
                {
                    BookId = bookId,
                    UserId = userId,
                    ViewedAt = DateTime.UtcNow
                };

                _context.BookViews.Add(bookView);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Recorded book view: BookId={BookId}, UserId={UserId}", bookId, userId);
            }
        }

        public Task RecordBookSearchAsync(string searchTerm, int resultCount)
        {
            // This could be used for search analytics if you want to track what users search for
            _logger.LogInformation("Search performed: Term='{SearchTerm}', Results={ResultCount}", searchTerm, resultCount);
            
            // You could store this in a SearchAnalytics table if needed for future features
            return Task.CompletedTask;
        }

        private static double CalculatePopularityScore(int recentViews, int totalRatings, double averageRating, int commentCount)
        {
            // Weighted popularity score
            // Recent views: 40%, Ratings: 30%, Average Rating: 20%, Comments: 10%
            var normalizedViews = Math.Min(recentViews / 100.0, 1.0); // Cap at 100 views
            var normalizedRatings = Math.Min(totalRatings / 50.0, 1.0); // Cap at 50 ratings
            var normalizedAvgRating = averageRating / 5.0; // 5-star rating system
            var normalizedComments = Math.Min(commentCount / 20.0, 1.0); // Cap at 20 comments

            return (normalizedViews * 0.4) + 
                   (normalizedRatings * 0.3) + 
                   (normalizedAvgRating * 0.2) + 
                   (normalizedComments * 0.1);
        }
    }
}