using System.ComponentModel.DataAnnotations;
using BooksService.Models;

namespace BooksService.DTOs
{
    public class CreateBookDto
    {
        [Required]
        [StringLength(500, MinimumLength = 1)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [StringLength(1000000, MinimumLength = 10)]
        public string Content { get; set; } = string.Empty;

        [StringLength(1000)]
        public string? Description { get; set; }

        [StringLength(100)]
        public string? Author { get; set; }

        [StringLength(50)]
        public string? Genre { get; set; }

        [StringLength(20)]
        public string? Language { get; set; } = "en";

        public bool IsPublic { get; set; } = false;

        public BookStatus Status { get; set; } = BookStatus.Draft;

        public string[]? Tags { get; set; }
    }

    public class UpdateBookDto
    {
        [StringLength(500, MinimumLength = 1)]
        public string? Title { get; set; }

        [StringLength(1000000, MinimumLength = 10)]
        public string? Content { get; set; }

        [StringLength(1000)]
        public string? Description { get; set; }

        [StringLength(100)]
        public string? Author { get; set; }

        [StringLength(50)]
        public string? Genre { get; set; }

        [StringLength(20)]
        public string? Language { get; set; }

        public bool? IsPublic { get; set; }

        public string[]? Tags { get; set; }

        public BookStatus? Status { get; set; }
    }

    public class BookDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public Guid UserId { get; set; }
        public string? Description { get; set; }
        public string? Author { get; set; }
        public string? Genre { get; set; }
        public string? Language { get; set; }
        public int WordCount { get; set; }
        public int CharacterCount { get; set; }
        public double ReadingTimeMinutes { get; set; }
        public string EstimatedReadingTime { get; set; } = string.Empty;
        public BookStatus Status { get; set; }
        public bool IsPublic { get; set; }
        public int ViewCount { get; set; }
        public double AverageRating { get; set; }
        public int RatingCount { get; set; }
        public string[]? Tags { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public DateTime? PublishedAt { get; set; }
        public bool IsPublished { get; set; }
    }

    public class BookListDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? Author { get; set; }
        public string? Genre { get; set; }
        public int WordCount { get; set; }
        public string EstimatedReadingTime { get; set; } = string.Empty;
        public BookStatus Status { get; set; }
        public int ViewCount { get; set; }
        public double AverageRating { get; set; }
        public int RatingCount { get; set; }
        public string[]? Tags { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? PublishedAt { get; set; }
        public bool IsPublished { get; set; }
    }

    public class BookSearchDto
    {
        public string? SearchTerm { get; set; }
        public string? Author { get; set; }
        public string? Genre { get; set; }
        public string? Language { get; set; }
        public BookStatus? Status { get; set; }
        public bool? IsPublic { get; set; }
        public string[]? Tags { get; set; }
        public int? MinWordCount { get; set; }
        public int? MaxWordCount { get; set; }
        public double? MinRating { get; set; }
        public DateTime? CreatedAfter { get; set; }
        public DateTime? CreatedBefore { get; set; }
        public string SortBy { get; set; } = "CreatedAt";
        public string SortOrder { get; set; } = "desc"; // asc or desc
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }

    public class PaginatedResult<T>
    {
        public IEnumerable<T> Items { get; set; } = Enumerable.Empty<T>();
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
        public bool HasNextPage => Page < TotalPages;
        public bool HasPreviousPage => Page > 1;
    }

    // Analytics DTOs
    public class BookAnalyticsDto
    {
        public Guid BookId { get; set; }
        public int TotalViews { get; set; }
        public int UniqueViewers { get; set; }
        public int TotalComments { get; set; }
        public int TotalRatings { get; set; }
        public double AverageRating { get; set; }
        public List<DailyAnalyticsDto> DailyViews { get; set; } = new();
        public List<HourlyActivityDto> PeakViewingHours { get; set; } = new();
    }

    public class DailyAnalyticsDto
    {
        public DateTime Date { get; set; }
        public int Count { get; set; }
    }

    public class HourlyActivityDto
    {
        public int Hour { get; set; }
        public int Count { get; set; }
    }

    public class UserReadingAnalyticsDto
    {
        public Guid UserId { get; set; }
        public int TotalBooksViewed { get; set; }
        public int TotalBooksRated { get; set; }
        public int TotalComments { get; set; }
        public double AverageRatingGiven { get; set; }
        public List<GenreActivityDto> FavoriteGenres { get; set; } = new();
        public List<DayOfWeekActivityDto> ReadingPatternByDay { get; set; } = new();
        public DateTime? LastActivityDate { get; set; }
    }

    public class GenreActivityDto
    {
        public string Genre { get; set; } = string.Empty;
        public int ViewCount { get; set; }
        public double AverageRating { get; set; }
    }

    public class DayOfWeekActivityDto
    {
        public string DayOfWeek { get; set; } = string.Empty;
        public int Count { get; set; }
    }

    public class PopularBookDto
    {
        public Guid BookId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Author { get; set; }
        public string? Genre { get; set; }
        public double AverageRating { get; set; }
        public int TotalRatings { get; set; }
        public int RecentViews { get; set; }
        public int TotalViews { get; set; }
        public int CommentCount { get; set; }
        public double PopularityScore { get; set; }
    }

    public class PlatformAnalyticsDto
    {
        public int TotalBooks { get; set; }
        public int TotalUsers { get; set; }
        public int TotalViews { get; set; }
        public int TotalRatings { get; set; }
        public int TotalComments { get; set; }
        public int ActiveUsersLast30Days { get; set; }
        public double AverageRatingAcrossPlatform { get; set; }
        public List<GenrePopularityDto> TopGenres { get; set; } = new();
    }

    public class GenrePopularityDto
    {
        public string Genre { get; set; } = string.Empty;
        public int BookCount { get; set; }
        public int TotalViews { get; set; }
        public double AverageRating { get; set; }
    }

    public class TrendingGenreDto
    {
        public string Genre { get; set; } = string.Empty;
        public int CurrentPeriodViews { get; set; }
        public int PreviousPeriodViews { get; set; }
        public int CurrentPeriodRatings { get; set; }
        public int BookCount { get; set; }
        public double GrowthPercentage { get; set; }
    }

    public class UserEngagementDto
    {
        public Guid UserId { get; set; }
        public int ViewsLast30Days { get; set; }
        public int RatingsLast30Days { get; set; }
        public int CommentsLast30Days { get; set; }
        public int EngagementScore { get; set; }
        public string EngagementLevel { get; set; } = string.Empty;
    }
}