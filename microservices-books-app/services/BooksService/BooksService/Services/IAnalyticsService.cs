using BooksService.DTOs;

namespace BooksService.Services
{
    public interface IAnalyticsService
    {
        Task<BookAnalyticsDto> GetBookAnalyticsAsync(Guid bookId);
        Task<UserReadingAnalyticsDto> GetUserReadingAnalyticsAsync(Guid userId);
        Task<IEnumerable<PopularBookDto>> GetPopularBooksAsync(int topCount = 10);
        Task<IEnumerable<BookDto>> GetRecommendedBooksAsync(Guid userId, int count = 5);
        Task<PlatformAnalyticsDto> GetPlatformAnalyticsAsync();
        Task<IEnumerable<TrendingGenreDto>> GetTrendingGenresAsync(int topCount = 5);
        Task<UserEngagementDto> GetUserEngagementAnalyticsAsync(Guid userId);
        Task RecordBookViewAsync(Guid bookId, Guid userId);
        Task RecordBookSearchAsync(string searchTerm, int resultCount);
    }
}