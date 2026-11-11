using System.ComponentModel.DataAnnotations;

namespace ASK.Group.Api.DTOs;

public class UpdateTripStatusRequest
{
    [Required]
    public string Status { get; set; } =
        string.Empty;

    [StringLength(500)]
    public string? Notes { get; set; }
}