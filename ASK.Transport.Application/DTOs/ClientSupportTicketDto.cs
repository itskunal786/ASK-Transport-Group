using System.ComponentModel.DataAnnotations;

namespace ASK.Group.Api.DTOs;

public sealed class CreateSupportTicketRequest
{
    [Required]
    [MaxLength(200)]
    public string Subject { get; set; } = string.Empty;

    [Required]
    [MaxLength(2000)]
    public string Description { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string Category { get; set; } = "General";

    [MaxLength(20)]
    public string Priority { get; set; } = "Normal";
}


public sealed class AddSupportTicketReplyRequest
{
    [Required]
    [MaxLength(2000)]
    public string Message { get; set; } = string.Empty;
}


public sealed class ClientSupportTicketDto
{
    public int Id { get; set; }

    public string TicketNumber { get; set; } = string.Empty;

    public string Subject { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string Category { get; set; } = string.Empty;

    public string Priority { get; set; } = string.Empty;

    public string Status { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }

    public DateTime? ClosedAt { get; set; }

    public List<ClientSupportTicketReplyDto> Replies { get; set; }
        = new();
}


public sealed class ClientSupportTicketReplyDto
{
    public int Id { get; set; }

    public string Message { get; set; } = string.Empty;

    public bool IsStaffReply { get; set; }

    public DateTime CreatedAt { get; set; }
}


public sealed class ClientSupportTicketListDto
{
    public int Page { get; set; }

    public int PageSize { get; set; }

    public int TotalRecords { get; set; }

    public int TotalPages { get; set; }

    public List<ClientSupportTicketDto> Data { get; set; }
        = new();
}