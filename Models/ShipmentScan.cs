using System.ComponentModel.DataAnnotations;

namespace ASK.Group.Api.Models;

public class ShipmentScan
{
    public int Id { get; set; }

    public int ShipmentId { get; set; }
    public Shipment? Shipment { get; set; }

    public int? BookingId { get; set; }
    public Booking? Booking { get; set; }

    [Required, MaxLength(100)]
    public string ScanCode { get; set; } = string.Empty;

    [Required, MaxLength(50)]
    public string ScanType { get; set; } = string.Empty;

    [MaxLength(200)]
    public string? Location { get; set; }

    public int? HubId { get; set; }
    public Hub? Hub { get; set; }

    public int? ScannedByUserId { get; set; }
    public AppUser? ScannedByUser { get; set; }

    [MaxLength(500)]
    public string? Notes { get; set; }

    public DateTime ScannedAt { get; set; } = DateTime.UtcNow;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
