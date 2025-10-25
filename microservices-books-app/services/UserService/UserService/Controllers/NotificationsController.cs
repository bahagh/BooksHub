using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using UserService.DTOs;
using UserService.Services;

namespace UserService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class NotificationsController : ControllerBase
    {
        private readonly INotificationService _notificationService;
        private readonly ILogger<NotificationsController> _logger;

        public NotificationsController(
            INotificationService notificationService,
            ILogger<NotificationsController> logger)
        {
            _notificationService = notificationService;
            _logger = logger;
        }

        /// <summary>
        /// Get current user's notifications with pagination
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<ApiResponse<List<NotificationDto>>>> GetNotifications(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (!userId.HasValue)
                    return Unauthorized(ApiResponse<List<NotificationDto>>.CreateError("User not authenticated"));

                var notifications = await _notificationService.GetUserNotificationsAsync(userId.Value, page, pageSize);
                return Ok(ApiResponse<List<NotificationDto>>.CreateSuccess(notifications));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting notifications");
                return StatusCode(500, ApiResponse<List<NotificationDto>>.CreateError("Internal server error"));
            }
        }

        /// <summary>
        /// Get notification summary (unread count and recent notifications)
        /// </summary>
        [HttpGet("summary")]
        public async Task<ActionResult<ApiResponse<NotificationSummaryDto>>> GetNotificationSummary()
        {
            try
            {
                var userId = GetCurrentUserId();
                if (!userId.HasValue)
                    return Unauthorized(ApiResponse<NotificationSummaryDto>.CreateError("User not authenticated"));

                var summary = await _notificationService.GetNotificationSummaryAsync(userId.Value);
                return Ok(ApiResponse<NotificationSummaryDto>.CreateSuccess(summary));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting notification summary");
                return StatusCode(500, ApiResponse<NotificationSummaryDto>.CreateError("Internal server error"));
            }
        }

        /// <summary>
        /// Get unread notification count
        /// </summary>
        [HttpGet("unread/count")]
        public async Task<ActionResult<ApiResponse<int>>> GetUnreadCount()
        {
            try
            {
                var userId = GetCurrentUserId();
                if (!userId.HasValue)
                    return Unauthorized(ApiResponse<int>.CreateError("User not authenticated"));

                var count = await _notificationService.GetUnreadCountAsync(userId.Value);
                return Ok(ApiResponse<int>.CreateSuccess(count));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting unread count");
                return StatusCode(500, ApiResponse<int>.CreateError("Internal server error"));
            }
        }

        /// <summary>
        /// Get a specific notification by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<NotificationDto>>> GetNotification(Guid id)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (!userId.HasValue)
                    return Unauthorized(ApiResponse<NotificationDto>.CreateError("User not authenticated"));

                var notification = await _notificationService.GetNotificationByIdAsync(id, userId.Value);
                if (notification == null)
                    return NotFound(ApiResponse<NotificationDto>.CreateError("Notification not found"));

                return Ok(ApiResponse<NotificationDto>.CreateSuccess(notification));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting notification {NotificationId}", id);
                return StatusCode(500, ApiResponse<NotificationDto>.CreateError("Internal server error"));
            }
        }

        /// <summary>
        /// Mark a notification as read
        /// </summary>
        [HttpPut("{id}/read")]
        public async Task<ActionResult<ApiResponse<bool>>> MarkAsRead(Guid id)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (!userId.HasValue)
                    return Unauthorized(ApiResponse<bool>.CreateError("User not authenticated"));

                var success = await _notificationService.MarkAsReadAsync(id, userId.Value);
                if (!success)
                    return NotFound(ApiResponse<bool>.CreateError("Notification not found"));

                return Ok(ApiResponse<bool>.CreateSuccess(true, "Notification marked as read"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error marking notification as read {NotificationId}", id);
                return StatusCode(500, ApiResponse<bool>.CreateError("Internal server error"));
            }
        }

        /// <summary>
        /// Mark all notifications as read
        /// </summary>
        [HttpPut("read-all")]
        public async Task<ActionResult<ApiResponse<bool>>> MarkAllAsRead()
        {
            try
            {
                var userId = GetCurrentUserId();
                if (!userId.HasValue)
                    return Unauthorized(ApiResponse<bool>.CreateError("User not authenticated"));

                await _notificationService.MarkAllAsReadAsync(userId.Value);
                return Ok(ApiResponse<bool>.CreateSuccess(true, "All notifications marked as read"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error marking all notifications as read");
                return StatusCode(500, ApiResponse<bool>.CreateError("Internal server error"));
            }
        }

        /// <summary>
        /// Delete a notification
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<ActionResult<ApiResponse<bool>>> DeleteNotification(Guid id)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (!userId.HasValue)
                    return Unauthorized(ApiResponse<bool>.CreateError("User not authenticated"));

                var success = await _notificationService.DeleteNotificationAsync(id, userId.Value);
                if (!success)
                    return NotFound(ApiResponse<bool>.CreateError("Notification not found"));

                return Ok(ApiResponse<bool>.CreateSuccess(true, "Notification deleted"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting notification {NotificationId}", id);
                return StatusCode(500, ApiResponse<bool>.CreateError("Internal server error"));
            }
        }

        /// <summary>
        /// Delete all read notifications
        /// </summary>
        [HttpDelete("read")]
        public async Task<ActionResult<ApiResponse<bool>>> DeleteAllReadNotifications()
        {
            try
            {
                var userId = GetCurrentUserId();
                if (!userId.HasValue)
                    return Unauthorized(ApiResponse<bool>.CreateError("User not authenticated"));

                await _notificationService.DeleteAllReadNotificationsAsync(userId.Value);
                return Ok(ApiResponse<bool>.CreateSuccess(true, "All read notifications deleted"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting read notifications");
                return StatusCode(500, ApiResponse<bool>.CreateError("Internal server error"));
            }
        }

        /// <summary>
        /// Get user's notification preferences
        /// </summary>
        [HttpGet("preferences")]
        public async Task<ActionResult<ApiResponse<NotificationPreferenceDto>>> GetPreferences()
        {
            try
            {
                var userId = GetCurrentUserId();
                if (!userId.HasValue)
                    return Unauthorized(ApiResponse<NotificationPreferenceDto>.CreateError("User not authenticated"));

                var preferences = await _notificationService.GetUserPreferencesAsync(userId.Value);
                return Ok(ApiResponse<NotificationPreferenceDto>.CreateSuccess(preferences));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting notification preferences");
                return StatusCode(500, ApiResponse<NotificationPreferenceDto>.CreateError("Internal server error"));
            }
        }

        /// <summary>
        /// Update user's notification preferences
        /// </summary>
        [HttpPut("preferences")]
        public async Task<ActionResult<ApiResponse<NotificationPreferenceDto>>> UpdatePreferences([FromBody] UpdateNotificationPreferenceDto dto)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (!userId.HasValue)
                    return Unauthorized(ApiResponse<NotificationPreferenceDto>.CreateError("User not authenticated"));

                var preferences = await _notificationService.UpdateUserPreferencesAsync(userId.Value, dto);
                return Ok(ApiResponse<NotificationPreferenceDto>.CreateSuccess(preferences, "Preferences updated successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating notification preferences");
                return StatusCode(500, ApiResponse<NotificationPreferenceDto>.CreateError("Internal server error"));
            }
        }

        /// <summary>
        /// Trigger notification for comment reply (called by BooksService)
        /// </summary>
        [HttpPost("trigger/comment-reply")]
        [AllowAnonymous] // Allow service-to-service communication
        public async Task<ActionResult> TriggerCommentReplyNotification([FromBody] CommentReplyTriggerDto dto)
        {
            try
            {
                if (!Guid.TryParse(dto.RecipientUserId, out var recipientUserId))
                    return BadRequest("Invalid recipient user ID");

                await _notificationService.CreateCommentReplyNotificationAsync(
                    recipientUserId,
                    dto.CommenterName,
                    dto.BookTitle,
                    dto.BookId,
                    dto.CommentId);

                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error triggering comment reply notification");
                return StatusCode(500);
            }
        }

        /// <summary>
        /// Trigger notification for new rating (called by BooksService)
        /// </summary>
        [HttpPost("trigger/new-rating")]
        [AllowAnonymous] // Allow service-to-service communication
        public async Task<ActionResult> TriggerNewRatingNotification([FromBody] NewRatingTriggerDto dto)
        {
            try
            {
                if (!Guid.TryParse(dto.RecipientUserId, out var recipientUserId))
                    return BadRequest("Invalid recipient user ID");

                await _notificationService.CreateNewRatingNotificationAsync(
                    recipientUserId,
                    dto.RaterName,
                    dto.Rating,
                    dto.BookTitle,
                    dto.BookId);

                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error triggering new rating notification");
                return StatusCode(500);
            }
        }

        /// <summary>
        /// Trigger notification for book update (called by BooksService)
        /// </summary>
        [HttpPost("trigger/book-update")]
        [AllowAnonymous] // Allow service-to-service communication
        public async Task<ActionResult> TriggerBookUpdateNotification([FromBody] BookUpdateTriggerDto dto)
        {
            try
            {
                if (!Guid.TryParse(dto.AuthorUserId, out var authorUserId))
                    return BadRequest("Invalid author user ID");

                await _notificationService.CreateBookUpdateNotificationAsync(
                    authorUserId,
                    dto.BookTitle,
                    dto.BookId,
                    dto.UpdateType);

                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error triggering book update notification");
                return StatusCode(500);
            }
        }

        /// <summary>
        /// Trigger notification for book comment (called by BooksService)
        /// </summary>
        [HttpPost("trigger/book-comment")]
        [AllowAnonymous] // Allow service-to-service communication
        public async Task<ActionResult> TriggerBookCommentNotification([FromBody] BookCommentTriggerDto dto)
        {
            try
            {
                if (!Guid.TryParse(dto.RecipientUserId, out var recipientUserId))
                    return BadRequest("Invalid recipient user ID");

                await _notificationService.CreateBookCommentNotificationAsync(
                    recipientUserId,
                    dto.CommenterName,
                    dto.BookTitle,
                    dto.BookId,
                    dto.CommentId);

                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error triggering book comment notification");
                return StatusCode(500);
            }
        }

        /// <summary>
        /// Trigger notification for book view (called by BooksService)
        /// </summary>
        [HttpPost("trigger/book-view")]
        [AllowAnonymous] // Allow service-to-service communication
        public async Task<ActionResult> TriggerBookViewNotification([FromBody] BookViewTriggerDto dto)
        {
            try
            {
                if (!Guid.TryParse(dto.RecipientUserId, out var recipientUserId))
                    return BadRequest("Invalid recipient user ID");

                await _notificationService.CreateBookViewNotificationAsync(
                    recipientUserId,
                    dto.ViewerName,
                    dto.BookTitle,
                    dto.BookId);

                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error triggering book view notification");
                return StatusCode(500);
            }
        }

        /// <summary>
        /// Trigger notification for book added to library (called by BooksService)
        /// </summary>
        [HttpPost("trigger/book-added-to-library")]
        [AllowAnonymous] // Allow service-to-service communication
        public async Task<ActionResult> TriggerBookAddedToLibraryNotification([FromBody] BookAddedToLibraryTriggerDto dto)
        {
            try
            {
                if (!Guid.TryParse(dto.RecipientUserId, out var recipientUserId))
                    return BadRequest("Invalid recipient user ID");

                await _notificationService.CreateBookAddedToLibraryNotificationAsync(
                    recipientUserId,
                    dto.UserName,
                    dto.BookTitle,
                    dto.BookId);

                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error triggering book added to library notification");
                return StatusCode(500);
            }
        }

        private Guid? GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                return null;
            return userId;
        }
    }
}
