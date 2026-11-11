using ASK.Group.Api.Data;
using ASK.Group.Api.DTOs;
using ASK.Group.Api.Extensions;
using Microsoft.EntityFrameworkCore;

namespace ASK.Group.Api.Services;

public class BookingQueryService
{
    private readonly AskTransportDbContext _db;

    public BookingQueryService(
        AskTransportDbContext db)
    {
        _db = db;
    }

    public async Task<
        PagedResult<BookingListResponse>>
        GetAsync(
            BookingFilterRequest request,
            int? restrictToUserId = null,
            CancellationToken cancellationToken =
                default)
    {
        var query =
            _db.Bookings
                .AsNoTracking()
                .AsQueryable();

        if (restrictToUserId.HasValue)
        {
            query = query.Where(x =>
                x.UserId ==
                restrictToUserId.Value);
        }
        else if (request.UserId.HasValue)
        {
            query = query.Where(x =>
                x.UserId ==
                request.UserId.Value);
        }

        if (!string.IsNullOrWhiteSpace(
            request.Search))
        {
            var search =
                request.Search
                    .Trim();

            query = query.Where(x =>
                x.BookingNumber.Contains(
                    search) ||
                x.SenderName.Contains(
                    search) ||
                x.SenderPhone.Contains(
                    search) ||
                x.ReceiverName.Contains(
                    search) ||
                x.ReceiverPhone.Contains(
                    search) ||
                x.FromCity.Contains(
                    search) ||
                x.ToCity.Contains(
                    search));
        }

        if (!string.IsNullOrWhiteSpace(
            request.BookingStatus))
        {
            var status =
                request.BookingStatus
                    .Trim();

            query = query.Where(x =>
                x.BookingStatus ==
                status);
        }

        if (!string.IsNullOrWhiteSpace(
            request.PaymentStatus))
        {
            var status =
                request.PaymentStatus
                    .Trim();

            query = query.Where(x =>
                x.PaymentStatus ==
                status);
        }

        if (request.TransportServiceId
            .HasValue)
        {
            query = query.Where(x =>
                x.TransportServiceId ==
                request.TransportServiceId
                    .Value);
        }

        if (!string.IsNullOrWhiteSpace(
            request.FromCity))
        {
            var city =
                request.FromCity
                    .Trim();

            query = query.Where(x =>
                x.FromCity ==
                city);
        }

        if (!string.IsNullOrWhiteSpace(
            request.ToCity))
        {
            var city =
                request.ToCity
                    .Trim();

            query = query.Where(x =>
                x.ToCity ==
                city);
        }

        if (request.FromDate.HasValue)
        {
            var fromDate =
                request.FromDate
                    .Value.Date;

            query = query.Where(x =>
                x.CreatedAt >=
                fromDate);
        }

        if (request.ToDate.HasValue)
        {
            var toDate =
                request.ToDate
                    .Value.Date
                    .AddDays(1);

            query = query.Where(x =>
                x.CreatedAt <
                toDate);
        }

        query =
            ApplySorting(
                query,
                request.SortBy,
                request.SortDirection);

        var projected =
            query.Select(x =>
                new BookingListResponse
                {
                    Id =
                        x.Id,

                    BookingNumber =
                        x.BookingNumber,

                    SenderName =
                        x.SenderName,

                    ReceiverName =
                        x.ReceiverName,

                    FromCity =
                        x.FromCity,

                    ToCity =
                        x.ToCity,

                    Weight =
                        x.Weight,

                    TotalAmount =
                        x.TotalAmount,

                    BookingStatus =
                        x.BookingStatus,

                    PaymentStatus =
                        x.PaymentStatus,

                    PickupDate =
                        x.PickupDate,

                    CreatedAt =
                        x.CreatedAt
                });

        return await projected
            .ToPagedResultAsync(
                request.Page,
                request.PageSize,
                cancellationToken);
    }

    private static IQueryable<
        Models.Booking> ApplySorting(
            IQueryable<Models.Booking> query,
            string? sortBy,
            string? direction)
    {
        var descending =
            !string.Equals(
                direction,
                "asc",
                StringComparison.OrdinalIgnoreCase);

        var field =
            sortBy?
                .Trim()
                .ToLowerInvariant();

        return field switch
        {
            "bookingnumber" =>
                descending
                    ? query.OrderByDescending(
                        x => x.BookingNumber)
                    : query.OrderBy(
                        x => x.BookingNumber),

            "pickupdate" =>
                descending
                    ? query.OrderByDescending(
                        x => x.PickupDate)
                    : query.OrderBy(
                        x => x.PickupDate),

            "totalamount" =>
                descending
                    ? query.OrderByDescending(
                        x => x.TotalAmount)
                    : query.OrderBy(
                        x => x.TotalAmount),

            "bookingstatus" =>
                descending
                    ? query.OrderByDescending(
                        x => x.BookingStatus)
                    : query.OrderBy(
                        x => x.BookingStatus),

            "paymentstatus" =>
                descending
                    ? query.OrderByDescending(
                        x => x.PaymentStatus)
                    : query.OrderBy(
                        x => x.PaymentStatus),

            _ =>
                descending
                    ? query.OrderByDescending(
                        x => x.CreatedAt)
                    : query.OrderBy(
                        x => x.CreatedAt)
        };
    }
}
