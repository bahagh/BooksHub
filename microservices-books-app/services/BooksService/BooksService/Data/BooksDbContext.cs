using Microsoft.EntityFrameworkCore;
using BooksService.Models;

namespace BooksService.Data
{
    public class BooksDbContext : DbContext
    {
        public BooksDbContext(DbContextOptions<BooksDbContext> options) : base(options)
        {
        }

        public DbSet<Book> Books { get; set; }
        public DbSet<BookRating> BookRatings { get; set; }
        public DbSet<BookComment> BookComments { get; set; }
        public DbSet<BookView> BookViews { get; set; }
        public DbSet<UserLibrary> UserLibraries { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Book configuration
            modelBuilder.Entity<Book>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.Title);
                entity.HasIndex(e => e.Status);
                entity.HasIndex(e => e.IsPublic);
                entity.HasIndex(e => e.CreatedAt);
                entity.HasIndex(e => e.Genre);
                entity.HasIndex(e => e.Language);
                entity.HasIndex(e => new { e.UserId, e.Status });
                entity.HasIndex(e => new { e.IsPublic, e.Status });

                entity.Property(e => e.Title).IsRequired().HasMaxLength(500);
                entity.Property(e => e.Content).IsRequired();
                entity.Property(e => e.Description).HasMaxLength(1000);
                entity.Property(e => e.Author).HasMaxLength(100);
                entity.Property(e => e.Genre).HasMaxLength(50);
                entity.Property(e => e.Language).HasMaxLength(20).HasDefaultValue("en");
                entity.Property(e => e.Status).HasDefaultValue(BookStatus.Draft);
                entity.Property(e => e.IsPublic).HasDefaultValue(false);
                entity.Property(e => e.ViewCount).HasDefaultValue(0);
                entity.Property(e => e.AverageRating).HasDefaultValue(0.0);
                entity.Property(e => e.RatingCount).HasDefaultValue(0);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.UpdatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");

                // JSON columns for PostgreSQL
                entity.Property(e => e.Tags).HasColumnType("jsonb");
                entity.Property(e => e.Metadata).HasColumnType("jsonb");
            });

            // BookRating configuration
            modelBuilder.Entity<BookRating>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.BookId);
                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => new { e.BookId, e.UserId }).IsUnique();

                entity.Property(e => e.Rating).IsRequired();
                entity.Property(e => e.Review).HasMaxLength(1000);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.UpdatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.HasOne(e => e.Book)
                      .WithMany(b => b.Ratings)
                      .HasForeignKey(e => e.BookId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // BookComment configuration
            modelBuilder.Entity<BookComment>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.BookId);
                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.ParentCommentId);
                entity.HasIndex(e => e.CreatedAt);

                entity.Property(e => e.Content).IsRequired().HasMaxLength(2000);
                entity.Property(e => e.IsEdited).HasDefaultValue(false);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.UpdatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.HasOne(e => e.Book)
                      .WithMany(b => b.Comments)
                      .HasForeignKey(e => e.BookId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.ParentComment)
                      .WithMany(c => c.Replies)
                      .HasForeignKey(e => e.ParentCommentId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // BookView configuration
            modelBuilder.Entity<BookView>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.BookId);
                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.ViewedAt);
                entity.HasIndex(e => new { e.BookId, e.UserId, e.ViewedAt });

                entity.Property(e => e.ViewedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.HasOne(e => e.Book)
                      .WithMany(b => b.Views)
                      .HasForeignKey(e => e.BookId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // UserLibrary configuration
            modelBuilder.Entity<UserLibrary>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => new { e.UserId, e.BookId }).IsUnique(); // Prevent duplicates
                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.AddedAt);

                entity.Property(e => e.AddedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.HasOne(e => e.Book)
                      .WithMany()
                      .HasForeignKey(e => e.BookId)
                      .OnDelete(DeleteBehavior.Cascade);
            });
        }

        public override int SaveChanges()
        {
            UpdateTimestamps();
            return base.SaveChanges();
        }

        public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            UpdateTimestamps();
            return await base.SaveChangesAsync(cancellationToken);
        }

        private void UpdateTimestamps()
        {
            var entries = ChangeTracker.Entries()
                .Where(e => (e.Entity is Book || e.Entity is BookRating || e.Entity is BookComment) 
                           && e.State == EntityState.Modified);

            foreach (var entry in entries)
            {
                if (entry.Entity is Book book)
                {
                    book.UpdatedAt = DateTime.UtcNow;
                }
                else if (entry.Entity is BookRating rating)
                {
                    rating.UpdatedAt = DateTime.UtcNow;
                }
                else if (entry.Entity is BookComment comment)
                {
                    comment.UpdatedAt = DateTime.UtcNow;
                    comment.IsEdited = true;
                }
            }
        }
    }
}