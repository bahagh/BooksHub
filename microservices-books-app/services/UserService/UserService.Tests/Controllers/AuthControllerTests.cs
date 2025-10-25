using Xunit;
using Moq;
using UserService.Services;
using UserService.Controllers;
using UserService.DTOs;
using UserService.Models;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace UserService.Tests.Controllers
{
    public class AuthControllerTests
    {
        private readonly Mock<IUserService> _mockUserService;
        private readonly Mock<IJwtService> _mockJwtService;
        private readonly AuthController _controller;

        public AuthControllerTests()
        {
            _mockUserService = new Mock<IUserService>();
            _mockJwtService = new Mock<IJwtService>();
            _controller = new AuthController(_mockUserService.Object, _mockJwtService.Object);
        }

        [Fact]
        public async Task Register_ShouldReturnOk_WhenValidData()
        {
            // Arrange
            var registerDto = new RegisterDto
            {
                Username = "testuser",
                Email = "test@example.com",
                Password = "Password123!",
                FirstName = "Test",
                LastName = "User"
            };

            var createdUser = new User
            {
                Id = System.Guid.NewGuid(),
                Username = registerDto.Username,
                Email = registerDto.Email,
                FirstName = registerDto.FirstName,
                LastName = registerDto.LastName
            };

            _mockUserService.Setup(s => s.GetUserByEmailAsync(registerDto.Email))
                .ReturnsAsync((User)null);
            
            _mockUserService.Setup(s => s.CreateUserAsync(It.IsAny<User>()))
                .ReturnsAsync(createdUser);

            _mockJwtService.Setup(s => s.GenerateToken(It.IsAny<User>()))
                .Returns("fake-jwt-token");

            // Act
            var result = await _controller.Register(registerDto);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = okResult.Value;
            Assert.NotNull(response);
        }

        [Fact]
        public async Task Register_ShouldReturnBadRequest_WhenEmailAlreadyExists()
        {
            // Arrange
            var registerDto = new RegisterDto
            {
                Username = "testuser",
                Email = "test@example.com",
                Password = "Password123!",
                FirstName = "Test",
                LastName = "User"
            };

            var existingUser = new User { Email = registerDto.Email };
            _mockUserService.Setup(s => s.GetUserByEmailAsync(registerDto.Email))
                .ReturnsAsync(existingUser);

            // Act
            var result = await _controller.Register(registerDto);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.NotNull(badRequestResult.Value);
        }

        [Fact]
        public async Task Login_ShouldReturnOk_WhenCredentialsAreValid()
        {
            // Arrange
            var loginDto = new LoginDto
            {
                Email = "test@example.com",
                Password = "Password123!"
            };

            var user = new User
            {
                Id = System.Guid.NewGuid(),
                Email = loginDto.Email,
                Username = "testuser"
            };

            _mockUserService.Setup(s => s.ValidatePasswordAsync(loginDto.Email, loginDto.Password))
                .ReturnsAsync(true);

            _mockUserService.Setup(s => s.GetUserByEmailAsync(loginDto.Email))
                .ReturnsAsync(user);

            _mockJwtService.Setup(s => s.GenerateToken(user))
                .Returns("fake-jwt-token");

            // Act
            var result = await _controller.Login(loginDto);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.NotNull(okResult.Value);
        }

        [Fact]
        public async Task Login_ShouldReturnUnauthorized_WhenCredentialsAreInvalid()
        {
            // Arrange
            var loginDto = new LoginDto
            {
                Email = "test@example.com",
                Password = "WrongPassword"
            };

            _mockUserService.Setup(s => s.ValidatePasswordAsync(loginDto.Email, loginDto.Password))
                .ReturnsAsync(false);

            // Act
            var result = await _controller.Login(loginDto);

            // Assert
            var unauthorizedResult = Assert.IsType<UnauthorizedObjectResult>(result);
            Assert.NotNull(unauthorizedResult.Value);
        }

        [Fact]
        public async Task GoogleLogin_ShouldReturnOk_WhenValidGoogleToken()
        {
            // Arrange
            var googleLoginDto = new GoogleLoginDto
            {
                IdToken = "valid-google-token"
            };

            var user = new User
            {
                Id = System.Guid.NewGuid(),
                Email = "test@example.com",
                Username = "testuser"
            };

            _mockUserService.Setup(s => s.GetUserByEmailAsync(It.IsAny<string>()))
                .ReturnsAsync(user);

            _mockJwtService.Setup(s => s.GenerateToken(user))
                .Returns("fake-jwt-token");

            // Act
            var result = await _controller.GoogleLogin(googleLoginDto);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.NotNull(okResult.Value);
        }
    }
}
