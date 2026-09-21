using ASK.Group.Api.Data;
using ASK.Group.Api.DTOs;
using Microsoft.EntityFrameworkCore;

namespace ASK.Group.Api.Services;

public sealed class ClientDashboardService
{
    private readonly AskTransportDbContext _db;

    public ClientDashboardService(
        AskTransportDbContext db)
    {
        _db = db;
    }


    public async Task<ClientDashboardDto> GetDashboardAsync(
        int userId,
        CancellationToken cancellationToken = default)
    {
        var result = new ClientDashboardDto();


        // -----------------------------
        // BOOKINGS
        // -----------------------------

        var bookings = _db.Bookings
            .AsNoTracking()
            .Where(x => x.UserId == userId);


        result.TotalBookings =
            await bookings.CountAsync(cancellationToken);


        result.DeliveredBookings =
            await bookings.CountAsync(
                x => x.BookingStatus == "Delivered",
                cancellationToken);


        result.CancelledBookings =
            await bookings.CountAsync(
                x => x.BookingStatus == "Cancelled",
                cancellationToken);


        result.ActiveBookings =
            await bookings.CountAsync(
                x =>
                    x.BookingStatus != "Delivered" &&
                    x.BookingStatus != "Cancelled",
                cancellationToken);


        // -----------------------------
        // SHIPMENTS
        // -----------------------------

        var shipments = _db.Shipments
            .AsNoTracking()
            .Where(x =>
                x.Booking != null &&
                x.Booking.UserId == userId);


        result.TotalShipments =
            await shipments.CountAsync(cancellationToken);


        result.DeliveredShipments =
            await shipments.CountAsync(
                x => x.Status == "Delivered",
                cancellationToken);


        result.ActiveShipments =
            await shipments.CountAsync(
                x =>
                    x.Status != "Delivered" &&
                    x.Status != "Cancelled",
                cancellationToken);


        // -----------------------------
        // PAYMENTS
        // -----------------------------

        var payments = _db.PaymentTransactions
            .AsNoTracking()
            .Where(x =>
                x.Booking != null &&
                x.Booking.UserId == userId);


        result.PendingPayments =
            await payments.CountAsync(
                x =>
                    x.PaymentStatus == "Created" ||
                    x.PaymentStatus == "Pending",
                cancellationToken);


        result.SuccessfulPayments =
            await payments.CountAsync(
                x => x.PaymentStatus == "Success",
                cancellationToken);


        result.TotalAmountPaid =
            await payments
                .Where(x =>
                    x.PaymentStatus == "Success")
                .SumAsync(
                    x => (decimal?)x.Amount,
                    cancellationToken)
            ?? 0;


        // -----------------------------
        // NOTIFICATIONS
        // -----------------------------

        result.UnreadNotifications =
            await _db.Notifications
                .AsNoTracking()
                .CountAsync(
                    x =>
                        x.UserId == userId &&
                        !x.IsRead,
                    cancellationToken);


        // -----------------------------
        // RECENT BOOKINGS
        // -----------------------------

        result.RecentBookings =
            await bookings
                .OrderByDescending(x => x.CreatedAt)
                .Take(5)
                .Select(x =>
                    new ClientRecentBookingDto
                    {
                        Id = x.Id,

                        BookingNumber =
                            x.BookingNumber,

                        Status =
                            x.BookingStatus,

                        PaymentStatus =
                            x.PaymentStatus,

                        TotalAmount =
                            x.TotalAmount,

                        CreatedAt =
                            x.CreatedAt
                    })
                .ToListAsync(cancellationToken);


        // -----------------------------
        // RECENT ACTIVITY
        // -----------------------------

        var bookingActivity =
            await bookings
                .OrderByDescending(x =>
                    x.UpdatedAt ?? x.CreatedAt)
                .Take(5)
                .Select(x =>
                    new ClientRecentActivityDto
                    {
                        Type = "Booking",

                        Reference =
                            x.BookingNumber,

                        Status =
                            x.BookingStatus,

                        Date =
                            x.UpdatedAt ??
                            x.CreatedAt
                    })
                .ToListAsync(cancellationToken);

        var shipmentActivity =
            await shipments
                .OrderByDescending(x =>
                    x.UpdatedAt ?? x.CreatedAt)
                .Take(5)
                .Select(x =>
                    new ClientRecentActivityDto
                    {
                        Type = "Shipment",

                        Reference =
                            x.ShipmentNumber,

                        Status =
                            x.Status,

                        Date =
                            x.UpdatedAt ??
                            x.CreatedAt
                    })
                .ToListAsync(cancellationToken);


        var paymentActivity =
    await payments
        .OrderByDescending(x =>
            x.PaidAt ?? x.CreatedAt)
        .Take(5)
        .Select(x =>
            new ClientRecentActivityDto
            {
                Type = "Payment",

                Reference =
                    x.TransactionId,

                Status =
                    x.PaymentStatus,

                Date =
                    x.PaidAt ??
                    x.CreatedAt
            })
        .ToListAsync(cancellationToken);


        result.RecentActivity =
            bookingActivity
                .Concat(shipmentActivity)
                .Concat(paymentActivity)
                .OrderByDescending(x => x.Date)
                .Take(10)
                .ToList();

        return result;
    }
}
