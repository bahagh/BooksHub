using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace UserService.Hubs
{
    [Authorize]
    public class NotificationHub : Hub
    {
        private readonly ILogger<NotificationHub> _logger;
        private static readonly Dictionary<string, string> _userConnections = new();

        public NotificationHub(ILogger<NotificationHub> logger)
        {
            _logger = logger;
        }

        public override async Task OnConnectedAsync()
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!string.IsNullOrEmpty(userId))
            {
                _userConnections[userId] = Context.ConnectionId;
                _logger.LogInformation($"User {userId} connected with connection ID {Context.ConnectionId}");
                
                // Join user to their personal group
                await Groups.AddToGroupAsync(Context.ConnectionId, $"user_{userId}");
            }
            
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!string.IsNullOrEmpty(userId))
            {
                _userConnections.Remove(userId);
                _logger.LogInformation($"User {userId} disconnected");
                
                // Remove user from their personal group
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"user_{userId}");
            }
            
            await base.OnDisconnectedAsync(exception);
        }

        /// <summary>
        /// Send notification to a specific user
        /// </summary>
        public static string? GetConnectionId(string userId)
        {
            _userConnections.TryGetValue(userId, out var connectionId);
            return connectionId;
        }

        /// <summary>
        /// Ping/pong to keep connection alive
        /// </summary>
        public async Task Ping()
        {
            await Clients.Caller.SendAsync("Pong");
        }
    }
}
