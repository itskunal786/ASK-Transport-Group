using System.ComponentModel.DataAnnotations;

namespace ASK.Group.Api.DTOs;

public class UpdateTrackingRequest
{
    [Required]
    public string Status { get; set; } = string.Empty;

    [Required]
    public string Location { get; set; } = string.Empty;

    public string? Description { get; set; }
}