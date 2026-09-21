using System.ComponentModel.DataAnnotations;

namespace ASK.Group.Api.Models;

public sealed class DeliveryFeedback
{
    public int Id { get; set; }

    public int BookingId { get; set; }

    public Booking? Booking { get; set; }

    public int UserId { get; set; }

    public AppUser? User { get; set; }

    [Range(1, 5)]
    public int Rating { get; set; }

    [MaxLength(500)]
    public string? Comment { get; set; }

    public DateTime CreatedAt { get; set; } =
        DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }
}
