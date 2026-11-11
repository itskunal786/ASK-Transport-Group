using System.ComponentModel.DataAnnotations;

namespace ASK.Group.Api.Models;

public class PaymentRefund : BaseEntity
{
    public int PaymentTransactionId { get; set; }

    public PaymentTransaction? PaymentTransaction { get; set; }

    public int BookingId { get; set; }

    public Booking? Booking { get; set; }

    [Required]
    [MaxLength(100)]
    public string RefundNumber { get; set; } = string.Empty;

    [MaxLength(150)]
    public string? RazorpayRefundId { get; set; }

    public decimal Amount { get; set; }

    [Required]
    [MaxLength(50)]
    public string Status { get; set; } = "Pending";

    [MaxLength(500)]
    public string? Reason { get; set; }

    [MaxLength(500)]
    public string? GatewayMessage { get; set; }

    public DateTime? RefundedAt { get; set; }
}