        // ...existing code...
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using BooksService.DTOs;
using BooksService.Services;
using System.Security.Claims;

namespace BooksService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BooksController : ControllerBase
    {
        private readonly IBooksService _booksService;
        private readonly IAnalyticsService _analyticsService;
        private readonly ILogger<BooksController> _logger;
        private readonly IConfiguration _configuration;

        public BooksController(IBooksService booksService, IAnalyticsService analyticsService, ILogger<BooksController> logger, IConfiguration configuration)
        {
            _booksService = booksService;
            _analyticsService = analyticsService;
            _logger = logger;
            _configuration = configuration;
        }

        // ...existing code...
        [HttpGet("health")]
        public IActionResult Health()
        {
            return Ok(new { status = "healthy", service = "BooksService", timestamp = DateTime.UtcNow });
        }

        [HttpGet("config-debug")]
        public IActionResult ConfigDebug()
        {
            return Ok(new
            {
                jwtKey = _configuration["Jwt:Key"]?.Substring(0, 20) + "...",
                jwtIssuer = _configuration["Jwt:Issuer"],
                jwtAudience = _configuration["Jwt:Audience"],
                environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT"),
                timestamp = DateTime.UtcNow
            });
        }

        [HttpGet("auth-test")]
        [Authorize]
        public IActionResult AuthTest()
        {
            try
            {
                var userId = GetUserId();
                return Ok(new { 
                    message = "Authentication successful", 
                    userId = userId,
                    claims = User.Claims.Select(c => new { type = c.Type, value = c.Value }).ToList(),
                    timestamp = DateTime.UtcNow 
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Auth test failed");
                return Unauthorized(new { message = ex.Message, timestamp = DateTime.UtcNow });
            }
        }

        [HttpPost]
        [Authorize]
        public async Task<ActionResult<BookDto>> CreateBook([FromBody] CreateBookDto createBookDto)
        {
            try
            {
                // Validate input
                if (createBookDto == null)
                {
                    return BadRequest(new { message = "Book data is required", success = false });
                }

                if (string.IsNullOrWhiteSpace(createBookDto.Title))
                {
                    return BadRequest(new { message = "Book title is required", success = false });
                }

                if (string.IsNullOrWhiteSpace(createBookDto.Author))
                {
                    return BadRequest(new { message = "Book author is required", success = false });
                }

                var userId = GetUserId();
                _logger.LogInformation("Creating book '{Title}' for user {UserId}", createBookDto.Title, userId);
                
                var book = await _booksService.CreateBookAsync(createBookDto, userId);
                _logger.LogInformation("Successfully created book with ID {BookId}", book.Id);
                
                return CreatedAtAction(nameof(GetBook), new { id = book.Id }, book);
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "Unauthorized access attempt when creating book");
                return Unauthorized(new { message = "Authentication required", success = false });
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Invalid argument when creating book");
                return BadRequest(new { message = ex.Message, success = false });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating book");
                return StatusCode(500, new { message = "An unexpected error occurred. Please try again later.", success = false });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<BookDto>> GetBook(Guid id)
        {
            try
            {
                var userId = GetUserIdOrNull();
                var book = await _booksService.GetBookByIdAsync(id, userId);
                
                if (book == null)
                {
                    return NotFound();
                }

                // Record analytics view and increment view count
                if (userId.HasValue)
                {
                    await _analyticsService.RecordBookViewAsync(id, userId.Value);
                }
                await _booksService.IncrementViewCountAsync(id, userId);

                return Ok(book);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting book {BookId}", id);
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        [HttpGet]
        public async Task<ActionResult<PaginatedResult<BookListDto>>> GetBooks([FromQuery] BookSearchDto searchDto)
        {
            try
            {
                var userId = GetUserIdOrNull();
                var books = await _booksService.GetBooksAsync(searchDto, userId);
                return Ok(books);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting books");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        [HttpGet("public")]
        public async Task<ActionResult<PaginatedResult<BookListDto>>> GetPublicBooks([FromQuery] BookSearchDto searchDto)
        {
            try
            {
                var books = await _booksService.GetPublicBooksAsync(searchDto);
                return Ok(books);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting public books");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        [HttpGet("my-books")]
        [Authorize]
        public async Task<ActionResult<PaginatedResult<BookListDto>>> GetMyBooks([FromQuery] BookSearchDto searchDto)
        {
            try
            {
                var userId = GetUserId();
                var books = await _booksService.GetUserBooksAsync(userId, searchDto);
                return Ok(books);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user books");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<ActionResult<BookDto>> UpdateBook(Guid id, [FromBody] UpdateBookDto updateBookDto)
        {
            try
            {
                var userId = GetUserId();
                var book = await _booksService.UpdateBookAsync(id, updateBookDto, userId);
                
                if (book == null)
                {
                    return NotFound();
                }

                return Ok(book);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating book {BookId}", id);
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<ActionResult> DeleteBook(Guid id)
        {
            try
            {
                var userId = GetUserId();
                var success = await _booksService.DeleteBookAsync(id, userId);
                
                if (!success)
                {
                    return NotFound();
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting book {BookId}", id);
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        [HttpPost("{id}/publish")]
        [Authorize]
        public async Task<ActionResult<BookDto>> PublishBook(Guid id)
        {
            try
            {
                var userId = GetUserId();
                var book = await _booksService.PublishBookAsync(id, userId);
                
                if (book == null)
                {
                    return NotFound();
                }

                return Ok(book);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error publishing book {BookId}", id);
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        [HttpGet("{id}/analytics")]
        [Authorize]
        public async Task<ActionResult<BookAnalyticsDto>> GetBookAnalytics(Guid id)
        {
            try
            {
                var userId = GetUserId();
                var analytics = await _booksService.GetBookAnalyticsAsync(id, userId);
                
                if (analytics == null)
                {
                    return NotFound();
                }

                return Ok(analytics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting book analytics {BookId}", id);
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        private Guid GetUserId()
        {
            try
            {
                // Log all claims for debugging
                foreach (var claim in User.Claims)
                {
                    _logger.LogDebug("Claim: {Type} = {Value}", claim.Type, claim.Value);
                }

                // Try both standard claim type and Microsoft's full URL format
                var userIdClaim = User.FindFirst("sub") ?? 
                                 User.FindFirst(ClaimTypes.NameIdentifier) ?? 
                                 User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier") ??
                                 User.FindFirst("userId");

                if (userIdClaim == null)
                {
                    _logger.LogWarning("No NameIdentifier claim found in token. Claims: {Claims}", 
                        string.Join(", ", User.Claims.Select(c => $"{c.Type}={c.Value}")));
                    throw new UnauthorizedAccessException("User ID not found in token");
                }

                if (!Guid.TryParse(userIdClaim.Value, out var userId))
                {
                    _logger.LogWarning("Invalid user ID format: {UserId}", userIdClaim.Value);
                    throw new UnauthorizedAccessException("Invalid user ID format");
                }

                _logger.LogDebug("Successfully extracted user ID: {UserId}", userId);
                return userId;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error extracting user ID from claims");
                throw new UnauthorizedAccessException("Unable to verify user identity");
            }
        }

        private Guid? GetUserIdOrNull()
        {
            // Try both standard claim type and Microsoft's full URL format
            var userIdClaim = User.FindFirst("sub") ?? 
                             User.FindFirst(ClaimTypes.NameIdentifier) ?? 
                             User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier") ??
                             User.FindFirst("userId");

            if (userIdClaim != null && Guid.TryParse(userIdClaim.Value, out var userId))
            {
                return userId;
            }
            return null;
        }
    }
}