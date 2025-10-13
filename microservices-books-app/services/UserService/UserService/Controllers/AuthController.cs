using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using UserService.DTOs;
using UserService.Services;

namespace UserService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly IJwtService _jwtService;
        private readonly IGoogleAuthService _googleAuthService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(
            IUserService userService,
            IJwtService jwtService,
            IGoogleAuthService googleAuthService,
            ILogger<AuthController> logger)
        {
            _userService = userService;
            _jwtService = jwtService;
            _googleAuthService = googleAuthService;
            _logger = logger;
        }

        [HttpGet("health")]
        public IActionResult Health()
        {
            return Ok(new { status = "healthy", service = "UserService", timestamp = DateTime.UtcNow });
        }

        [HttpGet("me")]
        [Authorize]
        public async Task<ActionResult<ApiResponse<UserDto>>> GetCurrentUser()
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
                {
                    var errorResponse = ApiResponse<UserDto>.CreateError("Invalid user token");
                    return Unauthorized(errorResponse);
                }

                var user = await _userService.GetUserByIdAsync(userId);
                if (user == null)
                {
                    var errorResponse = ApiResponse<UserDto>.CreateError("User not found");
                    return NotFound(errorResponse);
                }

                var userDto = new UserDto
                {
                    Id = user.Id,
                    Username = user.Username,
                    Email = user.Email,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    FullName = user.FullName,
                    CreatedAt = user.CreatedAt,
                    UpdatedAt = user.UpdatedAt
                };

                var response = ApiResponse<UserDto>.CreateSuccess(userDto, "User retrieved successfully");
                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting current user");
                var errorResponse = ApiResponse<UserDto>.CreateError("Failed to retrieve user information");
                return StatusCode(500, errorResponse);
            }
        }

        [HttpPost("register")]
        public async Task<ActionResult<ApiResponse<AuthResponseDto>>> Register([FromBody] RegisterDto registerDto)
        {
            try
            {
                // Input validation
                if (registerDto == null)
                {
                    _logger.LogError("Registration failed: No data provided");
                    var errorResponse = ApiResponse<AuthResponseDto>.CreateError("Registration data is required");
                    return BadRequest(errorResponse);
                }

                if (string.IsNullOrWhiteSpace(registerDto.Email))
                {
                    _logger.LogError("Registration failed: Email is required");
                    var errorResponse = ApiResponse<AuthResponseDto>.CreateError("Email is required");
                    return BadRequest(errorResponse);
                }

                if (string.IsNullOrWhiteSpace(registerDto.Password))
                {
                    _logger.LogError("Registration failed: Password is required");
                    var errorResponse = ApiResponse<AuthResponseDto>.CreateError("Password is required");
                    return BadRequest(errorResponse);
                }

                if (string.IsNullOrWhiteSpace(registerDto.Username))
                {
                    _logger.LogError("Registration failed: Username is required");
                    var errorResponse = ApiResponse<AuthResponseDto>.CreateError("Username is required");
                    return BadRequest(errorResponse);
                }

                // Validate email format
                if (!IsValidEmail(registerDto.Email))
                {
                    _logger.LogError("Registration failed: Invalid email format {Email}", registerDto.Email);
                    var errorResponse = ApiResponse<AuthResponseDto>.CreateError("Please provide a valid email address");
                    return BadRequest(errorResponse);
                }

                // Validate password strength
                if (registerDto.Password.Length < 8)
                {
                    _logger.LogError("Registration failed: Password too short");
                    var errorResponse = ApiResponse<AuthResponseDto>.CreateError("Password must be at least 8 characters long");
                    return BadRequest(errorResponse);
                }

                _logger.LogInformation("Attempting to register user with email: {Email}", registerDto.Email);

                // Check if user already exists
                var existingUser = await _userService.GetUserByEmailAsync(registerDto.Email);
                if (existingUser != null)
                {
                    _logger.LogError("Registration failed: Email already exists {Email}", registerDto.Email);
                    var errorResponse = ApiResponse<AuthResponseDto>.CreateError("An account with this email already exists");
                    return BadRequest(errorResponse);
                }

                var user = await _userService.CreateUserAsync(registerDto);
                var accessToken = _jwtService.GenerateAccessToken(user);
                var refreshToken = await _jwtService.CreateRefreshTokenAsync(user.Id);

                var authResponse = new AuthResponseDto
                {
                    Token = accessToken,
                    RefreshToken = refreshToken,
                    User = new UserDto
                    {
                        Id = user.Id,
                        Username = user.Username,
                        Email = user.Email,
                        FirstName = user.FirstName,
                        LastName = user.LastName,
                        FullName = user.FullName,
                        CreatedAt = user.CreatedAt,
                        UpdatedAt = user.UpdatedAt
                    },
                    ExpiresAt = DateTime.UtcNow.AddMinutes(15)
                };

                _logger.LogInformation("Successfully registered user with ID: {UserId}", user.Id);

                var response = ApiResponse<AuthResponseDto>.CreateSuccess(authResponse, "User registered successfully");
                return Ok(response);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogError(ex, "Registration failed: Invalid operation");
                var errorResponse = ApiResponse<AuthResponseDto>.CreateError(ex.Message);
                return BadRequest(errorResponse);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Registration failed: Unexpected error");
                var errorResponse = ApiResponse<AuthResponseDto>.CreateError("Registration failed. Please try again later.");
                return StatusCode(500, errorResponse);
            }
        }

        private bool IsValidEmail(string email)
        {
            try
            {
                var addr = new System.Net.Mail.MailAddress(email);
                return addr.Address == email;
            }
            catch
            {
                return false;
            }
        }

        [HttpPost("login")]
        public async Task<ActionResult<ApiResponse<AuthResponseDto>>> Login([FromBody] LoginDto loginDto)
        {
            try
            {
                // Input validation
                if (loginDto == null)
                {
                    _logger.LogError("Login failed: No data provided");
                    var errorResponse = ApiResponse<AuthResponseDto>.CreateError("Login data is required");
                    return BadRequest(errorResponse);
                }

                if (string.IsNullOrWhiteSpace(loginDto.Email))
                {
                    _logger.LogError("Login failed: Email is required");
                    var errorResponse = ApiResponse<AuthResponseDto>.CreateError("Email is required");
                    return BadRequest(errorResponse);
                }

                if (string.IsNullOrWhiteSpace(loginDto.Password))
                {
                    _logger.LogError("Login failed: Password is required");
                    var errorResponse = ApiResponse<AuthResponseDto>.CreateError("Password is required");
                    return BadRequest(errorResponse);
                }

                // Validate email format
                if (!IsValidEmail(loginDto.Email))
                {
                    _logger.LogError("Login failed: Invalid email format {Email}", loginDto.Email);
                    var errorResponse = ApiResponse<AuthResponseDto>.CreateError("Please provide a valid email address");
                    return BadRequest(errorResponse);
                }

                _logger.LogInformation("Login attempt for email: {Email}", loginDto.Email);

                var user = await _userService.GetUserByEmailAsync(loginDto.Email);
                if (user == null)
                {
                    _logger.LogError("Login failed: User not found {Email}", loginDto.Email);
                    var errorResponse = ApiResponse<AuthResponseDto>.CreateError("Invalid email or password");
                    return BadRequest(errorResponse);
                }

                // Validate password
                var isValidPassword = await _userService.ValidatePasswordAsync(loginDto.Email, loginDto.Password);
                if (!isValidPassword)
                {
                    _logger.LogError("Login failed: Invalid password for user {Email}", loginDto.Email);
                    var errorResponse = ApiResponse<AuthResponseDto>.CreateError("Invalid email or password");
                    return BadRequest(errorResponse);
                }

                var accessToken = _jwtService.GenerateAccessToken(user);
                var refreshToken = await _jwtService.CreateRefreshTokenAsync(user.Id);

                var authResponse = new AuthResponseDto
                {
                    Token = accessToken,
                    RefreshToken = refreshToken,
                    User = new UserDto
                    {
                        Id = user.Id,
                        Username = user.Username,
                        Email = user.Email,
                        FirstName = user.FirstName,
                        LastName = user.LastName,
                        FullName = user.FullName,
                        CreatedAt = user.CreatedAt,
                        UpdatedAt = user.UpdatedAt
                    },
                    ExpiresAt = DateTime.UtcNow.AddMinutes(15)
                };

                _logger.LogInformation("Login successful for user: {Email}", loginDto.Email);

                var response = ApiResponse<AuthResponseDto>.CreateSuccess(authResponse, "Login successful");
                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Login failed: Unexpected error");
                var errorResponse = ApiResponse<AuthResponseDto>.CreateError("Login failed. Please try again later.");
                return StatusCode(500, errorResponse);
            }
        }

        [HttpPost("google")]
        public async Task<ActionResult<AuthResponseDto>> GoogleAuth([FromBody] GoogleAuthDto googleAuthDto)
        {
            try
            {
                var payload = await _googleAuthService.ValidateGoogleTokenAsync(googleAuthDto.IdToken);
                if (payload == null)
                {
                    return BadRequest(new { message = "Invalid Google token" });
                }

                var user = await _googleAuthService.CreateOrUpdateUserFromGoogleAsync(payload);
                var accessToken = _jwtService.GenerateAccessToken(user);
                var refreshToken = await _jwtService.CreateRefreshTokenAsync(user.Id);

                var response = new AuthResponseDto
                {
                    Token = accessToken,
                    RefreshToken = refreshToken,
                    User = new UserDto
                    {
                        Id = user.Id,
                        Username = user.Username,
                        Email = user.Email,
                        FirstName = user.FirstName,
                        LastName = user.LastName,
                        FullName = user.FullName,
                        CreatedAt = user.CreatedAt,
                        UpdatedAt = user.UpdatedAt
                    },
                    ExpiresAt = DateTime.UtcNow.AddMinutes(15)
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during Google authentication");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        [HttpPost("refresh")]
        public async Task<ActionResult<AuthResponseDto>> RefreshToken([FromBody] RefreshTokenDto refreshTokenDto)
        {
            try
            {
                var session = await _jwtService.ValidateRefreshTokenAsync(refreshTokenDto.RefreshToken);
                if (session == null)
                {
                    return BadRequest(new { message = "Invalid refresh token" });
                }

                var user = await _userService.GetUserByIdAsync(session.UserId);
                if (user == null)
                {
                    return BadRequest(new { message = "User not found" });
                }

                // Revoke old refresh token
                await _jwtService.RevokeRefreshTokenAsync(refreshTokenDto.RefreshToken);

                // Generate new tokens
                var accessToken = _jwtService.GenerateAccessToken(user);
                var newRefreshToken = await _jwtService.CreateRefreshTokenAsync(user.Id);

                var response = new AuthResponseDto
                {
                    Token = accessToken,
                    RefreshToken = newRefreshToken,
                    User = new UserDto
                    {
                        Id = user.Id,
                        Username = user.Username,
                        Email = user.Email,
                        FirstName = user.FirstName,
                        LastName = user.LastName,
                        FullName = user.FullName,
                        CreatedAt = user.CreatedAt,
                        UpdatedAt = user.UpdatedAt
                    },
                    ExpiresAt = DateTime.UtcNow.AddMinutes(15)
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during token refresh");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        [HttpPost("logout")]
        [Authorize]
        public async Task<ActionResult> Logout([FromBody] RefreshTokenDto refreshTokenDto)
        {
            try
            {
                await _jwtService.RevokeRefreshTokenAsync(refreshTokenDto.RefreshToken);
                return Ok(new { message = "Logged out successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during logout");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        [HttpPost("forgot-password")]
        public async Task<ActionResult<ApiResponse<object>>> ForgotPassword([FromBody] ForgotPasswordDto forgotPasswordDto)
        {
            try
            {
                if (forgotPasswordDto == null || string.IsNullOrWhiteSpace(forgotPasswordDto.Email))
                {
                    var errorResponse = ApiResponse<object>.CreateError("Email is required");
                    return BadRequest(errorResponse);
                }

                var result = await _userService.GeneratePasswordResetTokenAsync(forgotPasswordDto.Email);
                
                if (!result)
                {
                    // Don't reveal whether user exists - always return success
                    var response = ApiResponse<object>.CreateSuccess(
                        new { message = "If an account exists with this email, a password reset link has been sent." },
                        "Password reset initiated"
                    );
                    return Ok(response);
                }

                var successResponse = ApiResponse<object>.CreateSuccess(
                    new { message = "If an account exists with this email, a password reset link has been sent." },
                    "Password reset initiated"
                );
                return Ok(successResponse);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during password reset request");
                var errorResponse = ApiResponse<object>.CreateError("Failed to process password reset request");
                return StatusCode(500, errorResponse);
            }
        }

        [HttpPost("reset-password")]
        public async Task<ActionResult<ApiResponse<object>>> ResetPassword([FromBody] ResetPasswordDto resetPasswordDto)
        {
            try
            {
                if (resetPasswordDto == null)
                {
                    var errorResponse = ApiResponse<object>.CreateError("Invalid request data");
                    return BadRequest(errorResponse);
                }

                var result = await _userService.ResetPasswordAsync(
                    resetPasswordDto.Email,
                    resetPasswordDto.Token,
                    resetPasswordDto.NewPassword
                );

                if (!result)
                {
                    var errorResponse = ApiResponse<object>.CreateError("Invalid or expired reset token");
                    return BadRequest(errorResponse);
                }

                var response = ApiResponse<object>.CreateSuccess(
                    new { message = "Password has been reset successfully" },
                    "Password reset successful"
                );
                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during password reset");
                var errorResponse = ApiResponse<object>.CreateError("Failed to reset password");
                return StatusCode(500, errorResponse);
            }
        }

        [HttpPost("change-password")]
        [Authorize]
        public async Task<ActionResult<ApiResponse<object>>> ChangePassword([FromBody] ChangePasswordDto changePasswordDto)
        {
            try
            {
                if (changePasswordDto == null)
                {
                    var errorResponse = ApiResponse<object>.CreateError("Invalid request data");
                    return BadRequest(errorResponse);
                }

                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
                {
                    var errorResponse = ApiResponse<object>.CreateError("Invalid user token");
                    return Unauthorized(errorResponse);
                }

                var result = await _userService.ChangePasswordAsync(
                    userId,
                    changePasswordDto.CurrentPassword,
                    changePasswordDto.NewPassword
                );

                if (!result)
                {
                    var errorResponse = ApiResponse<object>.CreateError("Current password is incorrect");
                    return BadRequest(errorResponse);
                }

                var response = ApiResponse<object>.CreateSuccess(
                    new { message = "Password changed successfully" },
                    "Password change successful"
                );
                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during password change");
                var errorResponse = ApiResponse<object>.CreateError("Failed to change password");
                return StatusCode(500, errorResponse);
            }
        }
    }
}