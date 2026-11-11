namespace ASK.Group.Api.DTOs;

public class ApiResult<T>
{
    public bool Success { get; set; }

    public string Message { get; set; } =
        string.Empty;

    public T? Data { get; set; }

    public string? Code { get; set; }

    public DateTime Timestamp { get; set; } =
        DateTime.UtcNow;

    public static ApiResult<T> Ok(
        T data,
        string message =
            "Request completed successfully")
    {
        return new ApiResult<T>
        {
            Success = true,
            Message = message,
            Data = data
        };
    }

    public static ApiResult<T> Fail(
        string message,
        string? code = null)
    {
        return new ApiResult<T>
        {
            Success = false,
            Message = message,
            Code = code
        };
    }
}