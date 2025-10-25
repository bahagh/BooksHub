using System.Net;
using System.Net.Mail;

namespace UserService.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        public async Task SendPasswordResetEmailAsync(string toEmail, string resetToken, string userName)
        {
            var subject = "Password Reset Request - Books App";
            var resetLink = $"{_configuration["App:FrontendUrl"]}/reset-password?token={resetToken}&email={Uri.EscapeDataString(toEmail)}";
            
            var body = $@"
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: #1976d2; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }}
        .content {{ background: #f9f9f9; padding: 30px; border: 1px solid #ddd; border-top: none; }}
        .button {{ display: inline-block; padding: 12px 30px; background: #1976d2; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
        .footer {{ text-align: center; margin-top: 20px; color: #666; font-size: 12px; }}
        .warning {{ background: #fff3cd; border: 1px solid #ffc107; padding: 10px; margin: 15px 0; border-radius: 5px; }}
    </style>
</head>
<body>
    <div class=""container"">
        <div class=""header"">
            <h1>📚 Books App</h1>
        </div>
        <div class=""content"">
            <h2>Password Reset Request</h2>
            <p>Hi {userName},</p>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            <div style=""text-align: center;"">
                <a href=""{resetLink}"" class=""button"">Reset Password</a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p style=""word-break: break-all; color: #666;"">{resetLink}</p>
            <div class=""warning"">
                <strong>⚠️ Security Note:</strong>
                <ul>
                    <li>This link will expire in 1 hour</li>
                    <li>If you didn't request this, please ignore this email</li>
                    <li>Never share this link with anyone</li>
                </ul>
            </div>
            <p>If you have any questions, please contact our support team.</p>
            <p>Best regards,<br><strong>Books App Team</strong></p>
        </div>
        <div class=""footer"">
            <p>© 2025 Books App. All rights reserved.</p>
            <p>This is an automated email. Please do not reply.</p>
        </div>
    </div>
</body>
</html>";

            await SendEmailAsync(toEmail, subject, body);
        }

        public async Task SendEmailVerificationAsync(string toEmail, string verificationToken, string userName)
        {
            var subject = "Verify Your Email - Books App";
            var verificationLink = $"{_configuration["App:FrontendUrl"]}/verify-email?token={verificationToken}";
            
            var body = $@"
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: #1976d2; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }}
        .content {{ background: #f9f9f9; padding: 30px; border: 1px solid #ddd; border-top: none; }}
        .button {{ display: inline-block; padding: 12px 30px; background: #4caf50; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
        .footer {{ text-align: center; margin-top: 20px; color: #666; font-size: 12px; }}
    </style>
</head>
<body>
    <div class=""container"">
        <div class=""header"">
            <h1>📚 Books App</h1>
        </div>
        <div class=""content"">
            <h2>Welcome to Books App!</h2>
            <p>Hi {userName},</p>
            <p>Thank you for registering! Please verify your email address to activate your account:</p>
            <div style=""text-align: center;"">
                <a href=""{verificationLink}"" class=""button"">Verify Email</a>
            </div>
            <p>Best regards,<br><strong>Books App Team</strong></p>
        </div>
        <div class=""footer"">
            <p>© 2025 Books App. All rights reserved.</p>
        </div>
    </div>
</body>
</html>";

            await SendEmailAsync(toEmail, subject, body);
        }

        public async Task SendWelcomeEmailAsync(string toEmail, string userName)
        {
            var subject = "Welcome to Books App!";
            var body = $@"
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: #1976d2; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }}
        .content {{ background: #f9f9f9; padding: 30px; border: 1px solid #ddd; border-top: none; }}
        .footer {{ text-align: center; margin-top: 20px; color: #666; font-size: 12px; }}
    </style>
</head>
<body>
    <div class=""container"">
        <div class=""header"">
            <h1>📚 Books App</h1>
        </div>
        <div class=""content"">
            <h2>Welcome Aboard!</h2>
            <p>Hi {userName},</p>
            <p>Your account has been successfully created. You can now:</p>
            <ul>
                <li>Create and publish your own books</li>
                <li>Read books from other authors</li>
                <li>Rate and comment on books</li>
                <li>Build your personal library</li>
            </ul>
            <p>Happy reading and writing!</p>
            <p>Best regards,<br><strong>Books App Team</strong></p>
        </div>
        <div class=""footer"">
            <p>© 2025 Books App. All rights reserved.</p>
        </div>
    </div>
</body>
</html>";

            await SendEmailAsync(toEmail, subject, body);
        }

        public async Task SendPasswordChangedNotificationAsync(string toEmail, string userName)
        {
            var subject = "Password Changed - Books App";
            var body = $@"
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: #1976d2; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }}
        .content {{ background: #f9f9f9; padding: 30px; border: 1px solid #ddd; border-top: none; }}
        .footer {{ text-align: center; margin-top: 20px; color: #666; font-size: 12px; }}
        .alert {{ background: #fff3cd; border: 1px solid #ffc107; padding: 15px; margin: 15px 0; border-radius: 5px; }}
    </style>
</head>
<body>
    <div class=""container"">
        <div class=""header"">
            <h1>📚 Books App</h1>
        </div>
        <div class=""content"">
            <h2>Password Changed Successfully</h2>
            <p>Hi {userName},</p>
            <p>This is a confirmation that your password has been changed successfully.</p>
            <div class=""alert"">
                <strong>⚠️ Important:</strong> If you didn't make this change, please contact our support team immediately and consider changing your password again.
            </div>
            <p>Changed on: {DateTime.UtcNow:f} UTC</p>
            <p>Best regards,<br><strong>Books App Team</strong></p>
        </div>
        <div class=""footer"">
            <p>© 2025 Books App. All rights reserved.</p>
        </div>
    </div>
</body>
</html>";

            await SendEmailAsync(toEmail, subject, body);
        }

        public async Task SendCommentReplyNotificationAsync(string toEmail, string userName, string commenterName, string bookTitle, string bookId, string commentId)
        {
            var subject = "New Reply to Your Comment - Books App";
            var commentLink = $"https://booksapp.com/books/{bookId}?comment={commentId}";
            var body = $@"
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: #1976d2; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }}
        .content {{ background: #f9f9f9; padding: 30px; border: 1px solid #ddd; border-top: none; }}
        .button {{ display: inline-block; padding: 12px 24px; background: #1976d2; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
        .footer {{ text-align: center; margin-top: 20px; color: #666; font-size: 12px; }}
    </style>
</head>
<body>
    <div class=""container"">
        <div class=""header"">
            <h1>📚 Books App</h1>
        </div>
        <div class=""content"">
            <h2>💬 New Reply to Your Comment</h2>
            <p>Hi {userName},</p>
            <p><strong>{commenterName}</strong> replied to your comment on <strong>{bookTitle}</strong>.</p>
            <a href=""{commentLink}"" class=""button"">View Reply</a>
            <p>Best regards,<br><strong>Books App Team</strong></p>
        </div>
        <div class=""footer"">
            <p>© 2025 Books App. All rights reserved.</p>
            <p><a href=""https://booksapp.com/settings"">Manage notification preferences</a></p>
        </div>
    </div>
</body>
</html>";

            await SendEmailAsync(toEmail, subject, body);
        }

        public async Task SendNewRatingNotificationAsync(string toEmail, string userName, string raterName, int rating, string bookTitle, string bookId)
        {
            var subject = "New Rating on Your Book - Books App";
            var bookLink = $"https://booksapp.com/books/{bookId}";
            var stars = string.Join("", Enumerable.Repeat("⭐", rating));
            var body = $@"
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: #1976d2; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }}
        .content {{ background: #f9f9f9; padding: 30px; border: 1px solid #ddd; border-top: none; }}
        .rating {{ font-size: 24px; color: #ffc107; margin: 10px 0; }}
        .button {{ display: inline-block; padding: 12px 24px; background: #1976d2; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
        .footer {{ text-align: center; margin-top: 20px; color: #666; font-size: 12px; }}
    </style>
</head>
<body>
    <div class=""container"">
        <div class=""header"">
            <h1>📚 Books App</h1>
        </div>
        <div class=""content"">
            <h2>⭐ New Rating on Your Book</h2>
            <p>Hi {userName},</p>
            <p><strong>{raterName}</strong> rated your book <strong>{bookTitle}</strong>:</p>
            <div class=""rating"">{stars} ({rating}/5)</div>
            <a href=""{bookLink}"" class=""button"">View Book</a>
            <p>Best regards,<br><strong>Books App Team</strong></p>
        </div>
        <div class=""footer"">
            <p>© 2025 Books App. All rights reserved.</p>
            <p><a href=""https://booksapp.com/settings"">Manage notification preferences</a></p>
        </div>
    </div>
</body>
</html>";

            await SendEmailAsync(toEmail, subject, body);
        }

        public async Task SendBookUpdateNotificationAsync(string toEmail, string userName, string bookTitle, string bookId, string updateType)
        {
            var subject = "Book Update - Books App";
            var bookLink = $"https://booksapp.com/books/{bookId}";
            var body = $@"
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: #1976d2; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }}
        .content {{ background: #f9f9f9; padding: 30px; border: 1px solid #ddd; border-top: none; }}
        .button {{ display: inline-block; padding: 12px 24px; background: #1976d2; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
        .footer {{ text-align: center; margin-top: 20px; color: #666; font-size: 12px; }}
    </style>
</head>
<body>
    <div class=""container"">
        <div class=""header"">
            <h1>📚 Books App</h1>
        </div>
        <div class=""content"">
            <h2>📖 Book Update</h2>
            <p>Hi {userName},</p>
            <p>The book <strong>{bookTitle}</strong> has been <strong>{updateType}</strong>.</p>
            <a href=""{bookLink}"" class=""button"">View Book</a>
            <p>Best regards,<br><strong>Books App Team</strong></p>
        </div>
        <div class=""footer"">
            <p>© 2025 Books App. All rights reserved.</p>
            <p><a href=""https://booksapp.com/settings"">Manage notification preferences</a></p>
        </div>
    </div>
</body>
</html>";

            await SendEmailAsync(toEmail, subject, body);
        }

        public async Task SendNewFollowerNotificationAsync(string toEmail, string userName, string followerName, string followerId)
        {
            var subject = "New Follower - Books App";
            var profileLink = $"https://booksapp.com/profile/{followerId}";
            var body = $@"
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: #1976d2; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }}
        .content {{ background: #f9f9f9; padding: 30px; border: 1px solid #ddd; border-top: none; }}
        .button {{ display: inline-block; padding: 12px 24px; background: #1976d2; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
        .footer {{ text-align: center; margin-top: 20px; color: #666; font-size: 12px; }}
    </style>
</head>
<body>
    <div class=""container"">
        <div class=""header"">
            <h1>📚 Books App</h1>
        </div>
        <div class=""content"">
            <h2>👤 New Follower</h2>
            <p>Hi {userName},</p>
            <p><strong>{followerName}</strong> started following you!</p>
            <a href=""{profileLink}"" class=""button"">View Profile</a>
            <p>Best regards,<br><strong>Books App Team</strong></p>
        </div>
        <div class=""footer"">
            <p>© 2025 Books App. All rights reserved.</p>
            <p><a href=""https://booksapp.com/settings"">Manage notification preferences</a></p>
        </div>
    </div>
</body>
</html>";

            await SendEmailAsync(toEmail, subject, body);
        }

        private async Task SendEmailAsync(string toEmail, string subject, string htmlBody)
        {
            try
            {
                // Check if email is configured
                var smtpHost = _configuration["Email:SmtpHost"];
                var smtpPort = _configuration.GetValue<int>("Email:SmtpPort", 587);
                var smtpUser = _configuration["Email:SmtpUser"];
                var smtpPassword = _configuration["Email:SmtpPassword"];
                var fromEmail = _configuration["Email:FromEmail"] ?? "noreply@booksapp.com";
                var fromName = _configuration["Email:FromName"] ?? "Books App";

                // If email is not configured, just log it (for development)
                if (string.IsNullOrEmpty(smtpHost))
                {
                    _logger.LogWarning("Email service not configured. Email would have been sent to: {Email}", toEmail);
                    _logger.LogInformation("Subject: {Subject}", subject);
                    _logger.LogInformation("Body preview: {Body}", htmlBody.Substring(0, Math.Min(200, htmlBody.Length)));
                    return;
                }

                using var message = new MailMessage();
                message.From = new MailAddress(fromEmail, fromName);
                message.To.Add(new MailAddress(toEmail));
                message.Subject = subject;
                message.Body = htmlBody;
                message.IsBodyHtml = true;

                using var smtpClient = new SmtpClient(smtpHost, smtpPort);
                smtpClient.EnableSsl = true;
                smtpClient.Credentials = new NetworkCredential(smtpUser, smtpPassword);

                await smtpClient.SendMailAsync(message);
                _logger.LogInformation("Email sent successfully to: {Email}", toEmail);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send email to: {Email}", toEmail);
                // Don't throw - email failure shouldn't break the application
            }
        }
    }
}