using System.ComponentModel.DataAnnotations;

namespace ASK.Group.Api.Models;

public class DeliveryAttempt
{
    public int Id { get; set; }

    public int ShipmentId { get; set; }

    public Shipment? Shipment { get; set; }

    public int BookingId { get; set; }

    public Booking? Booking { get; set; }

    public int? DriverId { get; set; }

    public Driver? Driver { get; set; }

    public int AttemptNumber { get; set; }

    [Required]
    [MaxLength(50)]
    public string Status { get; set; } =
        "Pending";

    [MaxLength(500)]
    public string? FailureReason { get; set; }

    [MaxLength(300)]
    public string? DeliveryLocation { get; set; }

    public DateTime AttemptedAt { get; set; } =
        DateTime.UtcNow;

    public DateTime? DeliveredAt { get; set; }

    public DateTime? NextAttemptAt { get; set; }

    public DateTime CreatedAt { get; set; } =
        DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }
}