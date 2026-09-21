using System.ComponentModel.DataAnnotations;

namespace ASK.Group.Api.Models;

public class ProofOfDelivery
{
    public int Id { get; set; }

    public int BookingId { get; set; }

    public Booking? Booking { get; set; }

    public int ShipmentId { get; set; }

    public Shipment? Shipment { get; set; }

    public int? DriverId { get; set; }

    public Driver? Driver { get; set; }

    [Required]
    [MaxLength(150)]
    public string ReceiverName { get; set; } =
        string.Empty;

    [MaxLength(20)]
    public string? ReceiverPhone { get; set; }

    [MaxLength(50)]
    public string VerificationMethod { get; set; } =
        "OTP";

    [MaxLength(300)]
    public string? DeliveryLocation { get; set; }

    [MaxLength(500)]
    public string? Notes { get; set; }

    public int? DocumentId { get; set; }

    public BookingDocument? Document { get; set; }

    public DateTime DeliveredAt { get; set; }

    public DateTime CreatedAt { get; set; } =
        DateTime.UtcNow;
}