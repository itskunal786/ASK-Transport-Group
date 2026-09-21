using ASK.Group.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace ASK.Group.Api.Services;

public class AdvancedAnalyticsService
{
    private readonly AskTransportDbContext _db;

    public AdvancedAnalyticsService(
        AskTransportDbContext db)
    {
        _db = db;
    }

    public async Task<ExecutiveAnalyticsResult>
        GetExecutiveDashboardAsync(
            DateTime? from,
            DateTime? to,
            CancellationToken cancellationToken = default)
    {
        var range =
            NormalizeRange(
                from,
                to);

        var bookingQuery =
            _db.Bookings
                .AsNoTracking()
                .Where(x =>
                    x.CreatedAt >= range.From &&
                    x.CreatedAt < range.ToExclusive);

        var paymentQuery =
            _db.PaymentTransactions
                .AsNoTracking()
                .Where(x =>
                    x.CreatedAt >= range.From &&
                    x.CreatedAt < range.ToExclusive);

        var shipmentQuery =
            _db.Shipments
                .AsNoTracking()
                .Where(x =>
                    x.CreatedAt >= range.From &&
                    x.CreatedAt < range.ToExclusive);

        var tripQuery =
            _db.TransportTrips
                .AsNoTracking()
                .Where(x =>
                    x.CreatedAt >= range.From &&
                    x.CreatedAt < range.ToExclusive);

        var totalBookings =
            await bookingQuery.CountAsync(
                cancellationToken);

        var deliveredBookings =
            await bookingQuery.CountAsync(
                x =>
                    x.BookingStatus ==
                    "Delivered",
                cancellationToken);

        var cancelledBookings =
            await bookingQuery.CountAsync(
                x =>
                    x.BookingStatus ==
                    "Cancelled",
                cancellationToken);

        var activeBookings =
            totalBookings -
            deliveredBookings -
            cancelledBookings;

        var totalBookedValue =
            await bookingQuery
                .SumAsync(
                    x =>
                        (decimal?)x.TotalAmount,
                    cancellationToken)
            ?? 0;

        var successfulRevenue =
            await paymentQuery
                .Where(x =>
                    x.PaymentStatus ==
                    "Success")
                .SumAsync(
                    x =>
                        (decimal?)x.Amount,
                    cancellationToken)
            ?? 0;

        var successfulPayments =
            await paymentQuery.CountAsync(
                x =>
                    x.PaymentStatus ==
                    "Success",
                cancellationToken);

        var failedPayments =
            await paymentQuery.CountAsync(
                x =>
                    x.PaymentStatus ==
                    "Failed",
                cancellationToken);

        var totalShipments =
            await shipmentQuery.CountAsync(
                cancellationToken);

        var deliveredShipments =
            await shipmentQuery.CountAsync(
                x =>
                    x.Status ==
                    "Delivered",
                cancellationToken);

        var totalTrips =
            await tripQuery.CountAsync(
                cancellationToken);

        var completedTrips =
            await tripQuery.CountAsync(
                x =>
                    x.Status ==
                    "Completed",
                cancellationToken);

        var averageBookingValue =
            totalBookings == 0
                ? 0
                : Math.Round(
                    totalBookedValue /
                    totalBookings,
                    2);

        var deliveryRate =
            Percentage(
                deliveredBookings,
                totalBookings);

        var shipmentDeliveryRate =
            Percentage(
                deliveredShipments,
                totalShipments);

        var tripCompletionRate =
            Percentage(
                completedTrips,
                totalTrips);

        var paymentSuccessRate =
            Percentage(
                successfulPayments,
                successfulPayments +
                failedPayments);

        var onTimeDeliveries =
            await bookingQuery.CountAsync(
                x =>
                    x.BookingStatus ==
                        "Delivered" &&
                    x.DeliveredDate
                        .HasValue &&
                    x.ExpectedDeliveryDate
                        .HasValue &&
                    x.DeliveredDate.Value <=
                    x.ExpectedDeliveryDate.Value,
                cancellationToken);

        var deliveryWithDates =
            await bookingQuery.CountAsync(
                x =>
                    x.BookingStatus ==
                        "Delivered" &&
                    x.DeliveredDate
                        .HasValue &&
                    x.ExpectedDeliveryDate
                        .HasValue,
                cancellationToken);

        var onTimeDeliveryRate =
            Percentage(
                onTimeDeliveries,
                deliveryWithDates);

        var onTimeTrips =
            await tripQuery.CountAsync(
                x =>
                    x.Status ==
                        "Completed" &&
                    x.ActualArrivalAt
                        .HasValue &&
                    x.ExpectedArrivalAt
                        .HasValue &&
                    x.ActualArrivalAt.Value <=
                    x.ExpectedArrivalAt.Value,
                cancellationToken);

        var completedTripsWithEta =
            await tripQuery.CountAsync(
                x =>
                    x.Status ==
                        "Completed" &&
                    x.ActualArrivalAt
                        .HasValue &&
                    x.ExpectedArrivalAt
                        .HasValue,
                cancellationToken);

        var tripOnTimeRate =
            Percentage(
                onTimeTrips,
                completedTripsWithEta);

        return new ExecutiveAnalyticsResult
        {
            From =
                range.From,

            To =
                range.ToInclusive,

            TotalBookings =
                totalBookings,

            ActiveBookings =
                Math.Max(
                    activeBookings,
                    0),

            DeliveredBookings =
                deliveredBookings,

            CancelledBookings =
                cancelledBookings,

            TotalBookedValue =
                totalBookedValue,

            SuccessfulRevenue =
                successfulRevenue,

            AverageBookingValue =
                averageBookingValue,

            PaymentSuccessRate =
                paymentSuccessRate,

            DeliveryRate =
                deliveryRate,

            OnTimeDeliveryRate =
                onTimeDeliveryRate,

            TotalShipments =
                totalShipments,

            DeliveredShipments =
                deliveredShipments,

            ShipmentDeliveryRate =
                shipmentDeliveryRate,

            TotalTrips =
                totalTrips,

            CompletedTrips =
                completedTrips,

            TripCompletionRate =
                tripCompletionRate,

            TripOnTimeRate =
                tripOnTimeRate
        };
    }

    public async Task<FleetAnalyticsResult>
        GetFleetAnalyticsAsync(
            CancellationToken cancellationToken = default)
    {
        var totalVehicles =
            await _db.Vehicles
                .AsNoTracking()
                .CountAsync(
                    x =>
                        x.IsActive,
                    cancellationToken);

        var availableVehicles =
            await _db.Vehicles
                .AsNoTracking()
                .CountAsync(
                    x =>
                        x.IsActive &&
                        x.IsAvailable,
                    cancellationToken);

        var totalDrivers =
            await _db.Drivers
                .AsNoTracking()
                .CountAsync(
                    x =>
                        x.IsActive,
                    cancellationToken);

        var availableDrivers =
            await _db.Drivers
                .AsNoTracking()
                .CountAsync(
                    x =>
                        x.IsActive &&
                        x.IsAvailable,
                    cancellationToken);

        var verifiedDrivers =
            await _db.Drivers
                .AsNoTracking()
                .CountAsync(
                    x =>
                        x.IsActive &&
                        x.IsVerified,
                    cancellationToken);

        var activeTrips =
            await _db.TransportTrips
                .AsNoTracking()
                .CountAsync(
                    x =>
                        x.Status !=
                            "Completed" &&
                        x.Status !=
                            "Cancelled",
                    cancellationToken);

        var totalCapacityKg =
            await _db.Vehicles
                .AsNoTracking()
                .Where(x =>
                    x.IsActive)
                .SumAsync(
                    x =>
                        (decimal?)x.CapacityKg,
                    cancellationToken)
            ?? 0;

        var availableCapacityKg =
            await _db.Vehicles
                .AsNoTracking()
                .Where(x =>
                    x.IsActive &&
                    x.IsAvailable)
                .SumAsync(
                    x =>
                        (decimal?)x.CapacityKg,
                    cancellationToken)
            ?? 0;

        return new FleetAnalyticsResult
        {
            TotalVehicles =
                totalVehicles,

            AvailableVehicles =
                availableVehicles,

            AssignedVehicles =
                Math.Max(
                    totalVehicles -
                    availableVehicles,
                    0),

            VehicleAvailabilityRate =
                Percentage(
                    availableVehicles,
                    totalVehicles),

            TotalDrivers =
                totalDrivers,

            AvailableDrivers =
                availableDrivers,

            VerifiedDrivers =
                verifiedDrivers,

            DriverAvailabilityRate =
                Percentage(
                    availableDrivers,
                    totalDrivers),

            DriverVerificationRate =
                Percentage(
                    verifiedDrivers,
                    totalDrivers),

            ActiveTrips =
                activeTrips,

            TotalCapacityKg =
                totalCapacityKg,

            AvailableCapacityKg =
                availableCapacityKg
        };
    }

    public async Task<List<DailyAnalyticsPoint>>
        GetDailyTrendAsync(
            DateTime? from,
            DateTime? to,
            CancellationToken cancellationToken = default)
    {
        var range =
            NormalizeRange(
                from,
                to);

        var bookings =
            await _db.Bookings
                .AsNoTracking()
                .Where(x =>
                    x.CreatedAt >= range.From &&
                    x.CreatedAt < range.ToExclusive)
                .Select(x => new
                {
                    x.CreatedAt,
                    x.TotalAmount,
                    x.BookingStatus
                })
                .ToListAsync(
                    cancellationToken);

        var payments =
            await _db.PaymentTransactions
                .AsNoTracking()
                .Where(x =>
                    x.CreatedAt >= range.From &&
                    x.CreatedAt < range.ToExclusive &&
                    x.PaymentStatus ==
                        "Success")
                .Select(x => new
                {
                    x.CreatedAt,
                    x.Amount
                })
                .ToListAsync(
                    cancellationToken);

        var bookingByDate =
            bookings
                .GroupBy(x =>
                    x.CreatedAt.Date)
                .ToDictionary(
                    x => x.Key,
                    x => new
                    {
                        Count =
                            x.Count(),

                        Delivered =
                            x.Count(y =>
                                y.BookingStatus ==
                                "Delivered"),

                        Cancelled =
                            x.Count(y =>
                                y.BookingStatus ==
                                "Cancelled"),

                        Value =
                            x.Sum(y =>
                                y.TotalAmount)
                    });

        var paymentsByDate =
            payments
                .GroupBy(x =>
                    x.CreatedAt.Date)
                .ToDictionary(
                    x => x.Key,
                    x => x.Sum(y =>
                        y.Amount));

        var result =
            new List<DailyAnalyticsPoint>();

        for (var date =
                 range.From.Date;
             date <=
             range.ToInclusive.Date;
             date =
                 date.AddDays(1))
        {
            bookingByDate.TryGetValue(
                date,
                out var booking);

            paymentsByDate.TryGetValue(
                date,
                out var revenue);

            result.Add(
                new DailyAnalyticsPoint
                {
                    Date =
                        date,

                    Bookings =
                        booking?.Count ??
                        0,

                    Delivered =
                        booking?.Delivered ??
                        0,

                    Cancelled =
                        booking?.Cancelled ??
                        0,

                    BookedValue =
                        booking?.Value ??
                        0,

                    Revenue =
                        revenue
                });
        }

        return result;
    }

    public async Task<List<StatusAnalyticsItem>>
        GetBookingStatusBreakdownAsync(
            DateTime? from,
            DateTime? to,
            CancellationToken cancellationToken = default)
    {
        var range =
            NormalizeRange(
                from,
                to);

        return await _db.Bookings
            .AsNoTracking()
            .Where(x =>
                x.CreatedAt >= range.From &&
                x.CreatedAt <
                    range.ToExclusive)
            .GroupBy(x =>
                x.BookingStatus)
            .Select(x =>
                new StatusAnalyticsItem
                {
                    Status =
                        x.Key,

                    Count =
                        x.Count()
                })
            .OrderByDescending(x =>
                x.Count)
            .ToListAsync(
                cancellationToken);
    }

    public async Task<List<RouteAnalyticsItem>>
        GetTopRoutesAsync(
            DateTime? from,
            DateTime? to,
            int limit = 10,
            CancellationToken cancellationToken = default)
    {
        var range =
            NormalizeRange(
                from,
                to);

        limit =
            Math.Clamp(
                limit,
                1,
                50);

        return await _db.Bookings
            .AsNoTracking()
            .Where(x =>
                x.CreatedAt >= range.From &&
                x.CreatedAt <
                    range.ToExclusive)
            .GroupBy(x =>
                new
                {
                    x.FromCity,
                    x.ToCity
                })
            .Select(x =>
                new RouteAnalyticsItem
                {
                    FromCity =
                        x.Key.FromCity,

                    ToCity =
                        x.Key.ToCity,

                    Bookings =
                        x.Count(),

                    TotalWeight =
                        x.Sum(y =>
                            y.Weight),

                    BookedValue =
                        x.Sum(y =>
                            y.TotalAmount)
                })
            .OrderByDescending(x =>
                x.Bookings)
            .Take(
                limit)
            .ToListAsync(
                cancellationToken);
    }

    public async Task<OperationsAnalyticsResult>
        GetOperationsAnalyticsAsync(
            CancellationToken cancellationToken = default)
    {
        var now =
            DateTime.UtcNow;

        var delayedBookings =
            await _db.Bookings
                .AsNoTracking()
                .CountAsync(
                    x =>
                        x.ExpectedDeliveryDate
                            .HasValue &&
                        x.ExpectedDeliveryDate.Value <
                            now &&
                        x.BookingStatus !=
                            "Delivered" &&
                        x.BookingStatus !=
                            "Cancelled",
                    cancellationToken);

        var delayedTrips =
            await _db.TransportTrips
                .AsNoTracking()
                .CountAsync(
                    x =>
                        x.ExpectedArrivalAt
                            .HasValue &&
                        x.ExpectedArrivalAt.Value <
                            now &&
                        x.Status !=
                            "Completed" &&
                        x.Status !=
                            "Cancelled",
                    cancellationToken);

        var shipmentsInTransit =
            await _db.Shipments
                .AsNoTracking()
                .CountAsync(
                    x =>
                        x.Status ==
                            "In Transit" ||
                        x.Status ==
                            "Dispatched" ||
                        x.Status ==
                            "Out For Delivery",
                    cancellationToken);

        var failedDeliveryAttempts =
            await _db.DeliveryAttempts
                .AsNoTracking()
                .CountAsync(
                    x =>
                        x.Status ==
                            "Failed",
                    cancellationToken);

        var openExceptions =
            await _db.OperationsExceptions
                .AsNoTracking()
                .CountAsync(
                    x =>
                        x.Status !=
                            "Resolved" &&
                        x.Status !=
                            "Closed",
                    cancellationToken);

        var criticalExceptions =
            await _db.OperationsExceptions
                .AsNoTracking()
                .CountAsync(
                    x =>
                        x.Status !=
                            "Resolved" &&
                        x.Status !=
                            "Closed" &&
                        x.Severity ==
                            "Critical",
                    cancellationToken);

        var escalatedExceptions =
            await _db.OperationsExceptions
                .AsNoTracking()
                .CountAsync(
                    x =>
                        x.Status !=
                            "Resolved" &&
                        x.Status !=
                            "Closed" &&
                        x.EscalationLevel >
                            1,
                    cancellationToken);

        return new OperationsAnalyticsResult
        {
            DelayedBookings =
                delayedBookings,

            DelayedTrips =
                delayedTrips,

            ShipmentsInTransit =
                shipmentsInTransit,

            FailedDeliveryAttempts =
                failedDeliveryAttempts,

            OpenExceptions =
                openExceptions,

            CriticalExceptions =
                criticalExceptions,

            EscalatedExceptions =
                escalatedExceptions
        };
    }

    private static AnalyticsDateRange
        NormalizeRange(
            DateTime? from,
            DateTime? to)
    {
        var today =
            DateTime.UtcNow.Date;

        var fromDate =
            from?.Date ??
            today.AddDays(-29);

        var toDate =
            to?.Date ??
            today;

        if (fromDate >
            toDate)
        {
            (fromDate, toDate) =
                (toDate, fromDate);
        }

        if ((toDate -
             fromDate).TotalDays >
            365)
        {
            fromDate =
                toDate.AddDays(-365);
        }

        return new AnalyticsDateRange
        {
            From =
                fromDate,

            ToInclusive =
                toDate,

            ToExclusive =
                toDate.AddDays(1)
        };
    }

    private static decimal Percentage(
        int value,
        int total)
    {
        if (total <= 0)
        {
            return 0;
        }

        return Math.Round(
            value * 100m /
            total,
            2);
    }
}

public class ExecutiveAnalyticsResult
{
    public DateTime From { get; set; }

    public DateTime To { get; set; }

    public int TotalBookings { get; set; }

    public int ActiveBookings { get; set; }

    public int DeliveredBookings { get; set; }

    public int CancelledBookings { get; set; }

    public decimal TotalBookedValue { get; set; }

    public decimal SuccessfulRevenue { get; set; }

    public decimal AverageBookingValue { get; set; }

    public decimal PaymentSuccessRate { get; set; }

    public decimal DeliveryRate { get; set; }

    public decimal OnTimeDeliveryRate { get; set; }

    public int TotalShipments { get; set; }

    public int DeliveredShipments { get; set; }

    public decimal ShipmentDeliveryRate { get; set; }

    public int TotalTrips { get; set; }

    public int CompletedTrips { get; set; }

    public decimal TripCompletionRate { get; set; }

    public decimal TripOnTimeRate { get; set; }
}

public class FleetAnalyticsResult
{
    public int TotalVehicles { get; set; }

    public int AvailableVehicles { get; set; }

    public int AssignedVehicles { get; set; }

    public decimal VehicleAvailabilityRate { get; set; }

    public int TotalDrivers { get; set; }

    public int AvailableDrivers { get; set; }

    public int VerifiedDrivers { get; set; }

    public decimal DriverAvailabilityRate { get; set; }

    public decimal DriverVerificationRate { get; set; }

    public int ActiveTrips { get; set; }

    public decimal TotalCapacityKg { get; set; }

    public decimal AvailableCapacityKg { get; set; }
}

public class OperationsAnalyticsResult
{
    public int DelayedBookings { get; set; }

    public int DelayedTrips { get; set; }

    public int ShipmentsInTransit { get; set; }

    public int FailedDeliveryAttempts { get; set; }

    public int OpenExceptions { get; set; }

    public int CriticalExceptions { get; set; }

    public int EscalatedExceptions { get; set; }
}

public class DailyAnalyticsPoint
{
    public DateTime Date { get; set; }

    public int Bookings { get; set; }

    public int Delivered { get; set; }

    public int Cancelled { get; set; }

    public decimal BookedValue { get; set; }

    public decimal Revenue { get; set; }
}

public class StatusAnalyticsItem
{
    public string Status { get; set; } =
        string.Empty;

    public int Count { get; set; }
}

public class RouteAnalyticsItem
{
    public string FromCity { get; set; } =
        string.Empty;

    public string ToCity { get; set; } =
        string.Empty;

    public int Bookings { get; set; }

    public decimal TotalWeight { get; set; }

    public decimal BookedValue { get; set; }
}

public class AnalyticsDateRange
{
    public DateTime From { get; set; }

    public DateTime ToInclusive { get; set; }

    public DateTime ToExclusive { get; set; }
}