using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BooksService.DTOs;
using BooksService.Services;
using System.Security.Claims;

namespace BooksService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AnalyticsController : ControllerBase
    {
        private readonly IAnalyticsService _analyticsService;
        private readonly ILogger<AnalyticsController> _logger;

        public AnalyticsController(IAnalyticsService analyticsService, ILogger<AnalyticsController> logger)
        {
            _analyticsService = analyticsService;
            _logger = logger;
        }

        /// <summary>
        /// Get analytics for a specific book
        /// </summary>
        [HttpGet("books/{bookId:guid}")]
        [AllowAnonymous]
        public async Task<ActionResult<BookAnalyticsDto>> GetBookAnalytics(Guid bookId)
        {
            try
            {
                var analytics = await _analyticsService.GetBookAnalyticsAsync(bookId);
                return Ok(analytics);
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Get reading analytics for the current user
        /// </summary>
        [HttpGet("users/me/reading")]
        [Authorize]
        public async Task<ActionResult<UserReadingAnalyticsDto>> GetMyReadingAnalytics()
        {
            var userId = GetCurrentUserId();
            if (!userId.HasValue)
                return Unauthorized();

            var analytics = await _analyticsService.GetUserReadingAnalyticsAsync(userId.Value);
            return Ok(analytics);
        }

        /// <summary>
        /// Get reading analytics for a specific user (admin only or self)
        /// </summary>
        [HttpGet("users/{userId:guid}/reading")]
        [Authorize]
        public async Task<ActionResult<UserReadingAnalyticsDto>> GetUserReadingAnalytics(Guid userId)
        {
            var currentUserId = GetCurrentUserId();
            if (!currentUserId.HasValue)
                return Unauthorized();

            // Users can only view their own analytics unless they're admin
            if (currentUserId.Value != userId && !User.IsInRole("Admin"))
                return Forbid();

            var analytics = await _analyticsService.GetUserReadingAnalyticsAsync(userId);
            return Ok(analytics);
        }

        /// <summary>
        /// Get popular books (most viewed, highest rated, etc.)
        /// </summary>
        [HttpGet("books/popular")]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<PopularBookDto>>> GetPopularBooks([FromQuery] int count = 10)
        {
            if (count <= 0 || count > 50)
                return BadRequest("Count must be between 1 and 50");

            var popularBooks = await _analyticsService.GetPopularBooksAsync(count);
            return Ok(popularBooks);
        }

        /// <summary>
        /// Get book recommendations for the current user
        /// </summary>
        [HttpGet("recommendations")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<BookDto>>> GetRecommendations([FromQuery] int count = 5)
        {
            var userId = GetCurrentUserId();
            if (!userId.HasValue)
                return Unauthorized();

            if (count <= 0 || count > 20)
                return BadRequest("Count must be between 1 and 20");

            var recommendations = await _analyticsService.GetRecommendedBooksAsync(userId.Value, count);
            return Ok(recommendations);
        }

        /// <summary>
        /// Get platform-wide analytics (admin only)
        /// </summary>
        [HttpGet("platform")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<PlatformAnalyticsDto>> GetPlatformAnalytics()
        {
            var analytics = await _analyticsService.GetPlatformAnalyticsAsync();
            return Ok(analytics);
        }

        /// <summary>
        /// Get trending genres
        /// </summary>
        [HttpGet("genres/trending")]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<TrendingGenreDto>>> GetTrendingGenres([FromQuery] int count = 5)
        {
            if (count <= 0 || count > 20)
                return BadRequest("Count must be between 1 and 20");

            var trendingGenres = await _analyticsService.GetTrendingGenresAsync(count);
            return Ok(trendingGenres);
        }

        /// <summary>
        /// Get user engagement analytics for the current user
        /// </summary>
        [HttpGet("users/me/engagement")]
        [Authorize]
        public async Task<ActionResult<UserEngagementDto>> GetMyEngagementAnalytics()
        {
            var userId = GetCurrentUserId();
            if (!userId.HasValue)
                return Unauthorized();

            var engagement = await _analyticsService.GetUserEngagementAnalyticsAsync(userId.Value);
            return Ok(engagement);
        }

        /// <summary>
        /// Record a book view (used internally when users view books)
        /// </summary>
        [HttpPost("books/{bookId:guid}/view")]
        [Authorize]
        public async Task<ActionResult> RecordBookView(Guid bookId)
        {
            var userId = GetCurrentUserId();
            if (!userId.HasValue)
                return Unauthorized();

            await _analyticsService.RecordBookViewAsync(bookId, userId.Value);
            return Ok(new { message = "View recorded successfully" });
        }

        /// <summary>
        /// Record a search query (used internally for search analytics)
        /// </summary>
        [HttpPost("search")]
        [AllowAnonymous]
        public async Task<ActionResult> RecordSearch([FromBody] RecordSearchDto searchData)
        {
            await _analyticsService.RecordBookSearchAsync(searchData.SearchTerm, searchData.ResultCount);
            return Ok(new { message = "Search recorded successfully" });
        }

        private Guid? GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim != null && Guid.TryParse(userIdClaim.Value, out var userId))
            {
                return userId;
            }
            return null;
        }
    }

    public class RecordSearchDto
    {
        public string SearchTerm { get; set; } = string.Empty;
        public int ResultCount { get; set; }
    }
}