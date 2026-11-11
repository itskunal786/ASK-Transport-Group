using ASK.Group.Api.Data;
using ASK.Group.Api.DTOs;
using Microsoft.EntityFrameworkCore;

namespace ASK.Group.Api.Services;

public sealed class AdminFeedbackService
{
    private readonly AskTransportDbContext _db;

    public AdminFeedbackService(
        AskTransportDbContext db)
    {
        _db = db;
    }

    public async Task<AdminFeedbackListDto> GetAllAsync(
        int page,
        int pageSize,
        int? rating,
        string? search,
        CancellationToken cancellationToken = default)
    {
        if (page < 1)
            page = 1;

        if (pageSize < 1)
            pageSize = 10;

        if (pageSize > 100)
            pageSize = 100;

        var query = _db.DeliveryFeedbacks
            .AsNoTracking()
            .AsQueryable();

        if (rating.HasValue)
        {
            query = query.Where(x =>
                x.Rating == rating.Value);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            search = search.Trim();

            query = query.Where(x =>
                (x.Booking != null &&
                 x.Booking.BookingNumber.Contains(search)) ||
                (x.User != null &&
                 x.User.Name.Contains(search)) ||
                (x.User != null &&
                 x.User.Email.Contains(search)));
        }

        var totalRecords =
            await query.CountAsync(cancellationToken);

        var data = await query
            .OrderByDescending(x => x.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new AdminFeedbackDto
            {
                Id = x.Id,

                BookingNumber =
                    x.Booking != null
                        ? x.Booking.BookingNumber
                        : string.Empty,

                CustomerName =
                    x.User != null
                        ? x.User.Name
                        : string.Empty,

                CustomerEmail =
                    x.User != null
                        ? x.User.Email
                        : string.Empty,

                Rating = x.Rating,

                Comment = x.Comment,

                CreatedAt = x.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return new AdminFeedbackListDto
        {
            Page = page,
            PageSize = pageSize,
            TotalRecords = totalRecords,

            TotalPages = (int)Math.Ceiling(
                totalRecords / (double)pageSize),

            Data = data
        };
    }


    public async Task<FeedbackSummaryDto> GetSummaryAsync(
        CancellationToken cancellationToken = default)
    {
        var query = _db.DeliveryFeedbacks
            .AsNoTracking();

        var total =
            await query.CountAsync(cancellationToken);

        var average = total == 0
            ? 0
            : await query.AverageAsync(
                x => (double)x.Rating,
                cancellationToken);

        return new FeedbackSummaryDto
        {
            TotalFeedback = total,

            AverageRating =
                Math.Round(average, 2),

            FiveStar =
                await query.CountAsync(
                    x => x.Rating == 5,
                    cancellationToken),

            FourStar =
                await query.CountAsync(
                    x => x.Rating == 4,
                    cancellationToken),

            ThreeStar =
                await query.CountAsync(
                    x => x.Rating == 3,
                    cancellationToken),

            TwoStar =
                await query.CountAsync(
                    x => x.Rating == 2,
                    cancellationToken),

            OneStar =
                await query.CountAsync(
                    x => x.Rating == 1,
                    cancellationToken)
        };
    }
}
