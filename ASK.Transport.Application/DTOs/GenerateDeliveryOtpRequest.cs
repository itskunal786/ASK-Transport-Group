using System.ComponentModel.DataAnnotations;

namespace ASK.Group.Api.DTOs;

public class GenerateDeliveryOtpRequest
{
    [Required]
    public string BookingNumber { get; set; } =
        string.Empty;
}