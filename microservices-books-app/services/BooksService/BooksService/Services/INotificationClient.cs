namespace BooksService.Services
{
    public interface INotificationClient
    {
        Task NotifyCommentReplyAsync(Guid recipientUserId, string commenterName, string bookTitle, string bookId, string commentId);
        Task NotifyNewRatingAsync(Guid recipientUserId, string raterName, int rating, string bookTitle, string bookId);
        Task NotifyBookUpdateAsync(Guid authorUserId, string bookTitle, string bookId, string updateType);
        Task NotifyBookCommentAsync(Guid bookCreatorUserId, string commenterName, string bookTitle, string bookId, string commentId);
        Task NotifyBookViewAsync(Guid bookCreatorUserId, string viewerName, string bookTitle, string bookId);
        Task NotifyBookAddedToLibraryAsync(Guid bookCreatorUserId, string userName, string bookTitle, string bookId);
    }
}
