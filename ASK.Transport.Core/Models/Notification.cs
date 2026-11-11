using System.ComponentModel.DataAnnotations;

namespace ASK.Group.Api.Models;

public class Notification
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public AppUser? User { get; set; }

    public int? BookingId { get; set; }

    public Booking? Booking { get; set; }

    [Required]
    [MaxLength(150)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [MaxLength(1000)]
    public string Message { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string Type { get; set; } = "General";

    public bool IsRead { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? ReadAt { get; set; }
}