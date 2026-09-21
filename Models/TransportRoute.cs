using System.ComponentModel.DataAnnotations;

namespace ASK.Group.Api.Models;

public class TransportRoute
{
    public int Id { get; set; }

    [Required, MaxLength(30)]
    public string Code { get; set; } = string.Empty;

    [Required, MaxLength(150)]
    public string Name { get; set; } = string.Empty;

    public int FromHubId { get; set; }
    public Hub? FromHub { get; set; }

    public int ToHubId { get; set; }
    public Hub? ToHub { get; set; }

    public decimal DistanceKm { get; set; }

    public int? EstimatedTransitHours { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}