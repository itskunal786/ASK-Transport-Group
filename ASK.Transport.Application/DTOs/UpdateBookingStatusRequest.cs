using System.ComponentModel.DataAnnotations;

namespace ASK.Group.Api.DTOs;

public class UpdateBookingStatusRequest
{
    [Required]
    public string Status { get; set; } = string.Empty;

    public string? Location { get; set; }

    public string? Description { get; set; }
}