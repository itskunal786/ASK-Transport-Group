namespace ASK.Group.Api.DTOs;

public sealed class NotificationPreferenceDto
{
    public bool EmailEnabled { get; set; }

    public bool SmsEnabled { get; set; }

    public bool InAppEnabled { get; set; }
}


public sealed class UpdateNotificationPreferenceRequest
{
    public bool EmailEnabled { get; set; }

    public bool SmsEnabled { get; set; }

    public bool InAppEnabled { get; set; }
}