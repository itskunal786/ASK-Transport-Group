namespace ASK.Group.Api.Models;

public sealed class SupportTicket : BaseEntity
{
    public int UserId { get; set; }

    public string TicketNumber { get; set; } = string.Empty;

    public string Subject { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string Category { get; set; } = "General";

    public string Priority { get; set; } = "Normal";

    public string Status { get; set; } = "Open";

    public DateTime? ClosedAt { get; set; }

    public ICollection<SupportTicketReply> Replies { get; set; }
        = new List<SupportTicketReply>();
}