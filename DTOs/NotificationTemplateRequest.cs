using System.ComponentModel.DataAnnotations;

namespace ASK.Group.Api.DTOs;

public class NotificationTemplateRequest
{
    [Required]
    [StringLength(100)]
    public string Code { get; set; } =
        string.Empty;

    [Required]
    [StringLength(150)]
    public string Name { get; set; } =
        string.Empty;

    [Required]
    [StringLength(50)]
    public string Channel { get; set; } =
        "Email";

    [StringLength(300)]
    public string? Subject { get; set; }

    [Required]
    public string Body { get; set; } =
        string.Empty;

    public bool IsActive { get; set; } = true;
}