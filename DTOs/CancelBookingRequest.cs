using System.ComponentModel.DataAnnotations;

namespace ASK.Group.Api.DTOs;

public class CancelBookingRequest
{
    [Required]
    public string Reason { get; set; } = string.Empty;
}