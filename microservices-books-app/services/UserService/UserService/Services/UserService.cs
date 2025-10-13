using Microsoft.EntityFrameworkCore;
using UserService.DTOs;
using UserService.Models;

namespace UserService.Services
{
    public interface IUserService
    {
        Task<User?> GetUserByIdAsync(Guid userId);
        Task<User?> GetUserByEmailAsync(string email);
        Task<User> CreateUserAsync(RegisterDto registerDto);
        Task<User> UpdateUserAsync(Guid userId, UserDto userDto);
        Task<bool> DeleteUserAsync(Guid userId);
        Task<bool> ValidatePasswordAsync(string email, string password);
        Task<IEnumerable<User>> GetAllUsersAsync();
        Task<bool> GeneratePasswordResetTokenAsync(string email);
        Task<bool> ResetPasswordAsync(string email, string token, string newPassword);
        Task<bool> ChangePasswordAsync(Guid userId, string currentPassword, string newPassword);
    }

    public class UserService : IUserService
    {
        private readonly Data.UserDbContext _context;
        private readonly ILogger<UserService> _logger;
        private readonly IEmailService _emailService;

        public UserService(Data.UserDbContext context, ILogger<UserService> logger, IEmailService emailService)
        {
            _context = context;
            _logger = logger;
            _emailService = emailService;
        }

        public async Task<User?> GetUserByIdAsync(Guid userId)
        {
            return await _context.Users.FindAsync(userId);
        }

        public async Task<User?> GetUserByEmailAsync(string email)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        }

        public async Task<User> CreateUserAsync(RegisterDto registerDto)
        {
            var existingUser = await GetUserByEmailAsync(registerDto.Email);
            if (existingUser != null)
            {
                throw new InvalidOperationException("User with this email already exists");
            }

            // Check if username is already taken
            var existingUsername = await _context.Users.FirstOrDefaultAsync(u => u.Username == registerDto.Username);
            if (existingUsername != null)
            {
                throw new InvalidOperationException("Username is already taken");
            }

            // Hash the password
            var passwordHash = BCrypt.Net.BCrypt.HashPassword(registerDto.Password);

            var user = new User
            {
                Username = registerDto.Username,
                Email = registerDto.Email,
                FirstName = registerDto.FirstName,
                LastName = registerDto.LastName,
                PasswordHash = passwordHash
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Created new user with ID: {UserId}", user.Id);
            return user;
        }

        public async Task<User> UpdateUserAsync(Guid userId, UserDto userDto)
        {
            var user = await GetUserByIdAsync(userId);
            if (user == null)
            {
                throw new InvalidOperationException("User not found");
            }

            user.FirstName = userDto.FirstName;
            user.LastName = userDto.LastName;
            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Updated user with ID: {UserId}", user.Id);
            return user;
        }

        public async Task<bool> DeleteUserAsync(Guid userId)
        {
            var user = await GetUserByIdAsync(userId);
            if (user == null)
            {
                return false;
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Deleted user with ID: {UserId}", userId);
            return true;
        }

        public async Task<bool> ValidatePasswordAsync(string email, string password)
        {
            var user = await GetUserByEmailAsync(email);
            if (user == null)
            {
                return false;
            }

            return BCrypt.Net.BCrypt.Verify(password, user.PasswordHash);
        }

        public async Task<IEnumerable<User>> GetAllUsersAsync()
        {
            return await _context.Users.ToListAsync();
        }

        public async Task<bool> GeneratePasswordResetTokenAsync(string email)
        {
            var user = await GetUserByEmailAsync(email);
            if (user == null)
            {
                // Don't reveal that user doesn't exist - return true anyway
                _logger.LogWarning("Password reset requested for non-existent email: {Email}", email);
                return true;
            }

            // Generate a secure random token
            var token = Convert.ToBase64String(System.Security.Cryptography.RandomNumberGenerator.GetBytes(32));
            user.PasswordResetToken = token;
            user.PasswordResetTokenExpiry = DateTime.UtcNow.AddHours(1); // Token valid for 1 hour

            await _context.SaveChangesAsync();

            // Send email
            await _emailService.SendPasswordResetEmailAsync(user.Email, token, user.FirstName ?? user.Username);

            _logger.LogInformation("Password reset token generated for user: {UserId}", user.Id);
            return true;
        }

        public async Task<bool> ResetPasswordAsync(string email, string token, string newPassword)
        {
            var user = await GetUserByEmailAsync(email);
            if (user == null)
            {
                _logger.LogWarning("Password reset attempted for non-existent email: {Email}", email);
                return false;
            }

            // Validate token
            if (string.IsNullOrEmpty(user.PasswordResetToken) || 
                user.PasswordResetToken != token || 
                !user.PasswordResetTokenExpiry.HasValue || 
                user.PasswordResetTokenExpiry.Value < DateTime.UtcNow)
            {
                _logger.LogWarning("Invalid or expired password reset token for user: {UserId}", user.Id);
                return false;
            }

            // Hash new password
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
            
            // Clear reset token
            user.PasswordResetToken = null;
            user.PasswordResetTokenExpiry = null;
            
            // Reset failed login attempts
            user.FailedLoginAttempts = 0;
            user.AccountLockedUntil = null;
            
            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            // Send notification email
            await _emailService.SendPasswordChangedNotificationAsync(user.Email, user.FirstName ?? user.Username);

            _logger.LogInformation("Password reset successful for user: {UserId}", user.Id);
            return true;
        }

        public async Task<bool> ChangePasswordAsync(Guid userId, string currentPassword, string newPassword)
        {
            var user = await GetUserByIdAsync(userId);
            if (user == null)
            {
                _logger.LogWarning("Password change attempted for non-existent user: {UserId}", userId);
                return false;
            }

            // Verify current password
            if (!BCrypt.Net.BCrypt.Verify(currentPassword, user.PasswordHash))
            {
                _logger.LogWarning("Password change failed - incorrect current password for user: {UserId}", userId);
                return false;
            }

            // Hash new password
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            // Send notification email
            await _emailService.SendPasswordChangedNotificationAsync(user.Email, user.FirstName ?? user.Username);

            _logger.LogInformation("Password changed successfully for user: {UserId}", userId);
            return true;
        }
    }
}