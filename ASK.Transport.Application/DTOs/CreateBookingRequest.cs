using System.ComponentModel.DataAnnotations;

namespace ASK.Group.Api.DTOs;

public class CreateBookingRequest
{
    [Required]
    public string OrderType { get; set; } = "Single";

    [Required]
    public string SenderName { get; set; } = string.Empty;

    [Required]
    public string SenderPhone { get; set; } = string.Empty;

    [Required]
    public string FromAddress { get; set; } = string.Empty;

    [Required]
    [StringLength(6, MinimumLength = 6)]
    public string FromPinCode { get; set; } = string.Empty;

    [Required]
    public string ReceiverName { get; set; } = string.Empty;

    [Required]
    public string ReceiverPhone { get; set; } = string.Empty;

    [Required]
    public string ToAddress { get; set; } = string.Empty;

    [Required]
    [StringLength(6, MinimumLength = 6)]
    public string ToPinCode { get; set; } = string.Empty;

    [Required]
    public string GoodsType { get; set; } = string.Empty;

    [Range(0.01, double.MaxValue)]
    public decimal Weight { get; set; }

    [Range(1, int.MaxValue)]
    public int Quantity { get; set; } = 1;

    public string? GoodsDescription { get; set; }

    [Range(1, int.MaxValue)]
    public int TransportServiceId { get; set; }

    public DateTime PickupDate { get; set; }

    [Range(0, double.MaxValue)]
    public decimal DiscountAmount { get; set; }

    public string? Notes { get; set; }

    public List<CreateBookingItemRequest> Items { get; set; } = new();

    public int? SenderContactId { get; set; }

    public int? ReceiverContactId { get; set; }
}