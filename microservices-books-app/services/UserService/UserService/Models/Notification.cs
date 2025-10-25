using System.ComponentModel.DataAnnotations;

namespace UserService.Models
{
    public class Notification
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public Guid UserId { get; set; }

        [Required]
        [MaxLength(50)]
        public string Type { get; set; } = string.Empty; // "CommentReply", "NewRating", "BookUpdate", "NewFollower"

        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [MaxLength(500)]
        public string Message { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Link { get; set; }

        public bool IsRead { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation property
        public User? User { get; set; }
    }

    public class NotificationPreference
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public Guid UserId { get; set; }

        // Email notification preferences
        public bool EmailNotifications { get; set; } = true;
        public bool EmailOnCommentReply { get; set; } = true;
        public bool EmailOnNewRating { get; set; } = true;
        public bool EmailOnBookUpdate { get; set; } = true;
        public bool EmailOnNewFollower { get; set; } = false;

        // In-app notification preferences
        public bool InAppNotifications { get; set; } = true;
        public bool InAppOnCommentReply { get; set; } = true;
        public bool InAppOnNewRating { get; set; } = true;
        public bool InAppOnBookUpdate { get; set; } = true;
        public bool InAppOnNewFollower { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation property
        public User? User { get; set; }
    }
}
