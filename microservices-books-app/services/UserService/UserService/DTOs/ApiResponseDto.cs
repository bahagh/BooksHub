namespace UserService.DTOs
{
    public class ApiResponse<T>
    {
        public T Data { get; set; } = default!;
        public string? Message { get; set; }
        public bool Success { get; set; } = true;

        public static ApiResponse<T> CreateSuccess(T data, string? message = null)
        {
            return new ApiResponse<T>
            {
                Data = data,
                Message = message,
                Success = true
            };
        }

        public static ApiResponse<T> CreateError(string message)
        {
            return new ApiResponse<T>
            {
                Data = default!,
                Message = message,
                Success = false
            };
        }
    }
}