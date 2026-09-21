namespace ASK.Group.Api.DTOs;

public class BookingFilterRequest
    : PaginationRequest
{
    public string? BookingStatus { get; set; }

    public string? PaymentStatus { get; set; }

    public int? UserId { get; set; }

    public int? TransportServiceId { get; set; }

    public string? FromCity { get; set; }

    public string? ToCity { get; set; }

    public DateTime? FromDate { get; set; }

    public DateTime? ToDate { get; set; }
}