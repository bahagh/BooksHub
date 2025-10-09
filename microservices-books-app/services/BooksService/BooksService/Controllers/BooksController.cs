using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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

        public BooksController(IBooksService booksService, IAnalyticsService analyticsService, ILogger<BooksController> logger)
        {
            _booksService = booksService;
            _analyticsService = analyticsService;
            _logger = logger;
        }

        [HttpPost]
        [Authorize]
        public async Task<ActionResult<BookDto>> CreateBook([FromBody] CreateBookDto createBookDto)
        {
            try
            {
                var userId = GetUserId();
                var book = await _booksService.CreateBookAsync(createBookDto, userId);
                return CreatedAtAction(nameof(GetBook), new { id = book.Id }, book);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating book");
                return StatusCode(500, new { message = "Internal server error" });
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
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
            {
                throw new UnauthorizedAccessException("Invalid user ID");
            }
            return userId;
        }

        private Guid? GetUserIdOrNull()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim != null && Guid.TryParse(userIdClaim.Value, out var userId))
            {
                return userId;
            }
            return null;
        }
    }
}