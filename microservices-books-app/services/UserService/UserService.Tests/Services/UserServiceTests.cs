using Xunit;
using Moq;
using UserService.Services;
using UserService.Models;
using UserService.Data;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System;

namespace UserService.Tests.Services
{
    public class UserServiceTests
    {
        private readonly Mock<IJwtService> _mockJwtService;
        private readonly UserDbContext _context;
        private readonly UserService.Services.UserService _userService;

        public UserServiceTests()
        {
            var options = new DbContextOptionsBuilder<UserDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new UserDbContext(options);
            _mockJwtService = new Mock<IJwtService>();
            _userService = new UserService.Services.UserService(_context);
        }

        [Fact]
        public async Task CreateUserAsync_ShouldCreateUser_WhenValidData()
        {
            // Arrange
            var user = new User
            {
                Username = "testuser",
                Email = "test@example.com",
                FirstName = "Test",
                LastName = "User",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123")
            };

            // Act
            var result = await _userService.CreateUserAsync(user);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("testuser", result.Username);
            Assert.Equal("test@example.com", result.Email);
            Assert.NotEqual(Guid.Empty, result.Id);
        }

        [Fact]
        public async Task GetUserByEmailAsync_ShouldReturnUser_WhenUserExists()
        {
            // Arrange
            var user = new User
            {
                Username = "testuser",
                Email = "test@example.com",
                FirstName = "Test",
                LastName = "User",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123")
            };
            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();

            // Act
            var result = await _userService.GetUserByEmailAsync("test@example.com");

            // Assert
            Assert.NotNull(result);
            Assert.Equal("test@example.com", result.Email);
        }

        [Fact]
        public async Task GetUserByEmailAsync_ShouldReturnNull_WhenUserDoesNotExist()
        {
            // Act
            var result = await _userService.GetUserByEmailAsync("nonexistent@example.com");

            // Assert
            Assert.Null(result);
        }

        [Fact]
        public async Task ValidatePasswordAsync_ShouldReturnTrue_WhenPasswordIsCorrect()
        {
            // Arrange
            var password = "password123";
            var user = new User
            {
                Username = "testuser",
                Email = "test@example.com",
                FirstName = "Test",
                LastName = "User",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(password)
            };
            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();

            // Act
            var result = await _userService.ValidatePasswordAsync("test@example.com", password);

            // Assert
            Assert.True(result);
        }

        [Fact]
        public async Task ValidatePasswordAsync_ShouldReturnFalse_WhenPasswordIsIncorrect()
        {
            // Arrange
            var user = new User
            {
                Username = "testuser",
                Email = "test@example.com",
                FirstName = "Test",
                LastName = "User",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123")
            };
            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();

            // Act
            var result = await _userService.ValidatePasswordAsync("test@example.com", "wrongpassword");

            // Assert
            Assert.False(result);
        }

        [Fact]
        public async Task GetUserByIdAsync_ShouldReturnUser_WhenUserExists()
        {
            // Arrange
            var user = new User
            {
                Username = "testuser",
                Email = "test@example.com",
                FirstName = "Test",
                LastName = "User",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123")
            };
            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();

            // Act
            var result = await _userService.GetUserByIdAsync(user.Id);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(user.Id, result.Id);
        }

        [Fact]
        public async Task UpdateUserAsync_ShouldUpdateUser_WhenUserExists()
        {
            // Arrange
            var user = new User
            {
                Username = "testuser",
                Email = "test@example.com",
                FirstName = "Test",
                LastName = "User",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123")
            };
            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();

            // Act
            user.FirstName = "Updated";
            user.LastName = "Name";
            var result = await _userService.UpdateUserAsync(user);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("Updated", result.FirstName);
            Assert.Equal("Name", result.LastName);
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }
    }
}
