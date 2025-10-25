using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BooksService.Data;
using BooksService.Models;
using BooksService.DTOs;
using BooksService.Services;
using System.Security.Claims;

namespace BooksService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class LibraryController : ControllerBase
    {
        private readonly BooksDbContext _context;
        private readonly ILogger<LibraryController> _logger;
        private readonly INotificationClient _notificationClient;
        private readonly IUserClient _userClient;

        public LibraryController(
            BooksDbContext context, 
            ILogger<LibraryController> logger,
            INotificationClient notificationClient,
            IUserClient userClient)
        {
            _context = context;
            _logger = logger;
            _notificationClient = notificationClient;
            _userClient = userClient;
        }

        /// <summary>
        /// Get all books in user's library
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<List<BookListDto>>> GetMyLibrary()
        {
            try
            {
                var userId = GetUserId();

                var libraryEntries = await _context.UserLibraries
                    .Where(ul => ul.UserId == userId)
                    .Include(ul => ul.Book)
                    .OrderByDescending(ul => ul.AddedAt)
                    .ToListAsync();

                var libraryBooks = libraryEntries.Select(ul => new BookListDto
                {
                    Id = ul.Book.Id,
                    Title = ul.Book.Title,
                    UserId = ul.Book.UserId,
                    Description = ul.Book.Description,
                    Author = ul.Book.Author,
                    Genre = ul.Book.Genre,
                    WordCount = ul.Book.WordCount,
                    EstimatedReadingTime = ul.Book.ReadingTimeMinutes.ToString("F0") + " min",
                    Status = ul.Book.Status,
                    IsPublic = ul.Book.IsPublic,
                    ViewCount = ul.Book.ViewCount,
                    AverageRating = ul.Book.AverageRating,
                    RatingCount = ul.Book.RatingCount,
                    Tags = ul.Book.Tags != null ? System.Text.Json.JsonSerializer.Deserialize<string[]>(ul.Book.Tags) : null,
                    CreatedAt = ul.Book.CreatedAt,
                    PublishedAt = ul.Book.PublishedAt,
                    IsPublished = ul.Book.Status == BookStatus.Published
                }).ToList();

                return Ok(libraryBooks);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user library");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        /// <summary>
        /// Check if a book is in user's library
        /// </summary>
        [HttpGet("{bookId}/status")]
        public async Task<ActionResult<bool>> IsInLibrary(Guid bookId)
        {
            try
            {
                var userId = GetUserId();

                var exists = await _context.UserLibraries
                    .AnyAsync(ul => ul.UserId == userId && ul.BookId == bookId);

                return Ok(new { inLibrary = exists });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking library status for book {BookId}", bookId);
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        /// <summary>
        /// Add a book to user's library
        /// </summary>
        [HttpPost("{bookId}")]
        public async Task<ActionResult> AddToLibrary(Guid bookId)
        {
            try
            {
                var userId = GetUserId();

                // Check if book exists
                var book = await _context.Books.FindAsync(bookId);
                if (book == null)
                {
                    return NotFound(new { message = "Book not found" });
                }

                // Check if book is public (can't add private books from other users)
                if (book.UserId != userId && !book.IsPublic)
                {
                    return BadRequest(new { message = "Cannot add private books to library" });
                }

                // Check if already in library
                var exists = await _context.UserLibraries
                    .AnyAsync(ul => ul.UserId == userId && ul.BookId == bookId);

                if (exists)
                {
                    return BadRequest(new { message = "Book is already in your library" });
                }

                // Add to library
                var libraryEntry = new UserLibrary
                {
                    UserId = userId,
                    BookId = bookId
                };

                _context.UserLibraries.Add(libraryEntry);
                await _context.SaveChangesAsync();

                _logger.LogInformation("User {UserId} added book {BookId} to library", userId, bookId);

                // Send notification to book creator (only if it's not their own book)
                if (book.UserId != userId)
                {
                    try
                    {
                        // Get current user's name
                        var userInfo = await _userClient.GetUserInfoAsync(userId);
                        var userName = userInfo?.FullName ?? "Someone";

                        // Notify book creator
                        await _notificationClient.NotifyBookAddedToLibraryAsync(
                            book.UserId,
                            userName,
                            book.Title,
                            book.Id.ToString()
                        );

                        _logger.LogInformation(
                            "Notification sent to book creator {CreatorId} about user {UserId} adding book {BookId} to library",
                            book.UserId, userId, bookId);
                    }
                    catch (Exception notifEx)
                    {
                        // Log notification failure but don't fail the request
                        _logger.LogWarning(notifEx,
                            "Failed to send notification for book {BookId} added to library", bookId);
                    }
                }

                return Ok(new { message = "Book added to library successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding book {BookId} to library", bookId);
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        /// <summary>
        /// Remove a book from user's library
        /// </summary>
        [HttpDelete("{bookId}")]
        public async Task<ActionResult> RemoveFromLibrary(Guid bookId)
        {
            try
            {
                var userId = GetUserId();

                var libraryEntry = await _context.UserLibraries
                    .FirstOrDefaultAsync(ul => ul.UserId == userId && ul.BookId == bookId);

                if (libraryEntry == null)
                {
                    return NotFound(new { message = "Book not found in your library" });
                }

                _context.UserLibraries.Remove(libraryEntry);
                await _context.SaveChangesAsync();

                _logger.LogInformation("User {UserId} removed book {BookId} from library", userId, bookId);

                return Ok(new { message = "Book removed from library successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing book {BookId} from library", bookId);
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        /// <summary>
        /// Get library statistics
        /// </summary>
        [HttpGet("stats")]
        public async Task<ActionResult> GetLibraryStats()
        {
            try
            {
                var userId = GetUserId();

                var totalBooks = await _context.UserLibraries
                    .Where(ul => ul.UserId == userId)
                    .CountAsync();

                var genreStats = await _context.UserLibraries
                    .Where(ul => ul.UserId == userId)
                    .Include(ul => ul.Book)
                    .GroupBy(ul => ul.Book.Genre)
                    .Select(g => new { genre = g.Key ?? "Unknown", count = g.Count() })
                    .OrderByDescending(g => g.count)
                    .Take(5)
                    .ToListAsync();

                return Ok(new
                {
                    totalBooks,
                    topGenres = genreStats
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting library stats");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        private Guid GetUserId()
        {
            var userIdClaim = User.FindFirst("sub")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out Guid userId))
            {
                throw new UnauthorizedAccessException("User ID not found in token");
            }
            return userId;
        }
    }
}
