namespace UserService.DTOs
{
    public class NotificationDto
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string Type { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string? Link { get; set; }
        public bool IsRead { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateNotificationDto
    {
        public Guid UserId { get; set; }
        public string Type { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string? Link { get; set; }
    }

    public class UpdateNotificationDto
    {
        public bool IsRead { get; set; }
    }

    public class NotificationPreferenceDto
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        
        // Email notification preferences
        public bool EmailNotifications { get; set; }
        public bool EmailOnCommentReply { get; set; }
        public bool EmailOnNewRating { get; set; }
        public bool EmailOnBookUpdate { get; set; }
        public bool EmailOnNewFollower { get; set; }
        
        // In-app notification preferences
        public bool InAppNotifications { get; set; }
        public bool InAppOnCommentReply { get; set; }
        public bool InAppOnNewRating { get; set; }
        public bool InAppOnBookUpdate { get; set; }
        public bool InAppOnNewFollower { get; set; }
        
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class UpdateNotificationPreferenceDto
    {
        // Email notification preferences
        public bool EmailNotifications { get; set; }
        public bool EmailOnCommentReply { get; set; }
        public bool EmailOnNewRating { get; set; }
        public bool EmailOnBookUpdate { get; set; }
        public bool EmailOnNewFollower { get; set; }
        
        // In-app notification preferences
        public bool InAppNotifications { get; set; }
        public bool InAppOnCommentReply { get; set; }
        public bool InAppOnNewRating { get; set; }
        public bool InAppOnBookUpdate { get; set; }
        public bool InAppOnNewFollower { get; set; }
    }

    public class NotificationSummaryDto
    {
        public int TotalCount { get; set; }
        public int UnreadCount { get; set; }
        public List<NotificationDto> RecentNotifications { get; set; } = new();
    }

    // Trigger DTOs for service-to-service communication
    public class CommentReplyTriggerDto
    {
        public string RecipientUserId { get; set; } = string.Empty;
        public string CommenterName { get; set; } = string.Empty;
        public string BookTitle { get; set; } = string.Empty;
        public string BookId { get; set; } = string.Empty;
        public string CommentId { get; set; } = string.Empty;
    }

    public class NewRatingTriggerDto
    {
        public string RecipientUserId { get; set; } = string.Empty;
        public string RaterName { get; set; } = string.Empty;
        public int Rating { get; set; }
        public string BookTitle { get; set; } = string.Empty;
        public string BookId { get; set; } = string.Empty;
    }

    public class BookUpdateTriggerDto
    {
        public string AuthorUserId { get; set; } = string.Empty;
        public string BookTitle { get; set; } = string.Empty;
        public string BookId { get; set; } = string.Empty;
        public string UpdateType { get; set; } = string.Empty;
    }

    public class BookCommentTriggerDto
    {
        public string RecipientUserId { get; set; } = string.Empty;
        public string CommenterName { get; set; } = string.Empty;
        public string BookTitle { get; set; } = string.Empty;
        public string BookId { get; set; } = string.Empty;
        public string CommentId { get; set; } = string.Empty;
    }

    public class BookViewTriggerDto
    {
        public string RecipientUserId { get; set; } = string.Empty;
        public string ViewerName { get; set; } = string.Empty;
        public string BookTitle { get; set; } = string.Empty;
        public string BookId { get; set; } = string.Empty;
    }

    public class BookAddedToLibraryTriggerDto
    {
        public string RecipientUserId { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public string BookTitle { get; set; } = string.Empty;
        public string BookId { get; set; } = string.Empty;
    }
}
