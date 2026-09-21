using System.ComponentModel.DataAnnotations;

namespace ASK.Group.Api.Models;

public class Permission
{
    public int Id { get; set; }

    [Required]
    [MaxLength(150)]
    public string Code { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string Module { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string Action { get; set; } = string.Empty;

    [MaxLength(300)]
    public string? Description { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } =
        DateTime.UtcNow;
}