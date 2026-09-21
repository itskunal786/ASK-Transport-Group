using System.ComponentModel.DataAnnotations;

namespace ASK.Group.Api.DTOs;

public class CreateTripRequest
{
	[Range(1, int.MaxValue)]
	public int FromHubId { get; set; }

	[Range(1, int.MaxValue)]
	public int ToHubId { get; set; }

	[Range(1, int.MaxValue)]
	public int DriverId { get; set; }

	[Range(1, int.MaxValue)]
	public int VehicleId { get; set; }

	public DateTime PlannedDepartureAt { get; set; }

	public DateTime? ExpectedArrivalAt { get; set; }

	[StringLength(500)]
	public string? Notes { get; set; }

	public List<int> ShipmentIds { get; set; } =
		new();
}