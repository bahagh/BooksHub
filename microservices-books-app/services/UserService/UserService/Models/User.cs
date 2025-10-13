using System.ComponentModel.DataAnnotations;

namespace UserService.Models
{
    public class User
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [MaxLength(50)]
        public string Username { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [MaxLength(255)]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string LastName { get; set; } = string.Empty;

        [Required]
        [MaxLength(255)]
        public string PasswordHash { get; set; } = string.Empty;

        [MaxLength(255)]
        public string? GoogleId { get; set; }

        // Password Reset
        [MaxLength(500)]
        public string? PasswordResetToken { get; set; }
        public DateTime? PasswordResetTokenExpiry { get; set; }

        // Account Security
        public int FailedLoginAttempts { get; set; } = 0;
        public DateTime? AccountLockedUntil { get; set; }
        public bool IsEmailVerified { get; set; } = false;
        [MaxLength(500)]
        public string? EmailVerificationToken { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public ICollection<UserSession> UserSessions { get; set; } = new List<UserSession>();

        public string FullName => $"{FirstName} {LastName}";

        // Helper methods
        public bool IsAccountLocked() => AccountLockedUntil.HasValue && AccountLockedUntil > DateTime.UtcNow;
        public bool IsPasswordResetTokenValid() => PasswordResetTokenExpiry.HasValue && PasswordResetTokenExpiry > DateTime.UtcNow;
    }
}