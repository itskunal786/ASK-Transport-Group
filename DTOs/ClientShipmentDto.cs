namespace ASK.Group.Api.DTOs;

public sealed class ClientShipmentDto
{
    public int Id { get; set; }

    public string TrackingNumber { get; set; } = string.Empty;

    public string BookingNumber { get; set; } = string.Empty;

    public string Status { get; set; } = string.Empty;

    public int? CurrentHubId { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }
}


public sealed class ClientShipmentListDto
{
    public int Page { get; set; }

    public int PageSize { get; set; }

    public int TotalRecords { get; set; }

    public int TotalPages { get; set; }

    public List<ClientShipmentDto> Data { get; set; } = new();
}


public sealed class ClientShipmentTimelineDto
{
    public int Id { get; set; }

    public string Status { get; set; } = string.Empty;

    public string? Location { get; set; }

    public string? Remarks { get; set; }

    public DateTime Date { get; set; }
}