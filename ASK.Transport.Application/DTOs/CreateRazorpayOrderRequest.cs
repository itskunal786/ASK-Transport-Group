using System.ComponentModel.DataAnnotations;

namespace ASK.Group.Api.DTOs;

public class CreateRazorpayOrderRequest
{
    [Required]
    public string BookingNumber { get; set; }
        = string.Empty;
}