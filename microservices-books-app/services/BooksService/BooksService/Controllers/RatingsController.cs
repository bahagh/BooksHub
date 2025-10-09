using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BooksService.DTOs;
using BooksService.Services;
using System.Security.Claims;

namespace BooksService.Controllers
{
    [ApiController]
    [Route("api/books/{bookId:guid}/[controller]")]
    [Authorize]
    public class RatingsController : ControllerBase
    {
        private readonly IRatingsService _ratingsService;
        private readonly ILogger<RatingsController> _logger;

        public RatingsController(IRatingsService ratingsService, ILogger<RatingsController> logger)
        {
            _ratingsService = ratingsService;
            _logger = logger;
        }

        /// <summary>
        /// Get all ratings for a book
        /// </summary>
        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<PaginatedResult<RatingDto>>> GetBookRatings(
            Guid bookId, 
            [FromQuery] int page = 1, 
            [FromQuery] int pageSize = 10)
        {
            var result = await _ratingsService.GetBookRatingsAsync(bookId, page, pageSize);
            return Ok(result);
        }

        /// <summary>
        /// Get rating distribution for a book
        /// </summary>
        [HttpGet("distribution")]
        [AllowAnonymous]
        public async Task<ActionResult<Dictionary<int, int>>> GetRatingDistribution(Guid bookId)
        {
            var distribution = await _ratingsService.GetRatingDistributionAsync(bookId);
            return Ok(distribution);
        }

        /// <summary>
        /// Get current user's rating for the book
        /// </summary>
        [HttpGet("my-rating")]
        public async Task<ActionResult<RatingDto>> GetMyRating(Guid bookId)
        {
            var userId = GetCurrentUserId();
            if (!userId.HasValue)
                return Unauthorized();

            var rating = await _ratingsService.GetUserRatingForBookAsync(bookId, userId.Value);
            if (rating == null)
                return NotFound();

            return Ok(rating);
        }

        /// <summary>
        /// Create a new rating for the book
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<RatingDto>> CreateRating(Guid bookId, [FromBody] CreateRatingDto createRatingDto)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (!userId.HasValue)
                    return Unauthorized();

                var rating = await _ratingsService.CreateRatingAsync(bookId, createRatingDto, userId.Value);
                return CreatedAtAction(nameof(GetMyRating), new { bookId }, rating);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Update user's rating for the book
        /// </summary>
        [HttpPut("{ratingId:guid}")]
        public async Task<ActionResult<RatingDto>> UpdateRating(
            Guid bookId, 
            Guid ratingId, 
            [FromBody] UpdateRatingDto updateRatingDto)
        {
            var userId = GetCurrentUserId();
            if (!userId.HasValue)
                return Unauthorized();

            var rating = await _ratingsService.UpdateRatingAsync(bookId, ratingId, updateRatingDto, userId.Value);
            if (rating == null)
                return NotFound();

            return Ok(rating);
        }

        /// <summary>
        /// Delete user's rating for the book
        /// </summary>
        [HttpDelete("{ratingId:guid}")]
        public async Task<ActionResult> DeleteRating(Guid bookId, Guid ratingId)
        {
            var userId = GetCurrentUserId();
            if (!userId.HasValue)
                return Unauthorized();

            var success = await _ratingsService.DeleteRatingAsync(bookId, ratingId, userId.Value);
            if (!success)
                return NotFound();

            return NoContent();
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
}