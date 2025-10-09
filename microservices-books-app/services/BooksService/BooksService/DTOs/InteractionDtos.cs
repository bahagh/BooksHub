using System.ComponentModel.DataAnnotations;

namespace BooksService.DTOs
{
    public class CreateRatingDto
    {
        [Range(1, 5)]
        public int Rating { get; set; }

        [StringLength(1000)]
        public string? Review { get; set; }
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
        public Guid UserId { get; set; }
        public int Rating { get; set; }
        public string? Review { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class CreateCommentDto
    {
        [Required]
        [StringLength(2000, MinimumLength = 1)]
        public string Content { get; set; } = string.Empty;

        public Guid? ParentCommentId { get; set; }
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
        public Guid UserId { get; set; }
        public string Content { get; set; } = string.Empty;
        public Guid? ParentCommentId { get; set; }
        public bool IsEdited { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public IEnumerable<CommentDto> Replies { get; set; } = Enumerable.Empty<CommentDto>();
    }
}