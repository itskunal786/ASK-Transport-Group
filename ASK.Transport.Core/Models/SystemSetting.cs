using System.ComponentModel.DataAnnotations;

namespace ASK.Group.Api.Models;

public class SystemSetting
{
    public int Id { get; set; }

    [Required]
    [MaxLength(150)]
    public string Key { get; set; } = string.Empty;

    [Required]
    [MaxLength(2000)]
    public string Value { get; set; } = string.Empty;

    [MaxLength(100)]
    public string Group { get; set; } = "General";

    [MaxLength(500)]
    public string? Description { get; set; }

    public bool IsPublic { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }
}