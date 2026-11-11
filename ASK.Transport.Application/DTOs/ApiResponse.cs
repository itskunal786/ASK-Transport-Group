namespace ASK.Group.Api.DTOs;

public class ApiResponse
{
    public bool Success { get; set; }

    public string Message { get; set; }
        = string.Empty;
}

public class ApiResponse<T>
{
    public bool Success { get; set; }

    public string Message { get; set; }
        = string.Empty;

    public T? Data { get; set; }
}