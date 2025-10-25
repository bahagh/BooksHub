namespace UserService.Services
{
    public interface IEmailService
    {
        Task SendPasswordResetEmailAsync(string toEmail, string resetToken, string userName);
        Task SendEmailVerificationAsync(string toEmail, string verificationToken, string userName);
        Task SendWelcomeEmailAsync(string toEmail, string userName);
        Task SendPasswordChangedNotificationAsync(string toEmail, string userName);
        
        // Notification emails
        Task SendCommentReplyNotificationAsync(string toEmail, string userName, string commenterName, string bookTitle, string bookId, string commentId);
        Task SendNewRatingNotificationAsync(string toEmail, string userName, string raterName, int rating, string bookTitle, string bookId);
        Task SendBookUpdateNotificationAsync(string toEmail, string userName, string bookTitle, string bookId, string updateType);
        Task SendNewFollowerNotificationAsync(string toEmail, string userName, string followerName, string followerId);
    }
}