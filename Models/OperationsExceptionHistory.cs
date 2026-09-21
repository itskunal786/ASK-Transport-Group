using System.ComponentModel.DataAnnotations;

namespace ASK.Group.Api.Models;

public class OperationsExceptionHistory
{
    public int Id { get; set; }

    public int OperationsExceptionId { get; set; }
    public OperationsException? OperationsException { get; set; }

    [Required, MaxLength(100)]
    public string Action { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string? Description { get; set; }

    [MaxLength(50)]
    public string? OldStatus { get; set; }

    [MaxLength(50)]
    public string? NewStatus { get; set; }

    [MaxLength(50)]
    public string? OldSeverity { get; set; }

    [MaxLength(50)]
    public string? NewSeverity { get; set; }

    public int? EscalationLevel { get; set; }

    [MaxLength(2000)]
    public string? Notes { get; set; }

    public int? UserId { get; set; }
    public AppUser? User { get; set; }

    public int? PerformedByUserId { get; set; }

    public DateTime ActionAt { get; set; } = DateTime.UtcNow;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
