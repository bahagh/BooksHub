using System.ComponentModel.DataAnnotations;

namespace BooksService.DTOs
{
    public class CreateRatingDto
    {
        [Range(1, 5)]
        public int Rating { get; set; }

        [StringLength(1000)]
        public string? Review { get; set; }

        // New: Support for anonymous ratings
        public bool IsAnonymous { get; set; } = false;

        [StringLength(50)]
        public string? AnonymousUsername { get; set; }
    }

    public class UpdateRatingDto
    {
        [Range(1, 5)]
        public int? Rating { get; set; }

        [StringLength(1000)]
        public string? Review { get; set; }
    }

    public class RatingDto
    {
        public Guid Id { get; set; }
        public Guid BookId { get; set; }
        public Guid? UserId { get; set; }  // Now nullable for anonymous ratings
        public int Rating { get; set; }
        public string? Review { get; set; }
        public bool IsAnonymous { get; set; }  // New: Indicates anonymous rating
        public string? AnonymousUsername { get; set; }  // New: Username for anonymous users
        public string? Username { get; set; }  // New: Display name (from user or anonymous)
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class CreateCommentDto
    {
        [Required]
        [StringLength(2000, MinimumLength = 1)]
        public string Content { get; set; } = string.Empty;

        public Guid? ParentCommentId { get; set; }

        // New: Support for anonymous comments
        public bool IsAnonymous { get; set; } = false;

        [StringLength(50)]
        public string? AnonymousUsername { get; set; }
    }

    public class UpdateCommentDto
    {
        [Required]
        [StringLength(2000, MinimumLength = 1)]
        public string Content { get; set; } = string.Empty;
    }

    public class CommentDto
    {
        public Guid Id { get; set; }
        public Guid BookId { get; set; }
        public Guid? UserId { get; set; }  // Now nullable for anonymous comments
        public string Content { get; set; } = string.Empty;
        public Guid? ParentCommentId { get; set; }
        public bool IsEdited { get; set; }
        public bool IsAnonymous { get; set; }  // New: Indicates anonymous comment
        public string? AnonymousUsername { get; set; }  // New: Username for anonymous users
        public string? Username { get; set; }  // New: Display name (from user or anonymous)
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public IEnumerable<CommentDto> Replies { get; set; } = Enumerable.Empty<CommentDto>();
    }
}