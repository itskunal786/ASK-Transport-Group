using System.ComponentModel.DataAnnotations;

namespace ASK.Group.Api.DTOs;

public class CreateRefundRequest
{
    [Required]
    public string BookingNumber { get; set; } =
        string.Empty;

    [Range(0.01, double.MaxValue)]
    public decimal Amount { get; set; }

    [Required]
    [StringLength(500)]
    public string Reason { get; set; } =
        string.Empty;
}