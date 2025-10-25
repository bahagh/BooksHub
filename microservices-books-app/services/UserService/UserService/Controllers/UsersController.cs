using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UserService.Data;

namespace UserService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly UserDbContext _context;
        private readonly ILogger<UsersController> _logger;

        public UsersController(UserDbContext context, ILogger<UsersController> logger)
        {
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// Get user information by ID (for internal service-to-service communication)
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<UserInfoDto>> GetUserInfo(Guid id)
        {
            var user = await _context.Users
                .Where(u => u.Id == id)
                .Select(u => new UserInfoDto
                {
                    Id = u.Id,
                    Username = u.Username,
                    FirstName = u.FirstName,
                    LastName = u.LastName,
                    FullName = u.FirstName + " " + u.LastName
                })
                .FirstOrDefaultAsync();

            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            return Ok(user);
        }

        /// <summary>
        /// Get multiple users information by IDs (for batch requests)
        /// </summary>
        [HttpPost("batch")]
        public async Task<ActionResult<Dictionary<Guid, UserInfoDto>>> GetUsersInfo([FromBody] List<Guid> userIds)
        {
            if (userIds == null || !userIds.Any())
            {
                return BadRequest(new { message = "User IDs are required" });
            }

            var users = await _context.Users
                .Where(u => userIds.Contains(u.Id))
                .Select(u => new UserInfoDto
                {
                    Id = u.Id,
                    Username = u.Username,
                    FirstName = u.FirstName,
                    LastName = u.LastName,
                    FullName = u.FirstName + " " + u.LastName
                })
                .ToDictionaryAsync(u => u.Id);

            return Ok(users);
        }
    }

    public class UserInfoDto
    {
        public Guid Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
    }
}
