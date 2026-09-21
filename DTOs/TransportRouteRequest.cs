using System.ComponentModel.DataAnnotations;

namespace ASK.Group.Api.DTOs;

public class TransportRouteRequest
{
    [Required]
    [StringLength(30)]
    public string Code { get; set; } = string.Empty;

    [Required]
    [StringLength(150)]
    public string Name { get; set; } = string.Empty;

    [Range(1, int.MaxValue)]
    public int FromHubId { get; set; }

    [Range(1, int.MaxValue)]
    public int ToHubId { get; set; }

    [Range(0.01, double.MaxValue)]
    public decimal DistanceKm { get; set; }

    public int? EstimatedTransitHours { get; set; }

    public bool IsActive { get; set; } = true;
}