namespace ASK.Group.Api.DTOs;

public sealed class ClientBookingDto
{
    public int Id { get; set; }

    public string BookingNumber { get; set; } = string.Empty;

    public string BookingStatus { get; set; } = string.Empty;

    public string PaymentStatus { get; set; } = string.Empty;

    public decimal TotalAmount { get; set; }

    public DateTime CreatedAt { get; set; }
}


public sealed class ClientBookingListDto
{
    public int Page { get; set; }

    public int PageSize { get; set; }

    public int TotalRecords { get; set; }

    public int TotalPages { get; set; }

    public List<ClientBookingDto> Data { get; set; } = new();
}


public sealed class CancelClientBookingRequest
{
    public string? Reason { get; set; }
}