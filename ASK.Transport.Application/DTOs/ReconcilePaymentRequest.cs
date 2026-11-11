using System.ComponentModel.DataAnnotations;

namespace ASK.Group.Api.DTOs;

public class ReconcilePaymentRequest
{
    [Required]
    public string BookingNumber { get; set; } =
        string.Empty;
}