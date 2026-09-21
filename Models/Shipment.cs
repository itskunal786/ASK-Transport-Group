using System.ComponentModel.DataAnnotations;

namespace ASK.Group.Api.Models;

public class Shipment : BaseEntity
{
    [Required]
    [MaxLength(50)]
    public string ShipmentNumber { get; set; } = string.Empty;

    public int BookingId { get; set; }

    public Booking? Booking { get; set; }

    public int? OriginHubId { get; set; }

    public Hub? OriginHub { get; set; }

    public int? DestinationHubId { get; set; }

    public Hub? DestinationHub { get; set; }

    public int? CurrentHubId { get; set; }

    public Hub? CurrentHub { get; set; }

    [Required]
    [MaxLength(50)]
    public string Status { get; set; } = "Created";

    public decimal TotalWeight { get; set; }

    public int TotalQuantity { get; set; }

    public DateTime? DispatchedAt { get; set; }

    public DateTime? ArrivedAtDestinationHub { get; set; }

    public DateTime? DeliveredAt { get; set; }

    [MaxLength(500)]
    public string? Notes { get; set; }
}