using System.ComponentModel.DataAnnotations;

namespace ASK.Group.Api.DTOs;

public class ChangeBookingStatusRequest
{
    [Required]
    public string Status { get; set; }
        = string.Empty;
}