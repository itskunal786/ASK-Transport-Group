using System.ComponentModel.DataAnnotations;

namespace ASK.Group.Api.DTOs;

public class ChangeShipmentStatusRequest
{
    [Required]
    public string Status { get; set; }
        = string.Empty;

    public int? HubId { get; set; }

    public string? Remarks { get; set; }
}