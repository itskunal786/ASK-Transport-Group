using System.ComponentModel.DataAnnotations;

namespace ASK.Group.Api.DTOs;

public class RateCardRequest
{
	[Required]
	[StringLength(100)]
	public string Name { get; set; } = string.Empty;

	public int? RouteId { get; set; }

	[Required]
	[StringLength(50)]
	public string ServiceType { get; set; } = "Standard";

	[Range(0, double.MaxValue)]
	public decimal MinimumCharge { get; set; }

	[Range(0, double.MaxValue)]
	public decimal RatePerKg { get; set; }

	public decimal? RatePerKm { get; set; }

	[Range(0, 100)]
	public decimal FuelSurchargePercent { get; set; }

	[Range(0, double.MaxValue)]
	public decimal HandlingCharge { get; set; }

	[Range(0, 100)]
	public decimal GstPercent { get; set; } = 18;

	[Range(1, double.MaxValue)]
	public decimal VolumetricDivisor { get; set; } = 5000;

	public DateTime EffectiveFrom { get; set; }

	public DateTime? EffectiveTo { get; set; }

	public bool IsActive { get; set; } = true;

	public List<RateSlabRequest> Slabs { get; set; } = new();
}