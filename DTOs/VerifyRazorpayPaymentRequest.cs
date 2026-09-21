using System.ComponentModel.DataAnnotations;

namespace ASK.Group.Api.DTOs;

public class VerifyRazorpayPaymentRequest
{
    [Required]
    public string BookingNumber { get; set; }
        = string.Empty;

    [Required]
    public string RazorpayOrderId { get; set; }
        = string.Empty;

    [Required]
    public string RazorpayPaymentId { get; set; }
        = string.Empty;

    [Required]
    public string RazorpaySignature { get; set; }
        = string.Empty;
}