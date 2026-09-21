using System.ComponentModel.DataAnnotations;

namespace ASK.Group.Api.DTOs;

public class FinalizeDeliveryRequest
{
    [Required]
    public string Otp { get; set; } = string.Empty;

    public string? ReceiverName { get; set; }

    public string? Remarks { get; set; }
}

public class DeliveryFinalizationResult
{
    public bool Success { get; set; }

    public int ShipmentId { get; set; }

    public string BookingNumber { get; set; }
        = string.Empty;

    public string ShipmentStatus { get; set; }
        = string.Empty;

    public string BookingStatus { get; set; }
        = string.Empty;

    public string Message { get; set; }
        = string.Empty;
}