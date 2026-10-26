using ASK.Group.Api.Data;
using ASK.Group.Api.DTOs;
using ASK.Group.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace ASK.Group.Api.Services;

public sealed class ClientSupportTicketService
{
    private readonly AskTransportDbContext _db;

    public ClientSupportTicketService(AskTransportDbContext db)
    {
        _db = db;
    }

    public async Task<ClientSupportTicketListDto> GetMyTicketsAsync(
        int userId,
        int page,
        int pageSize,
        string? status,
        CancellationToken cancellationToken = default)
    {
        page = Math.Max(page, 1);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var query = _db.SupportTickets
            .AsNoTracking()
            .Where(x => x.UserId == userId);

        if (!string.IsNullOrWhiteSpace(status))
        {
            status = status.Trim();
            query = query.Where(x => x.Status == status);
        }

        var totalRecords = await query.CountAsync(cancellationToken);

        var data = await query
            .OrderByDescending(x => x.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new ClientSupportTicketDto
            {
                Id = x.Id,
                TicketNumber = x.TicketNumber,
                Subject = x.Subject,
                Description = x.Description,
                Category = x.Category,
                Priority = x.Priority,
                Status = x.Status,
                CreatedAt = x.CreatedAt,
                ClosedAt = x.ClosedAt
            })
            .ToListAsync(cancellationToken);

        return new ClientSupportTicketListDto
        {
            Page = page,
            PageSize = pageSize,
            TotalRecords = totalRecords,
            TotalPages = (int)Math.Ceiling(totalRecords / (double)pageSize),
            Data = data
        };
    }

    public async Task<ClientSupportTicketDto?> GetTicketAsync(
        int userId,
        string ticketNumber,
        CancellationToken cancellationToken = default)
    {
        return await _db.SupportTickets
            .AsNoTracking()
            .Where(x => x.UserId == userId && x.TicketNumber == ticketNumber)
            .Select(x => new ClientSupportTicketDto
            {
                Id = x.Id,
                TicketNumber = x.TicketNumber,
                Subject = x.Subject,
                Description = x.Description,
                Category = x.Category,
                Priority = x.Priority,
                Status = x.Status,
                CreatedAt = x.CreatedAt,
                ClosedAt = x.ClosedAt,
                Replies = x.Replies
                    .OrderBy(r => r.CreatedAt)
                    .Select(r => new ClientSupportTicketReplyDto
                    {
                        Id = r.Id,
                        Message = r.Message,
                        IsStaffReply = r.IsStaffReply,
                        CreatedAt = r.CreatedAt
                    })
                    .ToList()
            })
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<ClientSupportTicketDto> CreateAsync(
        int userId,
        CreateSupportTicketRequest request,
        CancellationToken cancellationToken = default)
    {
        var ticket = new SupportTicket
        {
            UserId = userId,
            TicketNumber = GenerateTicketNumber(),
            Subject = request.Subject.Trim(),
            Description = request.Description.Trim(),
            Category = request.Category.Trim(),
            Priority = request.Priority.Trim(),
            Status = "InProgress",
            CreatedAt = DateTime.UtcNow
        };

        _db.SupportTickets.Add(ticket);
        await _db.SaveChangesAsync(cancellationToken);

        // AI Automated First Response from Support Team
        var aiInitialReply = GenerateAiSupportResponse(ticket.Category, ticket.Subject, ticket.Description);
        var staffReply = new SupportTicketReply
        {
            SupportTicketId = ticket.Id,
            UserId = userId,
            Message = aiInitialReply,
            IsStaffReply = true, // Official Support Team Response
            CreatedAt = DateTime.UtcNow.AddSeconds(1)
        };

        _db.SupportTicketReplies.Add(staffReply);
        await _db.SaveChangesAsync(cancellationToken);

        return new ClientSupportTicketDto
        {
            Id = ticket.Id,
            TicketNumber = ticket.TicketNumber,
            Subject = ticket.Subject,
            Description = ticket.Description,
            Category = ticket.Category,
            Priority = ticket.Priority,
            Status = ticket.Status,
            CreatedAt = ticket.CreatedAt
        };
    }

    public async Task<bool> AddReplyAsync(
        int userId,
        string ticketNumber,
        string message,
        CancellationToken cancellationToken = default)
    {
        var ticket = await _db.SupportTickets
            .FirstOrDefaultAsync(x => x.UserId == userId && x.TicketNumber == ticketNumber, cancellationToken);

        if (ticket == null || ticket.Status == "Closed")
        {
            return false;
        }

        // 1. Customer's message
        var userReply = new SupportTicketReply
        {
            SupportTicketId = ticket.Id,
            UserId = userId,
            Message = message.Trim(),
            IsStaffReply = false,
            CreatedAt = DateTime.UtcNow
        };
        _db.SupportTicketReplies.Add(userReply);

        // 2. Automated AI Support Follow-up Response
        var aiReplyText = GenerateAiFollowupResponse(ticket.Category, message.Trim());
        var staffReply = new SupportTicketReply
        {
            SupportTicketId = ticket.Id,
            UserId = userId,
            Message = aiReplyText,
            IsStaffReply = true, // Support Team AI
            CreatedAt = DateTime.UtcNow.AddSeconds(2)
        };
        _db.SupportTicketReplies.Add(staffReply);

        ticket.Status = "InProgress";
        ticket.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<bool> CloseAsync(
        int userId,
        string ticketNumber,
        CancellationToken cancellationToken = default)
    {
        var ticket = await _db.SupportTickets
            .FirstOrDefaultAsync(x => x.UserId == userId && x.TicketNumber == ticketNumber, cancellationToken);

        if (ticket == null) return false;
        if (ticket.Status == "Closed") return true;

        ticket.Status = "Closed";
        ticket.ClosedAt = DateTime.UtcNow;
        ticket.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(cancellationToken);
        return true;
    }

    private static string GenerateAiSupportResponse(string category, string subject, string description)
    {
        var cat = (category ?? "").ToLower();
        if (cat.Contains("shipment") || cat.Contains("delivery"))
        {
            return $"Namaste! I am your ASK Transport AI Support Assistant. We have prioritized your query regarding '{subject}'. Our fleet operations desk has been notified and current telemetry is being verified with the dispatch hub. We will keep you updated.";
        }
        if (cat.Contains("booking") || cat.Contains("pickup"))
        {
            return $"Hello! Thank you for contacting ASK Transport. We have logged your request regarding '{subject}'. A pickup coordinator at your origin hub is reviewing the vehicle schedule and route dispatch.";
        }
        if (cat.Contains("billing") || cat.Contains("invoice") || cat.Contains("payment"))
        {
            return $"Hello! Your query regarding '{subject}' has been assigned to our Billing & Accounts desk. Payment transactions and GST invoices are cross-verified automatically in the Invoices tab.";
        }
        return $"Hello! Thank you for contacting ASK Transport Support. We have logged your ticket regarding '{subject}'. Our support operations team is actively reviewing your notes and will assist you shortly.";
    }

    private static string GenerateAiFollowupResponse(string category, string message)
    {
        var msg = message.ToLower();
        if (msg.Contains("status") || msg.Contains("kaha") || msg.Contains("where") || msg.Contains("update") || msg.Contains("delay"))
        {
            return "Our system indicates your request has been escalated to the on-duty Hub Supervisor. Telemetry is being refreshed. Thank you for your patience.";
        }
        if (msg.Contains("thank") || msg.Contains("ok") || msg.Contains("theek") || msg.Contains("done"))
        {
            return "You're very welcome! If your issue has been resolved, you can close this ticket anytime using the 'Close Ticket' button above. Have a great day!";
        }
        return "Thank you for the update. We have attached these additional notes to your active ticket file. A support executive or automated update will follow shortly.";
    }

    private static string GenerateTicketNumber()
    {
        var date = DateTime.UtcNow.ToString("yyyyMMdd");
        var random = Random.Shared.Next(100000, 999999);
        return $"ASK-{date}-{random}";
    }
}
