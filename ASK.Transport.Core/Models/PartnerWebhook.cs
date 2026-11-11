using System.ComponentModel.DataAnnotations;

namespace ASK.Group.Api.Models;

public class PartnerWebhook
{
    public int Id { get; set; }

    [Required]
    [MaxLength(150)]
    public string PartnerName { get; set; } =
        string.Empty;

    [Required]
    [MaxLength(1000)]
    public string WebhookUrl { get; set; } =
        string.Empty;

    [Required]
    [MaxLength(500)]
    public string SecretKey { get; set; } =
        string.Empty;

    [MaxLength(1000)]
    public string? Events { get; set; }

    public bool IsActive { get; set; } =
        true;

    public DateTime? LastSuccessAt { get; set; }

    public DateTime? LastFailureAt { get; set; }

    [MaxLength(2000)]
    public string? LastError { get; set; }

    public DateTime CreatedAt { get; set; } =
        DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }
}