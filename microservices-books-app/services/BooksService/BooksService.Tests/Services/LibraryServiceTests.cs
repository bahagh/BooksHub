using Xunit;
using Moq;
using BooksService.Services;
using BooksService.Models;
using BooksService.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;
using System.Linq;

namespace BooksService.Tests.Services
{
    public class LibraryServiceTests
    {
        private readonly BooksDbContext _context;
        private readonly LibraryService _libraryService;

        public LibraryServiceTests()
        {
            var options = new DbContextOptionsBuilder<BooksDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new BooksDbContext(options);
            _libraryService = new LibraryService(_context);
        }

        [Fact]
        public async Task AddToLibraryAsync_ShouldAddBook()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var bookId = Guid.NewGuid();
            var libraryItem = new LibraryItem
            {
                UserId = userId,
                BookId = bookId,
                Status = "Reading"
            };

            // Act
            var result = await _libraryService.AddToLibraryAsync(libraryItem);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(userId, result.UserId);
            Assert.Equal(bookId, result.BookId);
            Assert.Equal("Reading", result.Status);
        }

        [Fact]
        public async Task GetUserLibraryAsync_ShouldReturnUserBooks()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var item1 = new LibraryItem { UserId = userId, BookId = Guid.NewGuid(), Status = "Read" };
            var item2 = new LibraryItem { UserId = userId, BookId = Guid.NewGuid(), Status = "Reading" };
            var otherUserItem = new LibraryItem { UserId = Guid.NewGuid(), BookId = Guid.NewGuid(), Status = "Read" };

            await _context.LibraryItems.AddRangeAsync(item1, item2, otherUserItem);
            await _context.SaveChangesAsync();

            // Act
            var result = await _libraryService.GetUserLibraryAsync(userId);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result.Count());
            Assert.All(result, item => Assert.Equal(userId, item.UserId));
        }

        [Fact]
        public async Task UpdateLibraryItemStatusAsync_ShouldUpdateStatus()
        {
            // Arrange
            var libraryItem = new LibraryItem
            {
                UserId = Guid.NewGuid(),
                BookId = Guid.NewGuid(),
                Status = "Want to Read"
            };
            await _context.LibraryItems.AddAsync(libraryItem);
            await _context.SaveChangesAsync();

            // Act
            var result = await _libraryService.UpdateLibraryItemStatusAsync(libraryItem.Id, "Reading");

            // Assert
            Assert.NotNull(result);
            Assert.Equal("Reading", result.Status);
        }

        [Fact]
        public async Task RemoveFromLibraryAsync_ShouldRemoveItem()
        {
            // Arrange
            var libraryItem = new LibraryItem
            {
                UserId = Guid.NewGuid(),
                BookId = Guid.NewGuid(),
                Status = "Read"
            };
            await _context.LibraryItems.AddAsync(libraryItem);
            await _context.SaveChangesAsync();

            // Act
            var result = await _libraryService.RemoveFromLibraryAsync(libraryItem.Id);

            // Assert
            Assert.True(result);
            var deletedItem = await _context.LibraryItems.FindAsync(libraryItem.Id);
            Assert.Null(deletedItem);
        }

        [Fact]
        public async Task IsBookInLibraryAsync_ShouldReturnTrue_WhenBookExists()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var bookId = Guid.NewGuid();
            var libraryItem = new LibraryItem
            {
                UserId = userId,
                BookId = bookId,
                Status = "Read"
            };
            await _context.LibraryItems.AddAsync(libraryItem);
            await _context.SaveChangesAsync();

            // Act
            var result = await _libraryService.IsBookInLibraryAsync(userId, bookId);

            // Assert
            Assert.True(result);
        }

        [Fact]
        public async Task IsBookInLibraryAsync_ShouldReturnFalse_WhenBookDoesNotExist()
        {
            // Act
            var result = await _libraryService.IsBookInLibraryAsync(Guid.NewGuid(), Guid.NewGuid());

            // Assert
            Assert.False(result);
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }
    }
}
