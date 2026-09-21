using System.ComponentModel.DataAnnotations;

namespace ASK.Group.Api.Models;

public class ShipmentMovement
{
    public int Id { get; set; }

    public int ShipmentId { get; set; }

    public Shipment? Shipment { get; set; }

    public int? TripId { get; set; }

    public TransportTrip? Trip { get; set; }

    public int? FromHubId { get; set; }

    public Hub? FromHub { get; set; }

    public int? ToHubId { get; set; }

    public Hub? ToHub { get; set; }

    [Required]
    [MaxLength(50)]
    public string Status { get; set; } = string.Empty;

    [MaxLength(300)]
    public string? Location { get; set; }

    [MaxLength(500)]
    public string? Description { get; set; }

    public DateTime MovementDate { get; set; } =
        DateTime.UtcNow;

    public DateTime CreatedAt { get; set; } =
        DateTime.UtcNow;
}
