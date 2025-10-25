using UserService.DTOs;
using UserService.Models;

namespace UserService.Services
{
    public interface INotificationService
    {
        // Notification CRUD
        Task<NotificationDto> CreateNotificationAsync(CreateNotificationDto dto);
        Task<NotificationDto?> GetNotificationByIdAsync(Guid id, Guid userId);
        Task<List<NotificationDto>> GetUserNotificationsAsync(Guid userId, int page = 1, int pageSize = 20);
        Task<NotificationSummaryDto> GetNotificationSummaryAsync(Guid userId);
        Task<bool> MarkAsReadAsync(Guid id, Guid userId);
        Task<bool> MarkAllAsReadAsync(Guid userId);
        Task<bool> DeleteNotificationAsync(Guid id, Guid userId);
        Task<bool> DeleteAllReadNotificationsAsync(Guid userId);
        Task<int> GetUnreadCountAsync(Guid userId);

        // Notification Preferences
        Task<NotificationPreferenceDto> GetUserPreferencesAsync(Guid userId);
        Task<NotificationPreferenceDto> UpdateUserPreferencesAsync(Guid userId, UpdateNotificationPreferenceDto dto);
        Task<NotificationPreferenceDto> CreateDefaultPreferencesAsync(Guid userId);

        // Notification Creation Helpers
        Task CreateCommentReplyNotificationAsync(Guid recipientUserId, string commenterName, string bookTitle, string bookId, string commentId);
        Task CreateNewRatingNotificationAsync(Guid recipientUserId, string raterName, int rating, string bookTitle, string bookId);
        Task CreateBookUpdateNotificationAsync(Guid recipientUserId, string bookTitle, string bookId, string updateType);
        Task CreateNewFollowerNotificationAsync(Guid recipientUserId, string followerName, string followerId);
        Task CreateBookCommentNotificationAsync(Guid recipientUserId, string commenterName, string bookTitle, string bookId, string commentId);
        Task CreateBookViewNotificationAsync(Guid recipientUserId, string viewerName, string bookTitle, string bookId);
        Task CreateBookAddedToLibraryNotificationAsync(Guid recipientUserId, string userName, string bookTitle, string bookId);
    }
}
