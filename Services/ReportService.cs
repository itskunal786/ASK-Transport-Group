using ASK.Group.Api.Data;
using ASK.Group.Api.DTOs;
using Microsoft.EntityFrameworkCore;

namespace ASK.Group.Api.Services;

public class ReportService
{
    private readonly AskTransportDbContext _db;

    public ReportService(
        AskTransportDbContext db)
    {
        _db = db;
    }

    public async Task<DashboardKpiResponse>
        GetDashboardAsync(
            ReportFilterRequest filter)
    {
        var bookingQuery =
            _db.Bookings
                .AsNoTracking()
                .AsQueryable();

        if (filter.FromDate.HasValue)
        {
            bookingQuery = bookingQuery.Where(x =>
                x.CreatedAt >=
                filter.FromDate.Value);
        }

        if (filter.ToDate.HasValue)
        {
            var endDate =
                filter.ToDate.Value.Date
                    .AddDays(1);

            bookingQuery = bookingQuery.Where(x =>
                x.CreatedAt < endDate);
        }

        if (!string.IsNullOrWhiteSpace(
            filter.BookingStatus))
        {
            bookingQuery = bookingQuery.Where(x =>
                x.BookingStatus ==
                filter.BookingStatus);
        }

        if (!string.IsNullOrWhiteSpace(
            filter.PaymentStatus))
        {
            bookingQuery = bookingQuery.Where(x =>
                x.PaymentStatus ==
                filter.PaymentStatus);
        }

        var totalBookings =
            await bookingQuery.CountAsync();

        var delivered =
            await bookingQuery.CountAsync(x =>
                x.BookingStatus == "Delivered");

        var cancelled =
            await bookingQuery.CountAsync(x =>
                x.BookingStatus == "Cancelled");

        var activeShipments =
            await _db.Shipments.CountAsync(x =>
                x.Status != "Delivered");

        var pendingPayments =
            await bookingQuery.CountAsync(x =>
                x.PaymentStatus != "Paid" &&
                x.PaymentStatus != "Refunded");

        var totalRevenue =
            await _db.PaymentTransactions
                .Where(x =>
                    x.PaymentStatus == "Success" ||
                    x.PaymentStatus ==
                        "Partially Refunded")
                .SumAsync(x =>
                    (decimal?)x.Amount)
                ?? 0m;

        var totalRefunds =
            await _db.PaymentRefunds
                .Where(x =>
                    x.Status == "Processed")
                .SumAsync(x =>
                    (decimal?)x.Amount)
                ?? 0m;

        var totalDrivers =
            await _db.Drivers.CountAsync(x =>
                x.IsActive);

        var availableDrivers =
            await _db.Drivers.CountAsync(x =>
                x.IsActive &&
                x.IsAvailable);

        var totalVehicles =
            await _db.Vehicles.CountAsync(x =>
                x.IsActive);

        var availableVehicles =
            await _db.Vehicles.CountAsync(x =>
                x.IsActive &&
                x.IsAvailable);

        var activeTrips =
            await _db.TransportTrips.CountAsync(x =>
                x.Status == "Planned" ||
                x.Status == "In Transit");

        var deliverySuccessRate =
            totalBookings == 0
                ? 0
                : delivered * 100m /
                  totalBookings;

        var vehicleUtilization =
            totalVehicles == 0
                ? 0
                : (totalVehicles -
                   availableVehicles) *
                  100m / totalVehicles;

        var driverUtilization =
            totalDrivers == 0
                ? 0
                : (totalDrivers -
                   availableDrivers) *
                  100m / totalDrivers;

        return new DashboardKpiResponse
        {
            TotalBookings =
                totalBookings,

            ActiveShipments =
                activeShipments,

            DeliveredBookings =
                delivered,

            CancelledBookings =
                cancelled,

            PendingPayments =
                pendingPayments,

            AvailableDrivers =
                availableDrivers,

            AvailableVehicles =
                availableVehicles,

            ActiveTrips =
                activeTrips,

            TotalRevenue =
                Round(totalRevenue),

            TotalRefunds =
                Round(totalRefunds),

            NetRevenue =
                Round(
                    totalRevenue -
                    totalRefunds),

            DeliverySuccessRate =
                Round(deliverySuccessRate),

            VehicleUtilizationRate =
                Round(vehicleUtilization),

            DriverUtilizationRate =
                Round(driverUtilization)
        };
    }

    public async Task<object>
        GetMonthlyBookingsAsync(
            int year)
    {
        var data =
            await _db.Bookings
                .AsNoTracking()
                .Where(x =>
                    x.CreatedAt.Year == year)
                .GroupBy(x =>
                    x.CreatedAt.Month)
                .Select(x => new
                {
                    Month =
                        x.Key,

                    BookingCount =
                        x.Count(),

                    Revenue =
                        x.Sum(y =>
                            y.TotalAmount)
                })
                .OrderBy(x =>
                    x.Month)
                .ToListAsync();

        return data;
    }

    public async Task<object>
        GetBookingStatusSummaryAsync()
    {
        return await _db.Bookings
            .AsNoTracking()
            .GroupBy(x =>
                x.BookingStatus)
            .Select(x => new
            {
                Status =
                    x.Key,

                Count =
                    x.Count()
            })
            .OrderByDescending(x =>
                x.Count)
            .ToListAsync();
    }

    public async Task<object>
        GetPaymentSummaryAsync()
    {
        return await _db.PaymentTransactions
            .AsNoTracking()
            .GroupBy(x =>
                x.PaymentStatus)
            .Select(x => new
            {
                Status =
                    x.Key,

                Count =
                    x.Count(),

                Amount =
                    x.Sum(y =>
                        y.Amount)
            })
            .OrderByDescending(x =>
                x.Amount)
            .ToListAsync();
    }

    public async Task<object>
        GetTopRoutesAsync(
            int count = 10)
    {
        count =
            count < 1
                ? 10
                : Math.Min(count, 50);

        return await _db.Bookings
            .AsNoTracking()
            .GroupBy(x => new
            {
                x.FromCity,
                x.ToCity
            })
            .Select(x => new
            {
                x.Key.FromCity,
                x.Key.ToCity,

                BookingCount =
                    x.Count(),

                Revenue =
                    x.Sum(y =>
                        y.TotalAmount)
            })
            .OrderByDescending(x =>
                x.BookingCount)
            .Take(count)
            .ToListAsync();
    }

    public async Task<object>
        GetDriverPerformanceAsync()
    {
        return await _db.Drivers
            .AsNoTracking()
            .Select(x => new
            {
                x.Id,
                x.Name,
                x.Phone,
                x.IsActive,
                x.IsAvailable,
                x.Status,

                TotalTrips =
                    _db.TransportTrips.Count(t =>
                        t.DriverId == x.Id),

                CompletedTrips =
                    _db.TransportTrips.Count(t =>
                        t.DriverId == x.Id &&
                        t.Status ==
                        "Completed")
            })
            .OrderByDescending(x =>
                x.CompletedTrips)
            .ToListAsync();
    }

    public async Task<object>
        GetVehiclePerformanceAsync()
    {
        return await _db.Vehicles
            .AsNoTracking()
            .Select(x => new
            {
                x.Id,
                x.VehicleNumber,
                x.VehicleType,
                x.CapacityKg,
                x.IsActive,
                x.IsAvailable,
                x.Status,

                TotalTrips =
                    _db.TransportTrips.Count(t =>
                        t.VehicleId ==
                        x.Id),

                CompletedTrips =
                    _db.TransportTrips.Count(t =>
                        t.VehicleId ==
                        x.Id &&
                        t.Status ==
                        "Completed")
            })
            .OrderByDescending(x =>
                x.CompletedTrips)
            .ToListAsync();
    }

    private static decimal Round(
        decimal value)
    {
        return Math.Round(
            value,
            2,
            MidpointRounding.AwayFromZero);
    }
}