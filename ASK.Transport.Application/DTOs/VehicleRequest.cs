using System.ComponentModel.DataAnnotations;

namespace ASK.Group.Api.DTOs;

public class VehicleRequest
{
	[Required]
	[StringLength(30)]
	public string VehicleNumber { get; set; } =
		string.Empty;

	[Required]
	[StringLength(100)]
	public string VehicleType { get; set; } =
		string.Empty;

	[StringLength(100)]
	public string? Manufacturer { get; set; }

	[StringLength(100)]
	public string? Model { get; set; }

	public int? ManufacturingYear { get; set; }

	[StringLength(50)]
	public string? FuelType { get; set; }

	[Range(0.01, double.MaxValue)]
	public decimal CapacityKg { get; set; }

	public decimal? CapacityCubicFeet { get; set; }

	[StringLength(100)]
	public string? RcNumber { get; set; }

	public DateTime? RcExpiryDate { get; set; }

	[StringLength(100)]
	public string? InsurancePolicyNumber { get; set; }

	public DateTime? InsuranceExpiryDate { get; set; }

	public DateTime? FitnessExpiryDate { get; set; }

	public DateTime? PucExpiryDate { get; set; }

	[StringLength(100)]
	public string? ChassisNumber { get; set; }

	[StringLength(100)]
	public string? EngineNumber { get; set; }

	public int? HubId { get; set; }

	public bool IsAvailable { get; set; } = true;

	public bool IsActive { get; set; } = true;

	[StringLength(50)]
	public string Status { get; set; } = "Available";

	[StringLength(500)]
	public string? Notes { get; set; }
}