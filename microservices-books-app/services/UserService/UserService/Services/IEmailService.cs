namespace UserService.Services
{
    public interface IEmailService
    {
        Task SendPasswordResetEmailAsync(string toEmail, string resetToken, string userName);
        Task SendEmailVerificationAsync(string toEmail, string verificationToken, string userName);
        Task SendWelcomeEmailAsync(string toEmail, string userName);
        Task SendPasswordChangedNotificationAsync(string toEmail, string userName);
    }
}