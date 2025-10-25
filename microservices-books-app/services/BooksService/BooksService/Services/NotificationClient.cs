using System.Text;
using System.Text.Json;

namespace BooksService.Services
{
    public class NotificationClient : INotificationClient
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ILogger<NotificationClient> _logger;
        private readonly IConfiguration _configuration;

        public NotificationClient(
            IHttpClientFactory httpClientFactory,
            ILogger<NotificationClient> logger,
            IConfiguration configuration)
        {
            _httpClientFactory = httpClientFactory;
            _logger = logger;
            _configuration = configuration;
        }

        public async Task NotifyCommentReplyAsync(
            Guid recipientUserId,
            string commenterName,
            string bookTitle,
            string bookId,
            string commentId)
        {
            try
            {
                var client = _httpClientFactory.CreateClient("UserService");
                var payload = new
                {
                    recipientUserId = recipientUserId.ToString(),
                    commenterName,
                    bookTitle,
                    bookId,
                    commentId
                };

                var content = new StringContent(
                    JsonSerializer.Serialize(payload),
                    Encoding.UTF8,
                    "application/json");

                var response = await client.PostAsync("/api/notifications/trigger/comment-reply", content);

                if (response.IsSuccessStatusCode)
                {
                    _logger.LogInformation(
                        "Successfully triggered comment reply notification for user {UserId}",
                        recipientUserId);
                }
                else
                {
                    _logger.LogWarning(
                        "Failed to trigger comment reply notification for user {UserId}. Status: {Status}",
                        recipientUserId,
                        response.StatusCode);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,
                    "Error triggering comment reply notification for user {UserId}",
                    recipientUserId);
            }
        }

        public async Task NotifyNewRatingAsync(
            Guid recipientUserId,
            string raterName,
            int rating,
            string bookTitle,
            string bookId)
        {
            try
            {
                var client = _httpClientFactory.CreateClient("UserService");
                var payload = new
                {
                    recipientUserId = recipientUserId.ToString(),
                    raterName,
                    rating,
                    bookTitle,
                    bookId
                };

                var content = new StringContent(
                    JsonSerializer.Serialize(payload),
                    Encoding.UTF8,
                    "application/json");

                var response = await client.PostAsync("/api/notifications/trigger/new-rating", content);

                if (response.IsSuccessStatusCode)
                {
                    _logger.LogInformation(
                        "Successfully triggered new rating notification for user {UserId}",
                        recipientUserId);
                }
                else
                {
                    _logger.LogWarning(
                        "Failed to trigger new rating notification for user {UserId}. Status: {Status}",
                        recipientUserId,
                        response.StatusCode);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,
                    "Error triggering new rating notification for user {UserId}",
                    recipientUserId);
            }
        }

        public async Task NotifyBookUpdateAsync(
            Guid authorUserId,
            string bookTitle,
            string bookId,
            string updateType)
        {
            try
            {
                var client = _httpClientFactory.CreateClient("UserService");
                var payload = new
                {
                    authorUserId = authorUserId.ToString(),
                    bookTitle,
                    bookId,
                    updateType
                };

                var content = new StringContent(
                    JsonSerializer.Serialize(payload),
                    Encoding.UTF8,
                    "application/json");

                var response = await client.PostAsync("/api/notifications/trigger/book-update", content);

                if (response.IsSuccessStatusCode)
                {
                    _logger.LogInformation(
                        "Successfully triggered book update notification for author {UserId}",
                        authorUserId);
                }
                else
                {
                    _logger.LogWarning(
                        "Failed to trigger book update notification for author {UserId}. Status: {Status}",
                        authorUserId,
                        response.StatusCode);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,
                    "Error triggering book update notification for author {UserId}",
                    authorUserId);
            }
        }

        public async Task NotifyBookCommentAsync(
            Guid bookCreatorUserId,
            string commenterName,
            string bookTitle,
            string bookId,
            string commentId)
        {
            try
            {
                var client = _httpClientFactory.CreateClient("UserService");
                var payload = new
                {
                    recipientUserId = bookCreatorUserId.ToString(),
                    commenterName,
                    bookTitle,
                    bookId,
                    commentId
                };

                var content = new StringContent(
                    JsonSerializer.Serialize(payload),
                    Encoding.UTF8,
                    "application/json");

                var response = await client.PostAsync("/api/notifications/trigger/book-comment", content);

                if (response.IsSuccessStatusCode)
                {
                    _logger.LogInformation(
                        "Successfully triggered book comment notification for user {UserId}",
                        bookCreatorUserId);
                }
                else
                {
                    _logger.LogWarning(
                        "Failed to trigger book comment notification for user {UserId}. Status: {Status}",
                        bookCreatorUserId,
                        response.StatusCode);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,
                    "Error triggering book comment notification for user {UserId}",
                    bookCreatorUserId);
            }
        }

        public async Task NotifyBookViewAsync(
            Guid bookCreatorUserId,
            string viewerName,
            string bookTitle,
            string bookId)
        {
            try
            {
                var client = _httpClientFactory.CreateClient("UserService");
                var payload = new
                {
                    recipientUserId = bookCreatorUserId.ToString(),
                    viewerName,
                    bookTitle,
                    bookId
                };

                var content = new StringContent(
                    JsonSerializer.Serialize(payload),
                    Encoding.UTF8,
                    "application/json");

                var response = await client.PostAsync("/api/notifications/trigger/book-view", content);

                if (response.IsSuccessStatusCode)
                {
                    _logger.LogInformation(
                        "Successfully triggered book view notification for user {UserId}",
                        bookCreatorUserId);
                }
                else
                {
                    _logger.LogWarning(
                        "Failed to trigger book view notification for user {UserId}. Status: {Status}",
                        bookCreatorUserId,
                        response.StatusCode);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,
                    "Error triggering book view notification for user {UserId}",
                    bookCreatorUserId);
            }
        }

        public async Task NotifyBookAddedToLibraryAsync(
            Guid bookCreatorUserId,
            string userName,
            string bookTitle,
            string bookId)
        {
            try
            {
                var client = _httpClientFactory.CreateClient("UserService");
                var payload = new
                {
                    recipientUserId = bookCreatorUserId.ToString(),
                    userName,
                    bookTitle,
                    bookId
                };

                var content = new StringContent(
                    JsonSerializer.Serialize(payload),
                    Encoding.UTF8,
                    "application/json");

                var response = await client.PostAsync("/api/notifications/trigger/book-added-to-library", content);

                if (response.IsSuccessStatusCode)
                {
                    _logger.LogInformation(
                        "Successfully triggered book added to library notification for user {UserId}",
                        bookCreatorUserId);
                }
                else
                {
                    _logger.LogWarning(
                        "Failed to trigger book added to library notification for user {UserId}. Status: {Status}",
                        bookCreatorUserId,
                        response.StatusCode);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,
                    "Error triggering book added to library notification for user {UserId}",
                    bookCreatorUserId);
            }
        }
    }
}
