using System.ComponentModel.DataAnnotations;

namespace ASK.Group.Api.Models;

public class RateCard : BaseEntity
{
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    public int? RouteId { get; set; }

    public TransportRoute? Route { get; set; }

    [Required]
    [MaxLength(50)]
    public string ServiceType { get; set; } = "Standard";

    public decimal MinimumCharge { get; set; }

    public decimal RatePerKg { get; set; }

    public decimal? RatePerKm { get; set; }

    public decimal FuelSurchargePercent { get; set; }

    public decimal HandlingCharge { get; set; }

    public decimal GstPercent { get; set; } = 18;

    public decimal VolumetricDivisor { get; set; } = 5000;

    public DateTime EffectiveFrom { get; set; }

    public DateTime? EffectiveTo { get; set; }

    public bool IsActive { get; set; } = true;
}