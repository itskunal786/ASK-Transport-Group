using ASK.Group.Api.Data;
using ASK.Group.Api.DTOs;
using ASK.Group.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace ASK.Group.Api.Services;

public sealed class ClientSupportTicketService
{
    private readonly AskTransportDbContext _db;

    public ClientSupportTicketService(
        AskTransportDbContext db)
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

            query = query.Where(x =>
                x.Status == status);
        }


        var totalRecords =
            await query.CountAsync(cancellationToken);


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

            TotalPages = (int)Math.Ceiling(
                totalRecords / (double)pageSize),

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
            .Where(x =>
                x.UserId == userId &&
                x.TicketNumber == ticketNumber)
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
                    .Select(r =>
                        new ClientSupportTicketReplyDto
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

            TicketNumber =
                GenerateTicketNumber(),

            Subject =
                request.Subject.Trim(),

            Description =
                request.Description.Trim(),

            Category =
                request.Category.Trim(),

            Priority =
                request.Priority.Trim(),

            Status = "Open",

            CreatedAt = DateTime.UtcNow
        };


        _db.SupportTickets.Add(ticket);

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
        var ticket =
            await _db.SupportTickets
                .FirstOrDefaultAsync(
                    x =>
                        x.UserId == userId &&
                        x.TicketNumber == ticketNumber,
                    cancellationToken);


        if (ticket == null)
        {
            return false;
        }


        if (ticket.Status == "Closed")
        {
            return false;
        }


        var reply = new SupportTicketReply
        {
            SupportTicketId = ticket.Id,

            UserId = userId,

            Message = message.Trim(),

            IsStaffReply = false,

            CreatedAt = DateTime.UtcNow
        };


        _db.SupportTicketReplies.Add(reply);

        ticket.UpdatedAt = DateTime.UtcNow;


        await _db.SaveChangesAsync(cancellationToken);

        return true;
    }


    public async Task<bool> CloseAsync(
        int userId,
        string ticketNumber,
        CancellationToken cancellationToken = default)
    {
        var ticket =
            await _db.SupportTickets
                .FirstOrDefaultAsync(
                    x =>
                        x.UserId == userId &&
                        x.TicketNumber == ticketNumber,
                    cancellationToken);


        if (ticket == null)
        {
            return false;
        }


        if (ticket.Status == "Closed")
        {
            return true;
        }


        ticket.Status = "Closed";

        ticket.ClosedAt = DateTime.UtcNow;

        ticket.UpdatedAt = DateTime.UtcNow;


        await _db.SaveChangesAsync(cancellationToken);

        return true;
    }


    private static string GenerateTicketNumber()
    {
        return $"ASK-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid():N}"
            .Substring(0, 21)
            .ToUpperInvariant();
    }
}