using System.ComponentModel.DataAnnotations;

namespace ASK.Group.Api.DTOs;

public class CreateShipmentRequest
{
    [Required]
    public string BookingNumber { get; set; } =
        string.Empty;

    public int? OriginHubId { get; set; }

    public int? DestinationHubId { get; set; }

    [StringLength(500)]
    public string? Notes { get; set; }
}