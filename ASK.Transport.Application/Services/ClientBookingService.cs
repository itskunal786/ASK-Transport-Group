using ASK.Group.Api.Data;
using ASK.Group.Api.DTOs;
using Microsoft.EntityFrameworkCore;

namespace ASK.Group.Api.Services;

public sealed class ClientBookingService
{
    private readonly AskTransportDbContext _db;

    public ClientBookingService(
        AskTransportDbContext db)
    {
        _db = db;
    }


    public async Task<ClientBookingListDto> GetMyBookingsAsync(
        int userId,
        int page,
        int pageSize,
        string? search,
        string? status,
        DateTime? fromDate,
        DateTime? toDate,
        string? sortBy,
        string? sortOrder,
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


        var query = _db.Bookings
            .AsNoTracking()
            .Where(x => x.UserId == userId);


        // Search by booking number
        if (!string.IsNullOrWhiteSpace(search))
        {
            search = search.Trim();

            query = query.Where(x =>
                x.BookingNumber.Contains(search));
        }


        // Booking status filter
        if (!string.IsNullOrWhiteSpace(status))
        {
            status = status.Trim();

            query = query.Where(x =>
                x.BookingStatus == status);
        }


        // From date filter
        if (fromDate.HasValue)
        {
            var from =
                fromDate.Value.Date;

            query = query.Where(x =>
                x.CreatedAt >= from);
        }


        // To date filter
        if (toDate.HasValue)
        {
            var to =
                toDate.Value.Date.AddDays(1);

            query = query.Where(x =>
                x.CreatedAt < to);
        }


        var totalRecords =
            await query.CountAsync(
                cancellationToken);


        // Default sorting is newest first
        var descending =
            !string.Equals(
                sortOrder,
                "asc",
                StringComparison.OrdinalIgnoreCase);


        if (string.Equals(
            sortBy,
            "bookingNumber",
            StringComparison.OrdinalIgnoreCase))
        {
            query = descending
                ? query.OrderByDescending(
                    x => x.BookingNumber)
                : query.OrderBy(
                    x => x.BookingNumber);
        }
        else if (string.Equals(
            sortBy,
            "amount",
            StringComparison.OrdinalIgnoreCase))
        {
            query = descending
                ? query.OrderByDescending(
                    x => x.TotalAmount)
                : query.OrderBy(
                    x => x.TotalAmount);
        }
        else if (string.Equals(
            sortBy,
            "status",
            StringComparison.OrdinalIgnoreCase))
        {
            query = descending
                ? query.OrderByDescending(
                    x => x.BookingStatus)
                : query.OrderBy(
                    x => x.BookingStatus);
        }
        else
        {
            query = descending
                ? query.OrderByDescending(
                    x => x.CreatedAt)
                : query.OrderBy(
                    x => x.CreatedAt);
        }


        var data =
            await query
                .Skip(
                    (page - 1) * pageSize)
                .Take(pageSize)
                .Select(x =>
                    new ClientBookingDto
                    {
                        Id = x.Id,

                        BookingNumber =
                            x.BookingNumber,

                        BookingStatus =
                            x.BookingStatus,

                        PaymentStatus =
                            x.PaymentStatus,

                        TotalAmount =
                            x.TotalAmount,

                        CreatedAt =
                            x.CreatedAt
                    })
                .ToListAsync(
                    cancellationToken);


        return new ClientBookingListDto
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


    public async Task<ClientBookingDto?> GetBookingAsync(
        int userId,
        string bookingNumber,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(
            bookingNumber))
        {
            return null;
        }


        bookingNumber =
            bookingNumber.Trim();


        return await _db.Bookings
            .AsNoTracking()
            .Where(x =>
                x.UserId == userId &&
                x.BookingNumber ==
                    bookingNumber)
            .Select(x =>
                new ClientBookingDto
                {
                    Id = x.Id,

                    BookingNumber =
                        x.BookingNumber,

                    BookingStatus =
                        x.BookingStatus,

                    PaymentStatus =
                        x.PaymentStatus,

                    TotalAmount =
                        x.TotalAmount,

                    CreatedAt =
                        x.CreatedAt
                })
            .FirstOrDefaultAsync(
                cancellationToken);
    }


    public async Task<ClientBookingActionResult> CancelBookingAsync(
        int userId,
        string bookingNumber,
        string? reason,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(
            bookingNumber))
        {
            return ClientBookingActionResult.Fail(
                "Booking number is required.");
        }


        bookingNumber =
            bookingNumber.Trim();


        var booking =
            await _db.Bookings
                .FirstOrDefaultAsync(
                    x =>
                        x.UserId == userId &&
                        x.BookingNumber ==
                            bookingNumber,
                    cancellationToken);


        if (booking == null)
        {
            return ClientBookingActionResult.Fail(
                "Booking not found.");
        }


        if (booking.BookingStatus ==
            "Cancelled")
        {
            return ClientBookingActionResult.Ok(
                "Booking is already cancelled.");
        }


        if (booking.BookingStatus ==
            "Delivered")
        {
            return ClientBookingActionResult.Fail(
                "Delivered booking cannot be cancelled.");
        }


        if (booking.BookingStatus ==
                "Picked Up" ||
            booking.BookingStatus ==
                "In Transit")
        {
            return ClientBookingActionResult.Fail(
                "Booking cannot be cancelled after pickup.");
        }


        booking.BookingStatus =
            "Cancelled";

        booking.UpdatedAt =
            DateTime.UtcNow;


        await _db.SaveChangesAsync(
            cancellationToken);


        return ClientBookingActionResult.Ok(
            "Booking cancelled successfully.");
    }
}


public sealed class ClientBookingActionResult
{
    public bool Success { get; set; }

    public string Message { get; set; }
        = string.Empty;


    public static ClientBookingActionResult Ok(
        string message)
    {
        return new ClientBookingActionResult
        {
            Success = true,
            Message = message
        };
    }


    public static ClientBookingActionResult Fail(
        string message)
    {
        return new ClientBookingActionResult
        {
            Success = false,
            Message = message
        };
    }
}