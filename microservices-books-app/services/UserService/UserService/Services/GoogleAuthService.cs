using Google.Apis.Auth;
using Microsoft.EntityFrameworkCore;
using UserService.DTOs;
using UserService.Models;

namespace UserService.Services
{
    public interface IGoogleAuthService
    {
        Task<GoogleJsonWebSignature.Payload?> ValidateGoogleTokenAsync(string idToken);
        Task<User> CreateOrUpdateUserFromGoogleAsync(GoogleJsonWebSignature.Payload payload);
    }

    public class GoogleAuthService : IGoogleAuthService
    {
        private readonly IConfiguration _configuration;
        private readonly Data.UserDbContext _context;
        private readonly ILogger<GoogleAuthService> _logger;

        public GoogleAuthService(
            IConfiguration configuration, 
            Data.UserDbContext context,
            ILogger<GoogleAuthService> logger)
        {
            _configuration = configuration;
            _context = context;
            _logger = logger;
        }

        public async Task<GoogleJsonWebSignature.Payload?> ValidateGoogleTokenAsync(string idToken)
        {
            try
            {
                var clientId = _configuration["Google:ClientId"];
                if (string.IsNullOrEmpty(clientId))
                {
                    _logger.LogError("Google Client ID not configured");
                    return null;
                }

                var payload = await GoogleJsonWebSignature.ValidateAsync(idToken, new GoogleJsonWebSignature.ValidationSettings
                {
                    Audience = new[] { clientId }
                });

                return payload;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to validate Google token");
                return null;
            }
        }

        public async Task<User> CreateOrUpdateUserFromGoogleAsync(GoogleJsonWebSignature.Payload payload)
        {
            var existingUser = await _context.Users
                .FirstOrDefaultAsync(u => u.GoogleId == payload.Subject || u.Email == payload.Email);

            if (existingUser != null)
            {
                // Update existing user
                existingUser.GoogleId = payload.Subject;
                existingUser.Email = payload.Email;
                existingUser.FirstName = payload.GivenName ?? existingUser.FirstName;
                existingUser.LastName = payload.FamilyName ?? existingUser.LastName;
                existingUser.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                return existingUser;
            }

            // Create new user
            var newUser = new User
            {
                Email = payload.Email,
                FirstName = payload.GivenName ?? "Unknown",
                LastName = payload.FamilyName ?? "User",
                GoogleId = payload.Subject
            };

            _context.Users.Add(newUser);
            await _context.SaveChangesAsync();

            return newUser;
        }
    }
}