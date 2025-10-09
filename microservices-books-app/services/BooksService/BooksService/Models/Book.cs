using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BooksService.Models
{
    public class Book
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [MaxLength(500)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Content { get; set; } = string.Empty;

        [Required]
        public Guid UserId { get; set; }

        [MaxLength(1000)]
        public string? Description { get; set; }

        [MaxLength(100)]
        public string? Author { get; set; }

        [MaxLength(50)]
        public string? Genre { get; set; }

        [MaxLength(20)]
        public string? Language { get; set; } = "en";

        public int WordCount { get; set; }

        public int CharacterCount { get; set; }

        public double ReadingTimeMinutes { get; set; }

        public BookStatus Status { get; set; } = BookStatus.Draft;

        public bool IsPublic { get; set; } = false;

        public int ViewCount { get; set; } = 0;

        public double AverageRating { get; set; } = 0.0;

        public int RatingCount { get; set; } = 0;

        [Column(TypeName = "jsonb")]
        public string? Tags { get; set; } // JSON array of tags

        [Column(TypeName = "jsonb")]
        public string? Metadata { get; set; } // JSON for extensible metadata

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? PublishedAt { get; set; }

        // Navigation properties
        public ICollection<BookRating> Ratings { get; set; } = new List<BookRating>();
        public ICollection<BookComment> Comments { get; set; } = new List<BookComment>();
        public ICollection<BookView> Views { get; set; } = new List<BookView>();

        // Computed properties
        public bool IsPublished => Status == BookStatus.Published;
        public string EstimatedReadingTime => $"{Math.Ceiling(ReadingTimeMinutes)} min read";
    }

    public enum BookStatus
    {
        Draft = 0,
        InReview = 1,
        Published = 2,
        Archived = 3
    }
}