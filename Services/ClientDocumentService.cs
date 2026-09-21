using ASK.Group.Api.Data;
using ASK.Group.Api.DTOs;
using Microsoft.EntityFrameworkCore;

namespace ASK.Group.Api.Services;

public sealed class ClientDocumentService
{
    private readonly AskTransportDbContext _db;

    public ClientDocumentService(
        AskTransportDbContext db)
    {
        _db = db;
    }


    public async Task<ClientDocumentListDto>
        GetMyDocumentsAsync(
            int userId,
            int page,
            int pageSize,
            string? bookingNumber,
            string? documentType,
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


        var query =
            _db.BookingDocuments
                .AsNoTracking()
                .Where(x =>
                    x.Booking != null &&
                    x.Booking.UserId == userId);


        if (!string.IsNullOrWhiteSpace(
                bookingNumber))
        {
            bookingNumber =
                bookingNumber.Trim();

            query = query.Where(x =>
                x.Booking!.BookingNumber ==
                bookingNumber);
        }


        if (!string.IsNullOrWhiteSpace(
                documentType))
        {
            documentType =
                documentType.Trim();

            query = query.Where(x =>
                x.DocumentType ==
                documentType);
        }


        var totalRecords =
            await query.CountAsync(
                cancellationToken);


        var data =
            await query
                .OrderByDescending(x =>
                    x.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(x =>
                    new ClientDocumentDto
                    {
                        Id = x.Id,

                        BookingNumber =
                            x.Booking!.BookingNumber,

                        FileName =
                            x.OriginalFileName,

                        DocumentType =
                            x.DocumentType,

                        CreatedAt =
                            x.CreatedAt
                    })
                .ToListAsync(
                    cancellationToken);


        return new ClientDocumentListDto
        {
            Page = page,

            PageSize = pageSize,

            TotalRecords =
                totalRecords,

            TotalPages =
                (int)Math.Ceiling(
                    totalRecords /
                    (double)pageSize),

            Data = data
        };
    }


    public async Task<ClientDocumentDto?>
        GetDocumentAsync(
            int userId,
            int documentId,
            CancellationToken cancellationToken = default)
    {
        return await _db.BookingDocuments
            .AsNoTracking()
            .Where(x =>
                x.Id == documentId &&
                x.Booking != null &&
                x.Booking.UserId == userId)
            .Select(x =>
                new ClientDocumentDto
                {
                    Id = x.Id,

                    BookingNumber =
                        x.Booking!.BookingNumber,

                    FileName =
                        x.OriginalFileName,

                    DocumentType =
                        x.DocumentType,

                    CreatedAt =
                        x.CreatedAt
                })
            .FirstOrDefaultAsync(
                cancellationToken);
    }
}