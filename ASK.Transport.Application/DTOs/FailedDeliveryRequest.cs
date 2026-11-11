using System.ComponentModel.DataAnnotations;

namespace ASK.Group.Api.DTOs;

public class FailedDeliveryRequest
{
    [Required]
    public string BookingNumber { get; set; } =
        string.Empty;

    [Required]
    [StringLength(500)]
    public string Reason { get; set; } =
        string.Empty;

    [StringLength(300)]
    public string? Location { get; set; }

    public DateTime? NextAttemptAt { get; set; }
}