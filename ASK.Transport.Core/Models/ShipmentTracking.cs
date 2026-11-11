using System.ComponentModel.DataAnnotations;

namespace ASK.Group.Api.Models;

public class ShipmentTracking
{
    public int Id { get; set; }

    public int BookingId { get; set; }

    public Booking? Booking { get; set; }

    [Required]
    [MaxLength(50)]
    public string Status { get; set; } = "Booked";

    [MaxLength(150)]
    public string Location { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Description { get; set; }

    public DateTime StatusDate { get; set; } = DateTime.UtcNow;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}