using System.ComponentModel.DataAnnotations;

namespace ASK.Group.Api.Models;

public class AuditLog
{
    public int Id { get; set; }

    public int? UserId { get; set; }

    [MaxLength(180)]
    public string? UserEmail { get; set; }

    [Required]
    [MaxLength(100)]
    public string Action { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Description { get; set; }

    [MaxLength(100)]
    public string? IpAddress { get; set; }

    [MaxLength(300)]
    public string? UserAgent { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}