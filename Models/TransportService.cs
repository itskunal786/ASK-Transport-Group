using System.ComponentModel.DataAnnotations;

namespace ASK.Group.Api.Models;

public class TransportService
{
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public decimal BaseRate { get; set; }

    public decimal PerKgRate { get; set; }

    public int ExtraDeliveryDays { get; set; }

    public bool IsActive { get; set; } = true;
}