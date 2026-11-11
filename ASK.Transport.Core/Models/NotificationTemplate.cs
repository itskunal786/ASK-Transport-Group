using System.ComponentModel.DataAnnotations;

namespace ASK.Group.Api.Models;

public class NotificationTemplate
{
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string Code { get; set; } = string.Empty;

    [Required]
    [MaxLength(150)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string Channel { get; set; } = "Email";

    [MaxLength(300)]
    public string? Subject { get; set; }

    [Required]
    public string Body { get; set; } = string.Empty;

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } =
        DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }
}