namespace ASK.Group.Api.DTOs;

public class BookingListResponse
{
    public int Id { get; set; }

    public string BookingNumber { get; set; } =
        string.Empty;

    public string SenderName { get; set; } =
        string.Empty;

    public string ReceiverName { get; set; } =
        string.Empty;

    public string FromCity { get; set; } =
        string.Empty;

    public string ToCity { get; set; } =
        string.Empty;

    public decimal Weight { get; set; }

    public decimal TotalAmount { get; set; }

    public string BookingStatus { get; set; } =
        string.Empty;

    public string PaymentStatus { get; set; } =
        string.Empty;

    public DateTime PickupDate { get; set; }

    public DateTime CreatedAt { get; set; }
}