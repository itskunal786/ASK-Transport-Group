namespace ASK.Group.Api.DTOs;

public class RecentActivityDto
{
    public string Type { get; set; }
        = string.Empty;

    public string Reference { get; set; }
        = string.Empty;

    public string Status { get; set; }
        = string.Empty;

    public DateTime Date { get; set; }
}