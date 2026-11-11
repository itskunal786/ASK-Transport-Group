using System.ComponentModel.DataAnnotations;

namespace ASK.Group.Api.DTOs;

public sealed class CreateDeliveryFeedbackRequest
{
    [Range(1, 5)]
    public int Rating { get; set; }

    [MaxLength(500)]
    public string? Comment { get; set; }
}

public sealed class DeliveryFeedbackDto
{
    public int Id { get; set; }

    public string BookingNumber { get; set; } =
        string.Empty;

    public int Rating { get; set; }

    public string? Comment { get; set; }

    public DateTime CreatedAt { get; set; }
}
