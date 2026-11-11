using ASK.Group.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace ASK.Group.Api.Services;

public class BookingStatusService
{
    private readonly AskTransportDbContext _db;

    private static readonly Dictionary<string, string[]>
        AllowedTransitions =
            new(StringComparer.OrdinalIgnoreCase)
            {
                ["Pending"] =
                    ["Confirmed", "Cancelled"],

                ["Confirmed"] =
                    ["Assigned", "Cancelled"],

                ["Assigned"] =
                    ["Picked Up", "Cancelled"],

                ["Picked Up"] =
                    ["In Transit"],

                ["In Transit"] =
                    ["Delivered"],

                ["Delivered"] = [],

                ["Cancelled"] = []
            };

    public BookingStatusService(
        AskTransportDbContext db)
    {
        _db = db;
    }

    public bool CanChangeStatus(
        string currentStatus,
        string newStatus)
    {
        if (string.Equals(
                currentStatus,
                newStatus,
                StringComparison.OrdinalIgnoreCase))
        {
            return true;
        }

        if (!AllowedTransitions.TryGetValue(
                currentStatus,
                out var allowed))
        {
            return false;
        }

        return allowed.Contains(
            newStatus,
            StringComparer.OrdinalIgnoreCase);
    }

    public async Task<BookingStatusResult>
        ChangeStatusAsync(
            string bookingNumber,
            string newStatus)
    {
        if (string.IsNullOrWhiteSpace(
                bookingNumber))
        {
            return Fail(
                "Booking number is required");
        }

        if (string.IsNullOrWhiteSpace(
                newStatus))
        {
            return Fail(
                "Booking status is required");
        }

        bookingNumber =
            bookingNumber.Trim();

        newStatus =
            newStatus.Trim();

        if (!AllowedTransitions.ContainsKey(
                newStatus))
        {
            return Fail(
                "Invalid booking status");
        }

        var booking =
            await _db.Bookings
                .FirstOrDefaultAsync(x =>
                    x.BookingNumber ==
                    bookingNumber);

        if (booking == null)
        {
            return Fail(
                "Booking not found");
        }

        if (!CanChangeStatus(
                booking.BookingStatus,
                newStatus))
        {
            return Fail(
                $"Booking cannot move from " +
                $"{booking.BookingStatus} " +
                $"to {newStatus}");
        }

        if (string.Equals(
                booking.BookingStatus,
                newStatus,
                StringComparison.OrdinalIgnoreCase))
        {
            return new BookingStatusResult
            {
                Success = true,
                BookingNumber =
                    booking.BookingNumber,
                Status =
                    booking.BookingStatus,
                Message =
                    "Booking already has this status"
            };
        }

        booking.BookingStatus =
            newStatus;

        booking.UpdatedAt =
            DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return new BookingStatusResult
        {
            Success = true,
            BookingNumber =
                booking.BookingNumber,
            Status =
                booking.BookingStatus,
            Message =
                "Booking status updated successfully"
        };
    }

    private static BookingStatusResult Fail(
        string message)
    {
        return new BookingStatusResult
        {
            Success = false,
            Message = message
        };
    }
}

public class BookingStatusResult
{
    public bool Success { get; set; }

    public string? BookingNumber { get; set; }

    public string? Status { get; set; }

    public string Message { get; set; }
        = string.Empty;
}