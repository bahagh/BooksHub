using Xunit;
using Moq;
using UserService.Services;
using UserService.Models;
using UserService.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;
using System.Linq;

namespace UserService.Tests.Services
{
    public class NotificationServiceTests
    {
        private readonly UserDbContext _context;
        private readonly NotificationService _notificationService;

        public NotificationServiceTests()
        {
            var options = new DbContextOptionsBuilder<UserDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new UserDbContext(options);
            _notificationService = new NotificationService(_context);
        }

        [Fact]
        public async Task CreateNotificationAsync_ShouldCreateNotification()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var notification = new Notification
            {
                UserId = userId,
                Type = "Comment",
                Message = "Test notification",
                BookId = Guid.NewGuid()
            };

            // Act
            var result = await _notificationService.CreateNotificationAsync(notification);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(userId, result.UserId);
            Assert.Equal("Comment", result.Type);
            Assert.Equal("Test notification", result.Message);
            Assert.NotEqual(Guid.Empty, result.Id);
        }

        [Fact]
        public async Task GetUserNotificationsAsync_ShouldReturnUserNotifications()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var notification1 = new Notification
            {
                UserId = userId,
                Type = "Comment",
                Message = "Notification 1"
            };
            var notification2 = new Notification
            {
                UserId = userId,
                Type = "Rating",
                Message = "Notification 2"
            };
            var otherUserNotification = new Notification
            {
                UserId = Guid.NewGuid(),
                Type = "Comment",
                Message = "Other user notification"
            };

            await _context.Notifications.AddRangeAsync(notification1, notification2, otherUserNotification);
            await _context.SaveChangesAsync();

            // Act
            var result = await _notificationService.GetUserNotificationsAsync(userId);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result.Count());
            Assert.All(result, n => Assert.Equal(userId, n.UserId));
        }

        [Fact]
        public async Task MarkAsReadAsync_ShouldMarkNotificationAsRead()
        {
            // Arrange
            var notification = new Notification
            {
                UserId = Guid.NewGuid(),
                Type = "Comment",
                Message = "Test notification",
                IsRead = false
            };
            await _context.Notifications.AddAsync(notification);
            await _context.SaveChangesAsync();

            // Act
            var result = await _notificationService.MarkAsReadAsync(notification.Id);

            // Assert
            Assert.True(result);
            var updatedNotification = await _context.Notifications.FindAsync(notification.Id);
            Assert.True(updatedNotification.IsRead);
        }

        [Fact]
        public async Task MarkAsReadAsync_ShouldReturnFalse_WhenNotificationDoesNotExist()
        {
            // Act
            var result = await _notificationService.MarkAsReadAsync(Guid.NewGuid());

            // Assert
            Assert.False(result);
        }

        [Fact]
        public async Task GetUnreadCountAsync_ShouldReturnCorrectCount()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var notification1 = new Notification
            {
                UserId = userId,
                Type = "Comment",
                Message = "Unread 1",
                IsRead = false
            };
            var notification2 = new Notification
            {
                UserId = userId,
                Type = "Rating",
                Message = "Unread 2",
                IsRead = false
            };
            var readNotification = new Notification
            {
                UserId = userId,
                Type = "Comment",
                Message = "Read notification",
                IsRead = true
            };

            await _context.Notifications.AddRangeAsync(notification1, notification2, readNotification);
            await _context.SaveChangesAsync();

            // Act
            var result = await _notificationService.GetUnreadCountAsync(userId);

            // Assert
            Assert.Equal(2, result);
        }

        [Fact]
        public async Task DeleteNotificationAsync_ShouldDeleteNotification()
        {
            // Arrange
            var notification = new Notification
            {
                UserId = Guid.NewGuid(),
                Type = "Comment",
                Message = "Test notification"
            };
            await _context.Notifications.AddAsync(notification);
            await _context.SaveChangesAsync();

            // Act
            var result = await _notificationService.DeleteNotificationAsync(notification.Id);

            // Assert
            Assert.True(result);
            var deletedNotification = await _context.Notifications.FindAsync(notification.Id);
            Assert.Null(deletedNotification);
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }
    }
}
