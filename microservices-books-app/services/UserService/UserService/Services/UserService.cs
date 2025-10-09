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
    }

    public class UserService : IUserService
    {
        private readonly Data.UserDbContext _context;
        private readonly ILogger<UserService> _logger;

        public UserService(Data.UserDbContext context, ILogger<UserService> logger)
        {
            _context = context;
            _logger = logger;
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
    }
}