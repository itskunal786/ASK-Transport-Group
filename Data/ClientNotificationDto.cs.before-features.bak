namespace ASK.Group.Api.DTOs;

public sealed class ClientNotificationDto
{
    public int Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Message { get; set; } = string.Empty;

    public bool IsRead { get; set; }

    public DateTime CreatedAt { get; set; }
}


public sealed class ClientNotificationListDto
{
    public int Page { get; set; }

    public int PageSize { get; set; }

    public int TotalRecords { get; set; }

    public int TotalPages { get; set; }

    public int UnreadCount { get; set; }

    public List<ClientNotificationDto> Data { get; set; } = new();
}