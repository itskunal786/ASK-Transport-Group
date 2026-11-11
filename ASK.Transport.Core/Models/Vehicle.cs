using System.ComponentModel.DataAnnotations;

namespace ASK.Group.Api.Models;

public class Vehicle : BaseEntity
{
    [Required]
    [MaxLength(30)]
    public string VehicleNumber { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string VehicleType { get; set; } = string.Empty;

    [MaxLength(100)]
    public string? Manufacturer { get; set; }

    [MaxLength(100)]
    public string? Model { get; set; }

    public int? ManufacturingYear { get; set; }

    [MaxLength(50)]
    public string? FuelType { get; set; }

    public decimal CapacityKg { get; set; }

    public decimal? CapacityCubicFeet { get; set; }

    [MaxLength(100)]
    public string? RcNumber { get; set; }

    public DateTime? RcExpiryDate { get; set; }

    [MaxLength(100)]
    public string? InsurancePolicyNumber { get; set; }

    public DateTime? InsuranceExpiryDate { get; set; }

    public DateTime? FitnessExpiryDate { get; set; }

    public DateTime? PucExpiryDate { get; set; }

    [MaxLength(100)]
    public string? ChassisNumber { get; set; }

    [MaxLength(100)]
    public string? EngineNumber { get; set; }

    public int? HubId { get; set; }

    public Hub? Hub { get; set; }

    public bool IsAvailable { get; set; } = true;

    public bool IsActive { get; set; } = true;

    [MaxLength(50)]
    public string Status { get; set; } = "Available";

    [MaxLength(500)]
    public string? Notes { get; set; }
}