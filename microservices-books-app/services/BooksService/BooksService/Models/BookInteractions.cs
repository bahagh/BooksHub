using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BooksService.Models
{
    public class BookRating
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public Guid BookId { get; set; }

        // Now nullable to support anonymous ratings
        public Guid? UserId { get; set; }

        [Range(1, 5)]
        public int Rating { get; set; }

        [MaxLength(1000)]
        public string? Review { get; set; }

        // New: Anonymous support
        public bool IsAnonymous { get; set; } = false;

        [MaxLength(50)]
        public string? AnonymousUsername { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey("BookId")]
        public Book Book { get; set; } = null!;
    }

    public class BookComment
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public Guid BookId { get; set; }

        // Now nullable to support anonymous comments
        public Guid? UserId { get; set; }

        [Required]
        [MaxLength(2000)]
        public string Content { get; set; } = string.Empty;

        public Guid? ParentCommentId { get; set; }

        public bool IsEdited { get; set; } = false;
        public bool IsDeleted { get; set; } = false;

        // New: Anonymous support
        public bool IsAnonymous { get; set; } = false;

        [MaxLength(50)]
        public string? AnonymousUsername { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey("BookId")]
        public Book Book { get; set; } = null!;

        [ForeignKey("ParentCommentId")]
        public BookComment? ParentComment { get; set; }

        public ICollection<BookComment> Replies { get; set; } = new List<BookComment>();
    }

    public class BookView
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public Guid BookId { get; set; }

        [Required]
        public Guid UserId { get; set; }

        public DateTime ViewedAt { get; set; } = DateTime.UtcNow;

        public TimeSpan ReadingDuration { get; set; }

        // Navigation properties
        [ForeignKey("BookId")]
        public Book Book { get; set; } = null!;
    }

    public class UserLibrary
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public Guid UserId { get; set; }

        [Required]
        public Guid BookId { get; set; }

        public DateTime AddedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("BookId")]
        public Book Book { get; set; } = null!;
    }
}