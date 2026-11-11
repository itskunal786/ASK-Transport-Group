using ASK.Group.Api.Authorization;
using ASK.Group.Api.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ASK.Group.Api.Controllers;

[ApiController]
[Route("api/operations/command-center")]
public class OperationsCommandCenterController
    : ControllerBase
{
    private readonly AskTransportDbContext _db;

    public OperationsCommandCenterController(
        AskTransportDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    [HasPermission(Permissions.Reports.View)]
    public async Task<IActionResult> GetDashboard(
        CancellationToken cancellationToken)
    {
        var now =
            DateTime.UtcNow;

        var today =
            now.Date;

        var tomorrow =
            today.AddDays(1);

        var totalBookings =
            await _db.Bookings
                .AsNoTracking()
                .CountAsync(
                    cancellationToken);

        var todayBookings =
            await _db.Bookings
                .AsNoTracking()
                .CountAsync(
                    x =>
                        x.CreatedAt >= today &&
                        x.CreatedAt < tomorrow,
                    cancellationToken);

        var activeBookings =
            await _db.Bookings
                .AsNoTracking()
                .CountAsync(
                    x =>
                        x.BookingStatus != "Delivered" &&
                        x.BookingStatus != "Cancelled",
                    cancellationToken);

        var delayedBookings =
            await _db.Bookings
                .AsNoTracking()
                .CountAsync(
                    x =>
                        x.ExpectedDeliveryDate <
                            now &&
                        x.BookingStatus !=
                            "Delivered" &&
                        x.BookingStatus !=
                            "Cancelled",
                    cancellationToken);

        var pendingPayments =
            await _db.Bookings
                .AsNoTracking()
                .CountAsync(
                    x =>
                        x.PaymentStatus != "Paid",
                    cancellationToken);

        var activeShipments =
            await _db.Shipments
                .AsNoTracking()
                .CountAsync(
                    x =>
                        x.Status != "Delivered" &&
                        x.Status != "Cancelled",
                    cancellationToken);

        var deliveredToday =
            await _db.Shipments
                .AsNoTracking()
                .CountAsync(
                    x =>
                        x.DeliveredAt != null &&
                        x.DeliveredAt >= today &&
                        x.DeliveredAt < tomorrow,
                    cancellationToken);

        var activeTrips =
            await _db.TransportTrips
                .AsNoTracking()
                .CountAsync(
                    x =>
                        x.Status != "Completed" &&
                        x.Status != "Cancelled",
                    cancellationToken);

        var delayedTrips =
            await _db.TransportTrips
                .AsNoTracking()
                .CountAsync(
                    x =>
                        x.ExpectedArrivalAt != null &&
                        x.ExpectedArrivalAt < now &&
                        x.Status != "Completed" &&
                        x.Status != "Cancelled",
                    cancellationToken);

        var availableDrivers =
            await _db.Drivers
                .AsNoTracking()
                .CountAsync(
                    x =>
                        x.IsActive &&
                        x.IsAvailable,
                    cancellationToken);

        var busyDrivers =
            await _db.Drivers
                .AsNoTracking()
                .CountAsync(
                    x =>
                        x.IsActive &&
                        !x.IsAvailable,
                    cancellationToken);

        var availableVehicles =
            await _db.Vehicles
                .AsNoTracking()
                .CountAsync(
                    x =>
                        x.IsActive &&
                        x.IsAvailable,
                    cancellationToken);

        var busyVehicles =
            await _db.Vehicles
                .AsNoTracking()
                .CountAsync(
                    x =>
                        x.IsActive &&
                        !x.IsAvailable,
                    cancellationToken);

        var unresolvedAlerts =
            await _db.SystemAlerts
                .AsNoTracking()
                .CountAsync(
                    x =>
                        !x.IsResolved,
                    cancellationToken);

        var todayRevenue =
            await _db.PaymentTransactions
                .AsNoTracking()
                .Where(x =>
                    x.PaymentStatus ==
                        "Success" &&
                    x.CreatedAt >= today &&
                    x.CreatedAt < tomorrow)
                .SumAsync(
                    x =>
                        (decimal?)x.Amount,
                    cancellationToken)
            ?? 0;

        return Ok(new
        {
            generatedAt =
                now,

            bookings = new
            {
                total =
                    totalBookings,

                today =
                    todayBookings,

                active =
                    activeBookings,

                delayed =
                    delayedBookings,

                pendingPayments
            },

            shipments = new
            {
                active =
                    activeShipments,

                deliveredToday
            },

            trips = new
            {
                active =
                    activeTrips,

                delayed =
                    delayedTrips
            },

            drivers = new
            {
                available =
                    availableDrivers,

                busy =
                    busyDrivers
            },

            vehicles = new
            {
                available =
                    availableVehicles,

                busy =
                    busyVehicles
            },

            alerts = new
            {
                unresolved =
                    unresolvedAlerts
            },

            finance = new
            {
                todayRevenue
            }
        });
    }

    [HttpGet("delayed")]
    [HasPermission(Permissions.Reports.View)]
    public async Task<IActionResult> GetDelayedOperations(
        [FromQuery] int take = 20,
        CancellationToken cancellationToken = default)
    {
        take =
            Math.Clamp(
                take,
                1,
                100);

        var now =
            DateTime.UtcNow;

        var delayedBookings =
            await _db.Bookings
                .AsNoTracking()
                .Where(x =>
                    x.ExpectedDeliveryDate <
                        now &&
                    x.BookingStatus !=
                        "Delivered" &&
                    x.BookingStatus !=
                        "Cancelled")
                .OrderBy(x =>
                    x.ExpectedDeliveryDate)
                .Take(take)
                .Select(x => new
                {
                    x.Id,
                    x.BookingNumber,
                    x.FromCity,
                    x.ToCity,
                    x.BookingStatus,
                    x.PaymentStatus,
                    x.ExpectedDeliveryDate,

                    delayMinutes =
                        EF.Functions.DateDiffMinute(
                            x.ExpectedDeliveryDate,
                            now)
                })
                .ToListAsync(
                    cancellationToken);

        var delayedTrips =
            await _db.TransportTrips
                .AsNoTracking()
                .Where(x =>
                    x.ExpectedArrivalAt != null &&
                    x.ExpectedArrivalAt <
                        now &&
                    x.Status != "Completed" &&
                    x.Status != "Cancelled")
                .OrderBy(x =>
                    x.ExpectedArrivalAt)
                .Take(take)
                .Select(x => new
                {
                    x.Id,
                    x.TripNumber,
                    x.FromHubId,
                    x.ToHubId,
                    x.DriverId,
                    x.VehicleId,
                    x.Status,
                    x.PlannedDepartureAt,
                    x.ExpectedArrivalAt,

                    delayMinutes =
                        x.ExpectedArrivalAt == null
                            ? 0
                            : EF.Functions
                                .DateDiffMinute(
                                    x.ExpectedArrivalAt
                                        .Value,
                                    now)
                })
                .ToListAsync(
                    cancellationToken);

        return Ok(new
        {
            generatedAt =
                now,

            bookings =
                delayedBookings,

            trips =
                delayedTrips
        });
    }

    [HttpGet("active-trips")]
    [HasPermission(Permissions.Trips.View)]
    public async Task<IActionResult> GetActiveTrips(
        [FromQuery] int take = 20,
        CancellationToken cancellationToken = default)
    {
        take =
            Math.Clamp(
                take,
                1,
                100);

        var trips =
            await _db.TransportTrips
                .AsNoTracking()
                .Where(x =>
                    x.Status !=
                        "Completed" &&
                    x.Status !=
                        "Cancelled")
                .OrderBy(x =>
                    x.PlannedDepartureAt)
                .Take(take)
                .Select(x => new
                {
                    x.Id,
                    x.TripNumber,

                    fromHub =
                        x.FromHub == null
                            ? null
                            : new
                            {
                                x.FromHub.Id,
                                x.FromHub.Name
                            },

                    toHub =
                        x.ToHub == null
                            ? null
                            : new
                            {
                                x.ToHub.Id,
                                x.ToHub.Name
                            },

                    driver =
                        x.Driver == null
                            ? null
                            : new
                            {
                                x.Driver.Id,
                                x.Driver.Name,
                                x.Driver.Phone
                            },

                    vehicle =
                        x.Vehicle == null
                            ? null
                            : new
                            {
                                x.Vehicle.Id,
                                x.Vehicle.VehicleNumber,
                                x.Vehicle.VehicleType
                            },

                    x.Status,
                    x.PlannedDepartureAt,
                    x.ActualDepartureAt,
                    x.ExpectedArrivalAt,
                    x.ActualArrivalAt,
                    x.TotalWeight,
                    x.TotalShipments
                })
                .ToListAsync(
                    cancellationToken);

        return Ok(trips);
    }

    [HttpGet("fleet-availability")]
    [HasPermission(Permissions.Vehicles.View)]
    public async Task<IActionResult> GetFleetAvailability(
        CancellationToken cancellationToken)
    {
        var drivers =
            await _db.Drivers
                .AsNoTracking()
                .Where(x =>
                    x.IsActive)
                .OrderBy(x =>
                    x.Name)
                .Select(x => new
                {
                    x.Id,
                    x.Name,
                    x.Phone,
                    x.HubId,
                    x.Status,
                    x.IsAvailable,
                    x.IsVerified,
                    x.LicenseExpiryDate
                })
                .ToListAsync(
                    cancellationToken);

        var vehicles =
            await _db.Vehicles
                .AsNoTracking()
                .Where(x =>
                    x.IsActive)
                .OrderBy(x =>
                    x.VehicleNumber)
                .Select(x => new
                {
                    x.Id,
                    x.VehicleNumber,
                    x.VehicleType,
                    x.HubId,
                    x.Status,
                    x.IsAvailable,
                    x.CapacityKg,
                    x.InsuranceExpiryDate,
                    x.FitnessExpiryDate,
                    x.PucExpiryDate
                })
                .ToListAsync(
                    cancellationToken);

        return Ok(new
        {
            drivers,
            vehicles
        });
    }

    [HttpGet("recent-shipments")]
    [HasPermission(Permissions.Shipments.View)]
    public async Task<IActionResult> GetRecentShipments(
        [FromQuery] int take = 20,
        CancellationToken cancellationToken = default)
    {
        take =
            Math.Clamp(
                take,
                1,
                100);

        var shipments =
            await _db.Shipments
                .AsNoTracking()
                .OrderByDescending(x =>
                    x.CreatedAt)
                .Take(take)
                .Select(x => new
                {
                    x.Id,
                    x.ShipmentNumber,
                    x.BookingId,
                    x.Status,

                    originHub =
                        x.OriginHub == null
                            ? null
                            : new
                            {
                                x.OriginHub.Id,
                                x.OriginHub.Name
                            },

                    currentHub =
                        x.CurrentHub == null
                            ? null
                            : new
                            {
                                x.CurrentHub.Id,
                                x.CurrentHub.Name
                            },

                    destinationHub =
                        x.DestinationHub == null
                            ? null
                            : new
                            {
                                x.DestinationHub.Id,
                                x.DestinationHub.Name
                            },

                    x.TotalWeight,
                    x.TotalQuantity,
                    x.DispatchedAt,
                    x.ArrivedAtDestinationHub,
                    x.DeliveredAt,
                    x.CreatedAt
                })
                .ToListAsync(
                    cancellationToken);

        return Ok(shipments);
    }
}