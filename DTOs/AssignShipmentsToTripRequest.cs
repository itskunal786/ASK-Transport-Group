using System.ComponentModel.DataAnnotations;

namespace ASK.Group.Api.DTOs;

public class AssignShipmentsToTripRequest
{
    [Required]
    public List<int> ShipmentIds { get; set; } =
        new();
}