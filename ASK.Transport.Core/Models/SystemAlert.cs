using System.ComponentModel.DataAnnotations;

namespace ASK.Group.Api.Models;

public class SystemAlert
{
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string AlertType { get; set; } =
        string.Empty;

    [Required]
    [MaxLength(150)]
    public string Title { get; set; } =
        string.Empty;

    [Required]
    [MaxLength(1000)]
    public string Message { get; set; } =
        string.Empty;

    [MaxLength(50)]
    public string Severity { get; set; } =
        "Warning";

    [MaxLength(100)]
    public string? ReferenceType { get; set; }

    public int? ReferenceId { get; set; }

    public bool IsResolved { get; set; }

    public DateTime CreatedAt { get; set; } =
        DateTime.UtcNow;

    public DateTime? ResolvedAt { get; set; }
}