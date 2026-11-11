using System.ComponentModel.DataAnnotations;

namespace ASK.Group.Api.DTOs;

public class ConfirmDeliveryRequest
{
    [Required]
    public string BookingNumber { get; set; } =
        string.Empty;

    [Required]
    [StringLength(6, MinimumLength = 6)]
    public string Otp { get; set; } =
        string.Empty;

    [Required]
    [StringLength(150)]
    public string ReceiverName { get; set; } =
        string.Empty;

    [StringLength(20)]
    public string? ReceiverPhone { get; set; }

    [StringLength(300)]
    public string? DeliveryLocation { get; set; }

    [StringLength(500)]
    public string? Notes { get; set; }

    public int? PodDocumentId { get; set; }
}