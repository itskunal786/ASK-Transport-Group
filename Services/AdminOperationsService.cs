using ASK.Group.Api.Data;
using ASK.Group.Api.DTOs;
using Microsoft.EntityFrameworkCore;

namespace ASK.Group.Api.Services;

public class AdminOperationsService
{
    private readonly AskTransportDbContext _db;

    public AdminOperationsService(
        AskTransportDbContext db)
    {
        _db = db;
    }

    public async Task<AdminOperationsSummaryDto>
        GetSummaryAsync()
    {
        var result =
            new AdminOperationsSummaryDto();

        result.TotalBookings =
            await _db.Bookings.CountAsync();

        result.PendingBookings =
            await _db.Bookings.CountAsync(x =>
                x.BookingStatus == "Pending");

        result.ActiveBookings =
            await _db.Bookings.CountAsync(x =>
                x.BookingStatus == "Confirmed" ||
                x.BookingStatus == "Assigned" ||
                x.BookingStatus == "Picked Up" ||
                x.BookingStatus == "In Transit");

        result.DeliveredBookings =
            await _db.Bookings.CountAsync(x =>
                x.BookingStatus == "Delivered");

        result.CancelledBookings =
            await _db.Bookings.CountAsync(x =>
                x.BookingStatus == "Cancelled");

        result.TotalShipments =
            await _db.Shipments.CountAsync();

        result.InTransitShipments =
            await _db.Shipments.CountAsync(x =>
                x.Status == "In Transit");

        result.OutForDeliveryShipments =
            await _db.Shipments.CountAsync(x =>
                x.Status == "Out for Delivery");

        result.DeliveredShipments =
            await _db.Shipments.CountAsync(x =>
                x.Status == "Delivered");

        result.FailedDeliveries =
            await _db.Shipments.CountAsync(x =>
                x.Status == "Delivery Failed");

        result.TotalTrips =
            await _db.TransportTrips.CountAsync();

        result.ActiveTrips =
            await _db.TransportTrips.CountAsync(x =>
                x.Status == "Dispatched" ||
                x.Status == "In Transit");

        result.CompletedTrips =
            await _db.TransportTrips.CountAsync(x =>
                x.Status == "Completed");

        result.AvailableDrivers =
            await _db.Drivers.CountAsync(x =>
                x.IsActive &&
                x.IsAvailable);

        result.AvailableVehicles =
            await _db.Vehicles.CountAsync(x =>
                x.IsActive &&
                x.IsAvailable);

        result.PendingPayments =
            await _db.PaymentTransactions.CountAsync(x =>
                x.PaymentStatus == "Created");

        result.SuccessfulPayments =
            await _db.PaymentTransactions.CountAsync(x =>
                x.PaymentStatus == "Success");

        result.FailedPayments =
            await _db.PaymentTransactions.CountAsync(x =>
                x.PaymentStatus == "Failed");

        result.SuccessfulPaymentAmount =
            await _db.PaymentTransactions
                .Where(x =>
                    x.PaymentStatus == "Success")
                .SumAsync(x =>
                    (decimal?)x.Amount)
            ?? 0;

        return result;
    }

    public async Task<List<RecentActivityDto>>
        GetRecentActivityAsync()
    {
        var bookings =
            await _db.Bookings
                .AsNoTracking()
                .OrderByDescending(x =>
                    x.UpdatedAt ?? x.CreatedAt)
                .Take(10)
                .Select(x =>
                    new RecentActivityDto
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
                .ToListAsync();

        var shipments =
            await _db.Shipments
                .AsNoTracking()
                .OrderByDescending(x =>
                    x.UpdatedAt ?? x.CreatedAt)
                .Take(10)
                .Select(x =>
                    new RecentActivityDto
                    {
                        Type = "Shipment",

                        Reference =
                            x.Id.ToString(),

                        Status =
                            x.Status,

                        Date =
                            x.UpdatedAt ??
                            x.CreatedAt
                    })
                .ToListAsync();

        var trips =
            await _db.TransportTrips
                .AsNoTracking()
                .OrderByDescending(x =>
                    x.UpdatedAt ?? x.CreatedAt)
                .Take(10)
                .Select(x =>
                    new RecentActivityDto
                    {
                        Type = "Trip",

                        Reference =
                            x.Id.ToString(),

                        Status =
                            x.Status,

                        Date =
                            x.UpdatedAt ??
                            x.CreatedAt
                    })
                .ToListAsync();

        return bookings
            .Concat(shipments)
            .Concat(trips)
            .OrderByDescending(x => x.Date)
            .Take(20)
            .ToList();
    }
}