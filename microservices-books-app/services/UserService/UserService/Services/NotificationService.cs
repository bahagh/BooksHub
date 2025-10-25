using Microsoft.EntityFrameworkCore;
using UserService.Data;
using UserService.DTOs;
using UserService.Models;

namespace UserService.Services
{
    public class NotificationService : INotificationService
    {
        private readonly UserDbContext _context;
        private readonly ILogger<NotificationService> _logger;
        private readonly IEmailService _emailService;

        public NotificationService(
            UserDbContext context,
            ILogger<NotificationService> logger,
            IEmailService emailService)
        {
            _context = context;
            _logger = logger;
            _emailService = emailService;
        }

        public async Task<NotificationDto> CreateNotificationAsync(CreateNotificationDto dto)
        {
            try
            {
                var notification = new Notification
                {
                    UserId = dto.UserId,
                    Type = dto.Type,
                    Title = dto.Title,
                    Message = dto.Message,
                    Link = dto.Link,
                    IsRead = false,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Notifications.Add(notification);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Created notification {notification.Id} for user {dto.UserId}");

                return MapToDto(notification);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error creating notification for user {dto.UserId}");
                throw;
            }
        }

        public async Task<NotificationDto?> GetNotificationByIdAsync(Guid id, Guid userId)
        {
            var notification = await _context.Notifications
                .FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId);

            return notification != null ? MapToDto(notification) : null;
        }

        public async Task<List<NotificationDto>> GetUserNotificationsAsync(Guid userId, int page = 1, int pageSize = 20)
        {
            var notifications = await _context.Notifications
                .Where(n => n.UserId == userId)
                .OrderByDescending(n => n.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return notifications.Select(MapToDto).ToList();
        }

        public async Task<NotificationSummaryDto> GetNotificationSummaryAsync(Guid userId)
        {
            var allNotifications = await _context.Notifications
                .Where(n => n.UserId == userId)
                .ToListAsync();

            var unreadCount = allNotifications.Count(n => !n.IsRead);
            var recentNotifications = allNotifications
                .OrderByDescending(n => n.CreatedAt)
                .Take(10)
                .Select(MapToDto)
                .ToList();

            return new NotificationSummaryDto
            {
                TotalCount = allNotifications.Count,
                UnreadCount = unreadCount,
                RecentNotifications = recentNotifications
            };
        }

        public async Task<bool> MarkAsReadAsync(Guid id, Guid userId)
        {
            var notification = await _context.Notifications
                .FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId);

            if (notification == null)
                return false;

            notification.IsRead = true;
            await _context.SaveChangesAsync();

            _logger.LogInformation($"Marked notification {id} as read for user {userId}");
            return true;
        }

        public async Task<bool> MarkAllAsReadAsync(Guid userId)
        {
            var notifications = await _context.Notifications
                .Where(n => n.UserId == userId && !n.IsRead)
                .ToListAsync();

            foreach (var notification in notifications)
            {
                notification.IsRead = true;
            }

            await _context.SaveChangesAsync();

            _logger.LogInformation($"Marked {notifications.Count} notifications as read for user {userId}");
            return true;
        }

        public async Task<bool> DeleteNotificationAsync(Guid id, Guid userId)
        {
            var notification = await _context.Notifications
                .FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId);

            if (notification == null)
                return false;

            _context.Notifications.Remove(notification);
            await _context.SaveChangesAsync();

            _logger.LogInformation($"Deleted notification {id} for user {userId}");
            return true;
        }

        public async Task<bool> DeleteAllReadNotificationsAsync(Guid userId)
        {
            var notifications = await _context.Notifications
                .Where(n => n.UserId == userId && n.IsRead)
                .ToListAsync();

            _context.Notifications.RemoveRange(notifications);
            await _context.SaveChangesAsync();

            _logger.LogInformation($"Deleted {notifications.Count} read notifications for user {userId}");
            return true;
        }

        public async Task<int> GetUnreadCountAsync(Guid userId)
        {
            return await _context.Notifications
                .Where(n => n.UserId == userId && !n.IsRead)
                .CountAsync();
        }

        // Notification Preferences
        public async Task<NotificationPreferenceDto> GetUserPreferencesAsync(Guid userId)
        {
            var preference = await _context.NotificationPreferences
                .FirstOrDefaultAsync(p => p.UserId == userId);

            if (preference == null)
            {
                // Create default preferences if they don't exist
                return await CreateDefaultPreferencesAsync(userId);
            }

            return MapPreferenceToDto(preference);
        }

        public async Task<NotificationPreferenceDto> UpdateUserPreferencesAsync(Guid userId, UpdateNotificationPreferenceDto dto)
        {
            var preference = await _context.NotificationPreferences
                .FirstOrDefaultAsync(p => p.UserId == userId);

            if (preference == null)
            {
                preference = new NotificationPreference
                {
                    UserId = userId
                };
                _context.NotificationPreferences.Add(preference);
            }

            // Update email preferences
            preference.EmailNotifications = dto.EmailNotifications;
            preference.EmailOnCommentReply = dto.EmailOnCommentReply;
            preference.EmailOnNewRating = dto.EmailOnNewRating;
            preference.EmailOnBookUpdate = dto.EmailOnBookUpdate;
            preference.EmailOnNewFollower = dto.EmailOnNewFollower;

            // Update in-app preferences
            preference.InAppNotifications = dto.InAppNotifications;
            preference.InAppOnCommentReply = dto.InAppOnCommentReply;
            preference.InAppOnNewRating = dto.InAppOnNewRating;
            preference.InAppOnBookUpdate = dto.InAppOnBookUpdate;
            preference.InAppOnNewFollower = dto.InAppOnNewFollower;

            preference.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation($"Updated notification preferences for user {userId}");

            return MapPreferenceToDto(preference);
        }

        public async Task<NotificationPreferenceDto> CreateDefaultPreferencesAsync(Guid userId)
        {
            var preference = new NotificationPreference
            {
                UserId = userId,
                EmailNotifications = true,
                EmailOnCommentReply = true,
                EmailOnNewRating = true,
                EmailOnBookUpdate = true,
                EmailOnNewFollower = false,
                InAppNotifications = true,
                InAppOnCommentReply = true,
                InAppOnNewRating = true,
                InAppOnBookUpdate = true,
                InAppOnNewFollower = true
            };

            _context.NotificationPreferences.Add(preference);
            await _context.SaveChangesAsync();

            _logger.LogInformation($"Created default notification preferences for user {userId}");

            return MapPreferenceToDto(preference);
        }

        // Notification Creation Helpers
        public async Task CreateCommentReplyNotificationAsync(
            Guid recipientUserId,
            string commenterName,
            string bookTitle,
            string bookId,
            string commentId)
        {
            var preferences = await GetUserPreferencesAsync(recipientUserId);

            // Check if in-app notifications are enabled
            if (preferences.InAppNotifications && preferences.InAppOnCommentReply)
            {
                await CreateNotificationAsync(new CreateNotificationDto
                {
                    UserId = recipientUserId,
                    Type = "CommentReply",
                    Title = "New Reply to Your Comment",
                    Message = $"{commenterName} replied to your comment on \"{bookTitle}\"",
                    Link = $"/books/{bookId}?comment={commentId}"
                });
            }

            // Check if email notifications are enabled
            if (preferences.EmailNotifications && preferences.EmailOnCommentReply)
            {
                try
                {
                    var user = await _context.Users.FindAsync(recipientUserId);
                    if (user != null)
                    {
                        await _emailService.SendCommentReplyNotificationAsync(
                            user.Email,
                            user.FirstName ?? user.Username,
                            commenterName,
                            bookTitle,
                            bookId,
                            commentId
                        );
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, $"Failed to send comment reply email to user {recipientUserId}");
                }
            }
        }

        public async Task CreateNewRatingNotificationAsync(
            Guid recipientUserId,
            string raterName,
            int rating,
            string bookTitle,
            string bookId)
        {
            var preferences = await GetUserPreferencesAsync(recipientUserId);

            // Check if in-app notifications are enabled
            if (preferences.InAppNotifications && preferences.InAppOnNewRating)
            {
                await CreateNotificationAsync(new CreateNotificationDto
                {
                    UserId = recipientUserId,
                    Type = "NewRating",
                    Title = "New Rating on Your Book",
                    Message = $"{raterName} rated \"{bookTitle}\" {rating} stars",
                    Link = $"/books/{bookId}"
                });
            }

            // Check if email notifications are enabled
            if (preferences.EmailNotifications && preferences.EmailOnNewRating)
            {
                try
                {
                    var user = await _context.Users.FindAsync(recipientUserId);
                    if (user != null)
                    {
                        await _emailService.SendNewRatingNotificationAsync(
                            user.Email,
                            user.FirstName ?? user.Username,
                            raterName,
                            rating,
                            bookTitle,
                            bookId
                        );
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, $"Failed to send new rating email to user {recipientUserId}");
                }
            }
        }

        public async Task CreateBookUpdateNotificationAsync(
            Guid recipientUserId,
            string bookTitle,
            string bookId,
            string updateType)
        {
            var preferences = await GetUserPreferencesAsync(recipientUserId);

            // Check if in-app notifications are enabled
            if (preferences.InAppNotifications && preferences.InAppOnBookUpdate)
            {
                await CreateNotificationAsync(new CreateNotificationDto
                {
                    UserId = recipientUserId,
                    Type = "BookUpdate",
                    Title = "Book Updated",
                    Message = $"\"{bookTitle}\" has been {updateType}",
                    Link = $"/books/{bookId}"
                });
            }

            // Check if email notifications are enabled
            if (preferences.EmailNotifications && preferences.EmailOnBookUpdate)
            {
                try
                {
                    var user = await _context.Users.FindAsync(recipientUserId);
                    if (user != null)
                    {
                        await _emailService.SendBookUpdateNotificationAsync(
                            user.Email,
                            user.FirstName ?? user.Username,
                            bookTitle,
                            bookId,
                            updateType
                        );
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, $"Failed to send book update email to user {recipientUserId}");
                }
            }
        }

        public async Task CreateNewFollowerNotificationAsync(
            Guid recipientUserId,
            string followerName,
            string followerId)
        {
            var preferences = await GetUserPreferencesAsync(recipientUserId);

            // Check if in-app notifications are enabled
            if (preferences.InAppNotifications && preferences.InAppOnNewFollower)
            {
                await CreateNotificationAsync(new CreateNotificationDto
                {
                    UserId = recipientUserId,
                    Type = "NewFollower",
                    Title = "New Follower",
                    Message = $"{followerName} started following you",
                    Link = $"/profile/{followerId}"
                });
            }

            // Check if email notifications are enabled
            if (preferences.EmailNotifications && preferences.EmailOnNewFollower)
            {
                try
                {
                    var user = await _context.Users.FindAsync(recipientUserId);
                    if (user != null)
                    {
                        await _emailService.SendNewFollowerNotificationAsync(
                            user.Email,
                            user.FirstName ?? user.Username,
                            followerName,
                            followerId
                        );
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, $"Failed to send new follower email to user {recipientUserId}");
                }
            }
        }

        public async Task CreateBookCommentNotificationAsync(
            Guid recipientUserId,
            string commenterName,
            string bookTitle,
            string bookId,
            string commentId)
        {
            var preferences = await GetUserPreferencesAsync(recipientUserId);

            // Check if in-app notifications are enabled
            if (preferences.InAppNotifications)
            {
                await CreateNotificationAsync(new CreateNotificationDto
                {
                    UserId = recipientUserId,
                    Type = "BookComment",
                    Title = "New Comment on Your Book",
                    Message = $"{commenterName} commented on your book \"{bookTitle}\"",
                    Link = $"/books/{bookId}#comment-{commentId}"
                });
            }
        }

        public async Task CreateBookViewNotificationAsync(
            Guid recipientUserId,
            string viewerName,
            string bookTitle,
            string bookId)
        {
            var preferences = await GetUserPreferencesAsync(recipientUserId);

            // Check if in-app notifications are enabled
            if (preferences.InAppNotifications)
            {
                await CreateNotificationAsync(new CreateNotificationDto
                {
                    UserId = recipientUserId,
                    Type = "BookView",
                    Title = "Someone Viewed Your Book",
                    Message = $"{viewerName} viewed your book \"{bookTitle}\"",
                    Link = $"/books/{bookId}"
                });
            }
        }

        public async Task CreateBookAddedToLibraryNotificationAsync(
            Guid recipientUserId,
            string userName,
            string bookTitle,
            string bookId)
        {
            var preferences = await GetUserPreferencesAsync(recipientUserId);

            // Check if in-app notifications are enabled
            if (preferences.InAppNotifications)
            {
                await CreateNotificationAsync(new CreateNotificationDto
                {
                    UserId = recipientUserId,
                    Type = "BookAddedToLibrary",
                    Title = "📚 Book Added to Library",
                    Message = $"{userName} added your book \"{bookTitle}\" to their library",
                    Link = $"/books/{bookId}"
                });
            }
        }

        // Helper methods
        private static NotificationDto MapToDto(Notification notification)
        {
            return new NotificationDto
            {
                Id = notification.Id,
                UserId = notification.UserId,
                Type = notification.Type,
                Title = notification.Title,
                Message = notification.Message,
                Link = notification.Link,
                IsRead = notification.IsRead,
                CreatedAt = notification.CreatedAt
            };
        }

        private static NotificationPreferenceDto MapPreferenceToDto(NotificationPreference preference)
        {
            return new NotificationPreferenceDto
            {
                Id = preference.Id,
                UserId = preference.UserId,
                EmailNotifications = preference.EmailNotifications,
                EmailOnCommentReply = preference.EmailOnCommentReply,
                EmailOnNewRating = preference.EmailOnNewRating,
                EmailOnBookUpdate = preference.EmailOnBookUpdate,
                EmailOnNewFollower = preference.EmailOnNewFollower,
                InAppNotifications = preference.InAppNotifications,
                InAppOnCommentReply = preference.InAppOnCommentReply,
                InAppOnNewRating = preference.InAppOnNewRating,
                InAppOnBookUpdate = preference.InAppOnBookUpdate,
                InAppOnNewFollower = preference.InAppOnNewFollower,
                CreatedAt = preference.CreatedAt,
                UpdatedAt = preference.UpdatedAt
            };
        }
    }
}
