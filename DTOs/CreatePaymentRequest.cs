using System.ComponentModel.DataAnnotations;

namespace ASK.Group.Api.DTOs;

public class CreatePaymentRequest
{
    [Required]
    public string BookingNumber { get; set; }
        = string.Empty;

    [Required]
    public string PaymentMethod { get; set; }
        = string.Empty;

    public string? PaymentReference { get; set; }
}