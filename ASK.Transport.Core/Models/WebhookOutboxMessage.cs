using System.ComponentModel.DataAnnotations;

namespace ASK.Group.Api.Models;

public class WebhookOutboxMessage
{
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string EventName { get; set; } =
        string.Empty;

    [Required]
    [MaxLength(200)]
    public string ReferenceId { get; set; } =
        string.Empty;

    [Required]
    public string Payload { get; set; } =
        string.Empty;

    [Required]
    [MaxLength(30)]
    public string Status { get; set; } =
        "Pending";

    public int AttemptCount { get; set; }

    public int MaxAttempts { get; set; } =
        5;

    public DateTime NextAttemptAt { get; set; } =
        DateTime.UtcNow;

    public DateTime? ProcessingStartedAt
    {
        get;
        set;
    }

    public DateTime? CompletedAt { get; set; }

    public DateTime? FailedAt { get; set; }

    [MaxLength(2000)]
    public string? LastError { get; set; }

    public DateTime CreatedAt { get; set; } =
        DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }
}