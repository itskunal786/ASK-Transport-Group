using System.ComponentModel.DataAnnotations;

namespace ASK.Group.Api.DTOs;

public class DispatchTripRequest
{
    [Required]
    public int DriverId { get; set; }

    [Required]
    public int VehicleId { get; set; }
}

public class TripWorkflowResult
{
    public bool Success { get; set; }

    public int TripId { get; set; }

    public string Status { get; set; }
        = string.Empty;

    public string Message { get; set; }
        = string.Empty;
}