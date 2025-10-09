using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using UserService.Models;

namespace UserService.Services
{
    public interface IJwtService
    {
        string GenerateAccessToken(User user);
        string GenerateRefreshToken();
        ClaimsPrincipal? ValidateAccessToken(string token);
        Task<UserSession?> ValidateRefreshTokenAsync(string refreshToken);
        Task<string> CreateRefreshTokenAsync(Guid userId);
        Task RevokeRefreshTokenAsync(string refreshToken);
    }

    public class JwtService : IJwtService
    {
        private readonly IConfiguration _configuration;
        private readonly Data.UserDbContext _context;

        public JwtService(IConfiguration configuration, Data.UserDbContext context)
        {
            _configuration = configuration;
            _context = context;
        }

        public string GenerateAccessToken(User user)
        {
            var jwtKey = _configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key not configured");
            var jwtIssuer = _configuration["Jwt:Issuer"] ?? throw new InvalidOperationException("JWT Issuer not configured");
            var jwtAudience = _configuration["Jwt:Audience"] ?? throw new InvalidOperationException("JWT Audience not configured");

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, user.FullName),
                new Claim("firstName", user.FirstName),
                new Claim("lastName", user.LastName),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(JwtRegisteredClaimNames.Iat, new DateTimeOffset(DateTime.UtcNow).ToUnixTimeSeconds().ToString(), ClaimValueTypes.Integer64)
            };

            var token = new JwtSecurityToken(
                issuer: jwtIssuer,
                audience: jwtAudience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(15), // Short-lived access token
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public string GenerateRefreshToken()
        {
            return Convert.ToBase64String(Guid.NewGuid().ToByteArray()) + Convert.ToBase64String(Guid.NewGuid().ToByteArray());
        }

        public ClaimsPrincipal? ValidateAccessToken(string token)
        {
            try
            {
                var jwtKey = _configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key not configured");
                var jwtIssuer = _configuration["Jwt:Issuer"] ?? throw new InvalidOperationException("JWT Issuer not configured");
                var jwtAudience = _configuration["Jwt:Audience"] ?? throw new InvalidOperationException("JWT Audience not configured");

                var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
                
                var tokenHandler = new JwtSecurityTokenHandler();
                var validationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = key,
                    ValidateIssuer = true,
                    ValidIssuer = jwtIssuer,
                    ValidateAudience = true,
                    ValidAudience = jwtAudience,
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                };

                var principal = tokenHandler.ValidateToken(token, validationParameters, out SecurityToken validatedToken);
                return principal;
            }
            catch
            {
                return null;
            }
        }

        public async Task<UserSession?> ValidateRefreshTokenAsync(string refreshToken)
        {
            var session = await _context.UserSessions
                .FirstOrDefaultAsync(s => s.RefreshToken == refreshToken && !s.IsExpired);
            
            return session;
        }

        public async Task<string> CreateRefreshTokenAsync(Guid userId)
        {
            var refreshToken = GenerateRefreshToken();
            
            var session = new UserSession
            {
                UserId = userId,
                RefreshToken = refreshToken,
                ExpiresAt = DateTime.UtcNow.AddDays(30) // Long-lived refresh token
            };

            _context.UserSessions.Add(session);
            await _context.SaveChangesAsync();

            return refreshToken;
        }

        public async Task RevokeRefreshTokenAsync(string refreshToken)
        {
            var session = await _context.UserSessions
                .FirstOrDefaultAsync(s => s.RefreshToken == refreshToken);
            
            if (session != null)
            {
                _context.UserSessions.Remove(session);
                await _context.SaveChangesAsync();
            }
        }
    }
}