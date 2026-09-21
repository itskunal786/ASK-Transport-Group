namespace ASK.Group.Api.Models;

public sealed class SupportTicketReply : BaseEntity
{
    public int SupportTicketId { get; set; }

    public int UserId { get; set; }

    public string Message { get; set; } = string.Empty;

    public bool IsStaffReply { get; set; }

    public SupportTicket? SupportTicket { get; set; }
}