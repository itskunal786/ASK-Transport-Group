using ASK.Group.Api.Data;
using ASK.Group.Api.DTOs;
using Microsoft.EntityFrameworkCore;

namespace ASK.Group.Api.Services;

public sealed class ClientInvoiceService
{
    private readonly AskTransportDbContext _db;

    public ClientInvoiceService(
        AskTransportDbContext db)
    {
        _db = db;
    }


    public async Task<ClientInvoiceListDto> GetMyInvoicesAsync(
        int userId,
        int page,
        int pageSize,
        string? status,
        CancellationToken cancellationToken = default)
    {
        if (page < 1)
        {
            page = 1;
        }

        if (pageSize < 1)
        {
            pageSize = 10;
        }

        if (pageSize > 100)
        {
            pageSize = 100;
        }


        var query = _db.Invoices
            .AsNoTracking()
            .Where(x =>
                x.Booking != null &&
                x.Booking.UserId == userId);


        if (!string.IsNullOrWhiteSpace(status))
        {
            status = status.Trim();

            query = query.Where(x =>
                x.PaymentStatus == status);
        }


        var totalRecords =
            await query.CountAsync(cancellationToken);


        var data =
            await query
                .OrderByDescending(x => x.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(x => new ClientInvoiceDto
                {
                    Id = x.Id,

                    BookingNumber =
                        x.Booking!.BookingNumber,

                    InvoiceNumber =
                        x.InvoiceNumber,

                    TotalAmount =
                        x.TotalAmount,

                    PaymentStatus =
                        x.PaymentStatus,

                    CreatedAt =
                        x.CreatedAt
                })
                .ToListAsync(cancellationToken);


        return new ClientInvoiceListDto
        {
            Page = page,

            PageSize = pageSize,

            TotalRecords = totalRecords,

            TotalPages =
                (int)Math.Ceiling(
                    totalRecords / (double)pageSize),

            Data = data
        };
    }


    public async Task<ClientInvoiceDto?> GetInvoiceAsync(
        int userId,
        int invoiceId,
        CancellationToken cancellationToken = default)
    {
        if (invoiceId <= 0)
        {
            return null;
        }


        return await _db.Invoices
            .AsNoTracking()
            .Where(x =>
                x.Id == invoiceId &&
                x.Booking != null &&
                x.Booking.UserId == userId)
            .Select(x => new ClientInvoiceDto
            {
                Id = x.Id,

                BookingNumber =
                    x.Booking!.BookingNumber,

                InvoiceNumber =
                    x.InvoiceNumber,

                TotalAmount =
                    x.TotalAmount,

                PaymentStatus =
                    x.PaymentStatus,

                CreatedAt =
                    x.CreatedAt
            })
            .FirstOrDefaultAsync(cancellationToken);
    }
}