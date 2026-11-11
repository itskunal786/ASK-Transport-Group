using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ASK.Group.Api.Models;

public class PaymentTransaction
{
    public int Id { get; set; }

    public int BookingId { get; set; }

    public Booking? Booking { get; set; }

    [Required]
    [MaxLength(100)]
    public string TransactionId { get; set; } = string.Empty;

    [MaxLength(100)]
    public string? RazorpayOrderId { get; set; }

    [MaxLength(100)]
    public string? RazorpayPaymentId { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal Amount { get; set; }

    [MaxLength(50)]
    public string PaymentMethod { get; set; } = string.Empty;

    [MaxLength(50)]
    public string PaymentStatus { get; set; } = "Pending";

    [MaxLength(500)]
    public string? PaymentMessage { get; set; }

    public DateTime? PaidAt { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}