using System.ComponentModel.DataAnnotations;

namespace ASK.Group.Api.Models;

public class DeliveryOtp
{
    public int Id { get; set; }

    public int BookingId { get; set; }

    public Booking? Booking { get; set; }

    public int ShipmentId { get; set; }

    public Shipment? Shipment { get; set; }

    [Required]
    [MaxLength(100)]
    public string CodeHash { get; set; } =
        string.Empty;

    public DateTime ExpiresAt { get; set; }

    public bool IsUsed { get; set; }

    public int FailedAttempts { get; set; }

    public DateTime CreatedAt { get; set; } =
        DateTime.UtcNow;

    public DateTime? UsedAt { get; set; }
}