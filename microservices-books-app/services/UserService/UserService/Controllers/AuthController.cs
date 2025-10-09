using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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

        [HttpPost("register")]
        public async Task<ActionResult<ApiResponse<AuthResponseDto>>> Register([FromBody] RegisterDto registerDto)
        {
            try
            {
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

                var response = ApiResponse<AuthResponseDto>.CreateSuccess(authResponse, "User registered successfully");
                return Ok(response);
            }
            catch (InvalidOperationException ex)
            {
                var errorResponse = ApiResponse<AuthResponseDto>.CreateError(ex.Message);
                return BadRequest(errorResponse);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during user registration");
                var errorResponse = ApiResponse<AuthResponseDto>.CreateError("Internal server error");
                return StatusCode(500, errorResponse);
            }
        }

        [HttpPost("login")]
        public async Task<ActionResult<ApiResponse<AuthResponseDto>>> Login([FromBody] LoginDto loginDto)
        {
            try
            {
                var user = await _userService.GetUserByEmailAsync(loginDto.Email);
                if (user == null)
                {
                    var errorResponse = ApiResponse<AuthResponseDto>.CreateError("Invalid email or password");
                    return BadRequest(errorResponse);
                }

                // Validate password
                var isValidPassword = await _userService.ValidatePasswordAsync(loginDto.Email, loginDto.Password);
                if (!isValidPassword)
                {
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

                var response = ApiResponse<AuthResponseDto>.CreateSuccess(authResponse, "Login successful");
                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during user login");
                var errorResponse = ApiResponse<AuthResponseDto>.CreateError("Internal server error");
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

        [HttpGet("me")]
        [Authorize]
        public async Task<ActionResult<UserDto>> GetCurrentUser()
        {
            try
            {
                var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
                if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
                {
                    return BadRequest(new { message = "Invalid user ID" });
                }

                var user = await _userService.GetUserByIdAsync(userId);
                if (user == null)
                {
                    return NotFound(new { message = "User not found" });
                }

                var response = new UserDto
                {
                    Id = user.Id,
                    Email = user.Email,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    FullName = user.FullName,
                    CreatedAt = user.CreatedAt
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting current user");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }
    }
}