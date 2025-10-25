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
    public class BookServiceTests
    {
        private readonly BooksDbContext _context;
        private readonly BooksService.Services.BookService _bookService;

        public BookServiceTests()
        {
            var options = new DbContextOptionsBuilder<BooksDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new BooksDbContext(options);
            _bookService = new BooksService.Services.BookService(_context);
        }

        [Fact]
        public async Task CreateBookAsync_ShouldCreateBook()
        {
            // Arrange
            var book = new Book
            {
                Title = "Test Book",
                Author = "Test Author",
                ISBN = "1234567890",
                PublicationYear = 2024,
                Description = "Test description"
            };

            // Act
            var result = await _bookService.CreateBookAsync(book);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("Test Book", result.Title);
            Assert.Equal("Test Author", result.Author);
            Assert.NotEqual(Guid.Empty, result.Id);
        }

        [Fact]
        public async Task GetBookByIdAsync_ShouldReturnBook_WhenBookExists()
        {
            // Arrange
            var book = new Book
            {
                Title = "Test Book",
                Author = "Test Author",
                ISBN = "1234567890"
            };
            await _context.Books.AddAsync(book);
            await _context.SaveChangesAsync();

            // Act
            var result = await _bookService.GetBookByIdAsync(book.Id);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(book.Id, result.Id);
            Assert.Equal("Test Book", result.Title);
        }

        [Fact]
        public async Task GetBookByIdAsync_ShouldReturnNull_WhenBookDoesNotExist()
        {
            // Act
            var result = await _bookService.GetBookByIdAsync(Guid.NewGuid());

            // Assert
            Assert.Null(result);
        }

        [Fact]
        public async Task GetAllBooksAsync_ShouldReturnAllBooks()
        {
            // Arrange
            var book1 = new Book { Title = "Book 1", Author = "Author 1", ISBN = "111" };
            var book2 = new Book { Title = "Book 2", Author = "Author 2", ISBN = "222" };
            await _context.Books.AddRangeAsync(book1, book2);
            await _context.SaveChangesAsync();

            // Act
            var result = await _bookService.GetAllBooksAsync();

            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result.Count());
        }

        [Fact]
        public async Task UpdateBookAsync_ShouldUpdateBook()
        {
            // Arrange
            var book = new Book
            {
                Title = "Original Title",
                Author = "Original Author",
                ISBN = "1234567890"
            };
            await _context.Books.AddAsync(book);
            await _context.SaveChangesAsync();

            // Act
            book.Title = "Updated Title";
            book.Author = "Updated Author";
            var result = await _bookService.UpdateBookAsync(book);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("Updated Title", result.Title);
            Assert.Equal("Updated Author", result.Author);
        }

        [Fact]
        public async Task DeleteBookAsync_ShouldDeleteBook()
        {
            // Arrange
            var book = new Book
            {
                Title = "Test Book",
                Author = "Test Author",
                ISBN = "1234567890"
            };
            await _context.Books.AddAsync(book);
            await _context.SaveChangesAsync();

            // Act
            var result = await _bookService.DeleteBookAsync(book.Id);

            // Assert
            Assert.True(result);
            var deletedBook = await _context.Books.FindAsync(book.Id);
            Assert.Null(deletedBook);
        }

        [Fact]
        public async Task SearchBooksAsync_ShouldReturnMatchingBooks()
        {
            // Arrange
            var book1 = new Book { Title = "Harry Potter", Author = "J.K. Rowling", ISBN = "111" };
            var book2 = new Book { Title = "Lord of the Rings", Author = "J.R.R. Tolkien", ISBN = "222" };
            var book3 = new Book { Title = "The Hobbit", Author = "J.R.R. Tolkien", ISBN = "333" };
            await _context.Books.AddRangeAsync(book1, book2, book3);
            await _context.SaveChangesAsync();

            // Act
            var result = await _bookService.SearchBooksAsync("Tolkien");

            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result.Count());
            Assert.All(result, b => Assert.Contains("Tolkien", b.Author));
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }
    }
}
