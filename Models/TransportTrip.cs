using System.ComponentModel.DataAnnotations;

namespace ASK.Group.Api.Models;

public class TransportTrip
{
	public int Id { get; set; }

	[Required]
	[MaxLength(50)]
	public string TripNumber { get; set; } =
		string.Empty;

	public int FromHubId { get; set; }

	public Hub? FromHub { get; set; }

	public int ToHubId { get; set; }

	public Hub? ToHub { get; set; }

	public int DriverId { get; set; }

	public Driver? Driver { get; set; }

	public int VehicleId { get; set; }

	public Vehicle? Vehicle { get; set; }

	[Required]
	[MaxLength(50)]
	public string Status { get; set; } =
		"Planned";

	public DateTime PlannedDepartureAt
	{
		get;
		set;
	}

	public DateTime? ActualDepartureAt
	{
		get;
		set;
	}

	public DateTime? ExpectedArrivalAt
	{
		get;
		set;
	}

	public DateTime? ActualArrivalAt
	{
		get;
		set;
	}

	public decimal TotalWeight { get; set; }

	public int TotalShipments { get; set; }

	[MaxLength(500)]
	public string? Notes { get; set; }

	public DateTime CreatedAt { get; set; } =
		DateTime.UtcNow;

	public DateTime? UpdatedAt { get; set; }

	public bool IsDeleted { get; set; }

	public DateTime? DeletedAt { get; set; }

	[Timestamp]
	public byte[] RowVersion { get; set; } =
		Array.Empty<byte>();
}