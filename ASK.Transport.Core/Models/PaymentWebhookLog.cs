using System.ComponentModel.DataAnnotations;

namespace ASK.Group.Api.Models;

public class PaymentWebhookLog
{
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string Provider { get; set; } = "Razorpay";

    [Required]
    [MaxLength(150)]
    public string EventId { get; set; } = string.Empty;

    [Required]
    [MaxLength(150)]
    public string EventType { get; set; } = string.Empty;

    public bool SignatureValid { get; set; }

    public bool Processed { get; set; }

    [MaxLength(1000)]
    public string? ErrorMessage { get; set; }

    public DateTime ReceivedAt { get; set; } =
        DateTime.UtcNow;

    public DateTime? ProcessedAt { get; set; }
}