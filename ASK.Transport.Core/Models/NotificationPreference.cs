namespace ASK.Group.Api.Models;

public sealed class NotificationPreference
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public bool EmailEnabled { get; set; } = true;

    public bool SmsEnabled { get; set; } = true;

    public bool InAppEnabled { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }
}