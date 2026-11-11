using ASK.Group.Api.Data;
using ASK.Group.Api.DTOs;
using ASK.Group.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace ASK.Group.Api.Services;

public sealed class DeliveryFeedbackService
{
    private readonly AskTransportDbContext _db;

    public DeliveryFeedbackService(
        AskTransportDbContext db)
    {
        _db = db;
    }

    public async Task<DeliveryFeedbackDto> CreateAsync(
        int userId,
        string bookingNumber,
        CreateDeliveryFeedbackRequest request,
        CancellationToken cancellationToken = default)
    {
        var booking = await _db.Bookings
            .AsNoTracking()
            .FirstOrDefaultAsync(
                x => x.UserId == userId &&
                     x.BookingNumber == bookingNumber,
                cancellationToken);

        if (booking == null)
            throw new InvalidOperationException(
                "Booking not found.");

        if (booking.BookingStatus != "Delivered")
            throw new InvalidOperationException(
                "Feedback can be submitted only after delivery.");

        var exists = await _db.DeliveryFeedbacks
            .AnyAsync(
                x => x.BookingId == booking.Id &&
                     x.UserId == userId,
                cancellationToken);

        if (exists)
            throw new InvalidOperationException(
                "Feedback already submitted.");

        var feedback = new DeliveryFeedback
        {
            BookingId = booking.Id,
            UserId = userId,
            Rating = request.Rating,
            Comment = request.Comment?.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        _db.DeliveryFeedbacks.Add(feedback);

        await _db.SaveChangesAsync(
            cancellationToken);

        return new DeliveryFeedbackDto
        {
            Id = feedback.Id,
            BookingNumber = booking.BookingNumber,
            Rating = feedback.Rating,
            Comment = feedback.Comment,
            CreatedAt = feedback.CreatedAt
        };
    }


    public async Task<List<DeliveryFeedbackDto>>
        GetMyFeedbackAsync(
            int userId,
            CancellationToken cancellationToken = default)
    {
        return await _db.DeliveryFeedbacks
            .AsNoTracking()
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.CreatedAt)
            .Select(x => new DeliveryFeedbackDto
            {
                Id = x.Id,

                BookingNumber =
                    x.Booking != null
                        ? x.Booking.BookingNumber
                        : string.Empty,

                Rating = x.Rating,
                Comment = x.Comment,
                CreatedAt = x.CreatedAt
            })
            .ToListAsync(cancellationToken);
    }
}
