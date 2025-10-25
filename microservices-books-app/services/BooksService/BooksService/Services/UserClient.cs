using System.Text.Json;

namespace BooksService.Services
{
    public interface IUserClient
    {
        Task<UserInfoDto?> GetUserInfoAsync(Guid userId);
        Task<Dictionary<Guid, UserInfoDto>> GetUsersInfoAsync(IEnumerable<Guid> userIds);
    }

    public class UserInfoDto
    {
        public Guid Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
    }

    public class UserClient : IUserClient
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<UserClient> _logger;
        private readonly Dictionary<Guid, (UserInfoDto Info, DateTime CachedAt)> _cache = new();
        private readonly TimeSpan _cacheExpiration = TimeSpan.FromMinutes(5);
        private readonly SemaphoreSlim _cacheLock = new(1, 1);

        public UserClient(HttpClient httpClient, ILogger<UserClient> logger)
        {
            _httpClient = httpClient;
            _logger = logger;
        }

        public async Task<UserInfoDto?> GetUserInfoAsync(Guid userId)
        {
            // Check cache first
            await _cacheLock.WaitAsync();
            try
            {
                if (_cache.TryGetValue(userId, out var cached))
                {
                    if (DateTime.UtcNow - cached.CachedAt < _cacheExpiration)
                    {
                        return cached.Info;
                    }
                    _cache.Remove(userId);
                }
            }
            finally
            {
                _cacheLock.Release();
            }

            try
            {
                var response = await _httpClient.GetAsync($"api/users/{userId}");
                
                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogWarning("Failed to fetch user info for {UserId}. Status: {Status}", 
                        userId, response.StatusCode);
                    return null;
                }

                var content = await response.Content.ReadAsStringAsync();
                var userInfo = JsonSerializer.Deserialize<UserInfoDto>(content, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                if (userInfo != null)
                {
                    // Cache the result
                    await _cacheLock.WaitAsync();
                    try
                    {
                        _cache[userId] = (userInfo, DateTime.UtcNow);
                    }
                    finally
                    {
                        _cacheLock.Release();
                    }
                }

                return userInfo;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching user info for {UserId}", userId);
                return null;
            }
        }

        public async Task<Dictionary<Guid, UserInfoDto>> GetUsersInfoAsync(IEnumerable<Guid> userIds)
        {
            var result = new Dictionary<Guid, UserInfoDto>();
            var uncachedIds = new List<Guid>();

            // Check cache for each user
            await _cacheLock.WaitAsync();
            try
            {
                foreach (var userId in userIds)
                {
                    if (_cache.TryGetValue(userId, out var cached))
                    {
                        if (DateTime.UtcNow - cached.CachedAt < _cacheExpiration)
                        {
                            result[userId] = cached.Info;
                            continue;
                        }
                        _cache.Remove(userId);
                    }
                    uncachedIds.Add(userId);
                }
            }
            finally
            {
                _cacheLock.Release();
            }

            // Fetch uncached users in parallel
            if (uncachedIds.Any())
            {
                var tasks = uncachedIds.Select(async userId =>
                {
                    var userInfo = await GetUserInfoAsync(userId);
                    return (userId, userInfo);
                });

                var results = await Task.WhenAll(tasks);

                foreach (var (userId, userInfo) in results)
                {
                    if (userInfo != null)
                    {
                        result[userId] = userInfo;
                    }
                }
            }

            return result;
        }
    }
}
