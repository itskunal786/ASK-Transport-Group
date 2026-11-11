using System.ComponentModel.DataAnnotations;

namespace ASK.Group.Api.DTOs;

public sealed class AdminSupportTicketDto
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public string TicketNumber { get; set; } = string.Empty;

    public string Subject { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string Category { get; set; } = string.Empty;

    public string Priority { get; set; } = string.Empty;

    public string Status { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public DateTime? ClosedAt { get; set; }

    public List<AdminSupportTicketReplyDto> Replies { get; set; }
        = new();
}


public sealed class AdminSupportTicketReplyDto
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public string Message { get; set; } = string.Empty;

    public bool IsStaffReply { get; set; }

    public DateTime CreatedAt { get; set; }
}


public sealed class AdminSupportTicketListDto
{
    public int Page { get; set; }

    public int PageSize { get; set; }

    public int TotalRecords { get; set; }

    public int TotalPages { get; set; }

    public List<AdminSupportTicketDto> Data { get; set; }
        = new();
}


public sealed class AdminSupportTicketReplyRequest
{
    [Required]
    [MaxLength(2000)]
    public string Message { get; set; } = string.Empty;
}


public sealed class UpdateSupportTicketStatusRequest
{
    [Required]
    [MaxLength(20)]
    public string Status { get; set; } = string.Empty;
}


public sealed class UpdateSupportTicketPriorityRequest
{
    [Required]
    [MaxLength(20)]
    public string Priority { get; set; } = string.Empty;
}