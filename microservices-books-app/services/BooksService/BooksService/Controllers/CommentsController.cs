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
    public class CommentsController : ControllerBase
    {
        private readonly ICommentsService _commentsService;
        private readonly ILogger<CommentsController> _logger;

        public CommentsController(ICommentsService commentsService, ILogger<CommentsController> logger)
        {
            _commentsService = commentsService;
            _logger = logger;
        }

        /// <summary>
        /// Get all comments for a book (paginated, top-level only)
        /// </summary>
        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<PaginatedResult<CommentDto>>> GetBookComments(
            Guid bookId,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            var result = await _commentsService.GetBookCommentsAsync(bookId, page, pageSize);
            return Ok(result);
        }

        /// <summary>
        /// Get replies for a specific comment
        /// </summary>
        [HttpGet("{commentId:guid}/replies")]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<CommentDto>>> GetCommentReplies(Guid commentId)
        {
            var replies = await _commentsService.GetCommentRepliesAsync(commentId);
            return Ok(replies);
        }

        /// <summary>
        /// Get total comments count for a book
        /// </summary>
        [HttpGet("count")]
        [AllowAnonymous]
        public async Task<ActionResult<int>> GetCommentsCount(Guid bookId)
        {
            var count = await _commentsService.GetBookCommentsCountAsync(bookId);
            return Ok(count);
        }

        /// <summary>
        /// Create a new comment or reply
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<CommentDto>> CreateComment(
            Guid bookId, 
            [FromBody] CreateCommentDto createCommentDto)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (!userId.HasValue)
                    return Unauthorized();

                var comment = await _commentsService.CreateCommentAsync(bookId, createCommentDto, userId.Value);
                return CreatedAtAction(nameof(GetBookComments), new { bookId }, comment);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Update a comment
        /// </summary>
        [HttpPut("{commentId:guid}")]
        public async Task<ActionResult<CommentDto>> UpdateComment(
            Guid bookId,
            Guid commentId,
            [FromBody] UpdateCommentDto updateCommentDto)
        {
            var userId = GetCurrentUserId();
            if (!userId.HasValue)
                return Unauthorized();

            var comment = await _commentsService.UpdateCommentAsync(bookId, commentId, updateCommentDto, userId.Value);
            if (comment == null)
                return NotFound();

            return Ok(comment);
        }

        /// <summary>
        /// Delete a comment
        /// </summary>
        [HttpDelete("{commentId:guid}")]
        public async Task<ActionResult> DeleteComment(Guid bookId, Guid commentId)
        {
            var userId = GetCurrentUserId();
            if (!userId.HasValue)
                return Unauthorized();

            var success = await _commentsService.DeleteCommentAsync(bookId, commentId, userId.Value);
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