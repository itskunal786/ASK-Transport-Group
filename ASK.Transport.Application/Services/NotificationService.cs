using ASK.Group.Api.Data;
using ASK.Group.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace ASK.Group.Api.Services;

public class NotificationService
{
    private readonly AskTransportDbContext _db;

    public NotificationService(
        AskTransportDbContext db)
    {
        _db = db;
    }


    public async Task CreateAsync(
        int userId,
        string title,
        string message,
        string type = "General",
        int? bookingId = null)
    {
        var preference =
            await _db.NotificationPreferences
                .AsNoTracking()
                .FirstOrDefaultAsync(x =>
                    x.UserId == userId);


        // No preference record = enabled by default
        if (preference != null &&
            !preference.InAppEnabled)
        {
            return;
        }


        var notification =
            new Notification
            {
                UserId = userId,

                BookingId =
                    bookingId,

                Title =
                    title.Trim(),

                Message =
                    message.Trim(),

                Type =
                    type.Trim(),

                IsRead =
                    false,

                CreatedAt =
                    DateTime.UtcNow
            };


        _db.Notifications.Add(
            notification);

        await _db.SaveChangesAsync();
    }


    public async Task CreateBookingStatusAsync(
        Booking booking,
        string status)
    {
        var title =
            $"Booking {status}";

        var message =
            $"Your booking {booking.BookingNumber} status has been updated to {status}.";


        await CreateAsync(
            booking.UserId,
            title,
            message,
            "Booking",
            booking.Id);
    }


    public async Task CreatePaymentAsync(
        Booking booking)
    {
        await CreateAsync(
            booking.UserId,
            "Payment Successful",
            $"Payment for booking {booking.BookingNumber} has been completed successfully.",
            "Payment",
            booking.Id);
    }


    public async Task CreateInvoiceAsync(
        Booking booking,
        string invoiceNumber)
    {
        await CreateAsync(
            booking.UserId,
            "Invoice Generated",
            $"Invoice {invoiceNumber} has been generated for booking {booking.BookingNumber}.",
            "Invoice",
            booking.Id);
    }
}