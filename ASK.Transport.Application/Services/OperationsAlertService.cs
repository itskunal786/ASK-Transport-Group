using ASK.Group.Api.Data;
using ASK.Group.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace ASK.Group.Api.Services;

public class OperationsAlertService
{
    private readonly AskTransportDbContext _db;
    private readonly RealtimeOperationsService _realtimeOperationsService;

    public OperationsAlertService(
        AskTransportDbContext db,
        RealtimeOperationsService realtimeOperationsService)
    {
        _db = db;
        _realtimeOperationsService =
            realtimeOperationsService;
    }

    public async Task CheckAndGenerateAlertsAsync(
        CancellationToken cancellationToken = default)
    {
        var now =
            DateTime.UtcNow;

        await CheckDelayedBookingsAsync(
            now,
            cancellationToken);

        await CheckDelayedTripsAsync(
            now,
            cancellationToken);

        await CheckExpiringDriverLicensesAsync(
            now,
            cancellationToken);

        await CheckExpiringVehicleDocumentsAsync(
            now,
            cancellationToken);

        await _db.SaveChangesAsync(
            cancellationToken);
    }

    private async Task CheckDelayedBookingsAsync(
        DateTime now,
        CancellationToken cancellationToken)
    {
        var delayedBookings =
            await _db.Bookings
                .AsNoTracking()
                .Where(x =>
                    x.ExpectedDeliveryDate.HasValue &&
                    x.ExpectedDeliveryDate.Value < now &&
                    x.BookingStatus != "Delivered" &&
                    x.BookingStatus != "Cancelled")
                .Select(x => new
                {
                    x.Id,
                    x.BookingNumber,
                    x.ExpectedDeliveryDate
                })
                .OrderBy(x => x.ExpectedDeliveryDate)
                .Take(200)
                .ToListAsync(
                    cancellationToken);

        foreach (var booking in delayedBookings)
        {
            if (!booking.ExpectedDeliveryDate.HasValue)
            {
                continue;
            }

            var expectedDeliveryDate =
                booking.ExpectedDeliveryDate.Value;

            var exists =
                await _db.SystemAlerts
                    .AnyAsync(
                        x =>
                            x.AlertType ==
                                "BOOKING_DELAYED" &&
                            x.ReferenceType ==
                                "Booking" &&
                            x.ReferenceId ==
                                booking.Id &&
                            !x.IsResolved,
                        cancellationToken);

            if (exists)
            {
                continue;
            }

            var delay =
                now -
                expectedDeliveryDate;

            var delayHours =
                Math.Max(
                    1,
                    (int)Math.Ceiling(
                        delay.TotalHours));

            var severity =
                delayHours >= 24
                    ? "Critical"
                    : "Warning";

            var alert =
                new SystemAlert
                {
                    AlertType =
                        "BOOKING_DELAYED",

                    ReferenceType =
                        "Booking",

                    ReferenceId =
                        booking.Id,

                    Title =
                        "Booking delivery delayed",

                    Message =
                        $"Booking {booking.BookingNumber} is delayed by approximately {delayHours} hour(s).",

                    Severity =
                        severity,

                    IsResolved =
                        false,

                    CreatedAt =
                        now
                };

            _db.SystemAlerts.Add(
                alert);

            await _realtimeOperationsService
                .SystemAlertAsync(
                    alert.Title,
                    alert.Message,
                    alert.Severity);
        }
    }

    private async Task CheckDelayedTripsAsync(
        DateTime now,
        CancellationToken cancellationToken)
    {
        var delayedTrips =
            await _db.TransportTrips
                .AsNoTracking()
                .Where(x =>
                    x.ExpectedArrivalAt.HasValue &&
                    x.ExpectedArrivalAt.Value < now &&
                    x.Status != "Completed" &&
                    x.Status != "Cancelled")
                .Select(x => new
                {
                    x.Id,
                    x.TripNumber,
                    x.ExpectedArrivalAt
                })
                .OrderBy(x => x.ExpectedArrivalAt)
                .Take(200)
                .ToListAsync(
                    cancellationToken);

        foreach (var trip in delayedTrips)
        {
            if (!trip.ExpectedArrivalAt.HasValue)
            {
                continue;
            }

            var expectedArrival =
                trip.ExpectedArrivalAt.Value;

            var exists =
                await _db.SystemAlerts
                    .AnyAsync(
                        x =>
                            x.AlertType ==
                                "TRIP_DELAYED" &&
                            x.ReferenceType ==
                                "Trip" &&
                            x.ReferenceId ==
                                trip.Id &&
                            !x.IsResolved,
                        cancellationToken);

            if (exists)
            {
                continue;
            }

            var delay =
                now -
                expectedArrival;

            var delayHours =
                Math.Max(
                    1,
                    (int)Math.Ceiling(
                        delay.TotalHours));

            var severity =
                delayHours >= 12
                    ? "Critical"
                    : "Warning";

            var alert =
                new SystemAlert
                {
                    AlertType =
                        "TRIP_DELAYED",

                    ReferenceType =
                        "Trip",

                    ReferenceId =
                        trip.Id,

                    Title =
                        "Trip delayed",

                    Message =
                        $"Trip {trip.TripNumber} is delayed by approximately {delayHours} hour(s).",

                    Severity =
                        severity,

                    IsResolved =
                        false,

                    CreatedAt =
                        now
                };

            _db.SystemAlerts.Add(
                alert);

            await _realtimeOperationsService
                .SystemAlertAsync(
                    alert.Title,
                    alert.Message,
                    alert.Severity);
        }
    }

    private async Task CheckExpiringDriverLicensesAsync(
        DateTime now,
        CancellationToken cancellationToken)
    {
        var limitDate =
            now.AddDays(30);

        var drivers =
            await _db.Drivers
                .AsNoTracking()
                .Where(x =>
                    x.IsActive &&
                    x.LicenseExpiryDate >= now &&
                    x.LicenseExpiryDate <= limitDate)
                .Select(x => new
                {
                    x.Id,
                    x.Name,
                    x.DrivingLicenseNumber,
                    x.LicenseExpiryDate
                })
                .OrderBy(x => x.LicenseExpiryDate)
                .Take(200)
                .ToListAsync(
                    cancellationToken);

        foreach (var driver in drivers)
        {
            var exists =
                await _db.SystemAlerts
                    .AnyAsync(
                        x =>
                            x.AlertType ==
                                "DRIVER_LICENSE_EXPIRING" &&
                            x.ReferenceType ==
                                "Driver" &&
                            x.ReferenceId ==
                                driver.Id &&
                            !x.IsResolved,
                        cancellationToken);

            if (exists)
            {
                continue;
            }

            var daysLeft =
                Math.Max(
                    0,
                    (
                        driver.LicenseExpiryDate.Date -
                        now.Date
                    ).Days);

            var severity =
                daysLeft <= 7
                    ? "Critical"
                    : "Warning";

            var alert =
                new SystemAlert
                {
                    AlertType =
                        "DRIVER_LICENSE_EXPIRING",

                    ReferenceType =
                        "Driver",

                    ReferenceId =
                        driver.Id,

                    Title =
                        "Driver license expiring",

                    Message =
                        $"Driver {driver.Name} license {driver.DrivingLicenseNumber} expires in {daysLeft} day(s).",

                    Severity =
                        severity,

                    IsResolved =
                        false,

                    CreatedAt =
                        now
                };

            _db.SystemAlerts.Add(
                alert);

            await _realtimeOperationsService
                .SystemAlertAsync(
                    alert.Title,
                    alert.Message,
                    alert.Severity);
        }
    }

    private async Task CheckExpiringVehicleDocumentsAsync(
        DateTime now,
        CancellationToken cancellationToken)
    {
        var limitDate =
            now.AddDays(30);

        var vehicles =
            await _db.Vehicles
                .AsNoTracking()
                .Where(x =>
                    x.IsActive)
                .Select(x => new
                {
                    x.Id,
                    x.VehicleNumber,
                    x.InsuranceExpiryDate,
                    x.FitnessExpiryDate,
                    x.PucExpiryDate
                })
                .OrderBy(x => x.Id)
                .Take(500)
                .ToListAsync(
                    cancellationToken);

        foreach (var vehicle in vehicles)
        {
            await CreateVehicleExpiryAlertAsync(
                vehicle.Id,
                vehicle.VehicleNumber,
                "VEHICLE_INSURANCE_EXPIRING",
                "Vehicle insurance expiring",
                vehicle.InsuranceExpiryDate,
                now,
                limitDate,
                cancellationToken);

            await CreateVehicleExpiryAlertAsync(
                vehicle.Id,
                vehicle.VehicleNumber,
                "VEHICLE_FITNESS_EXPIRING",
                "Vehicle fitness expiring",
                vehicle.FitnessExpiryDate,
                now,
                limitDate,
                cancellationToken);

            await CreateVehicleExpiryAlertAsync(
                vehicle.Id,
                vehicle.VehicleNumber,
                "VEHICLE_PUC_EXPIRING",
                "Vehicle PUC expiring",
                vehicle.PucExpiryDate,
                now,
                limitDate,
                cancellationToken);
        }
    }

    private async Task CreateVehicleExpiryAlertAsync(
        int vehicleId,
        string vehicleNumber,
        string alertType,
        string title,
        DateTime? expiryDate,
        DateTime now,
        DateTime limitDate,
        CancellationToken cancellationToken)
    {
        if (!expiryDate.HasValue)
        {
            return;
        }

        var actualExpiryDate =
            expiryDate.Value;

        if (actualExpiryDate < now ||
            actualExpiryDate > limitDate)
        {
            return;
        }

        var exists =
            await _db.SystemAlerts
                .AnyAsync(
                    x =>
                        x.AlertType ==
                            alertType &&
                        x.ReferenceType ==
                            "Vehicle" &&
                        x.ReferenceId ==
                            vehicleId &&
                        !x.IsResolved,
                    cancellationToken);

        if (exists)
        {
            return;
        }

        var daysLeft =
            Math.Max(
                0,
                (
                    actualExpiryDate.Date -
                    now.Date
                ).Days);

        var severity =
            daysLeft <= 7
                ? "Critical"
                : "Warning";

        var alert =
            new SystemAlert
            {
                AlertType =
                    alertType,

                ReferenceType =
                    "Vehicle",

                ReferenceId =
                    vehicleId,

                Title =
                    title,

                Message =
                    $"{vehicleNumber} document expires in {daysLeft} day(s).",

                Severity =
                    severity,

                IsResolved =
                    false,

                CreatedAt =
                    now
            };

        _db.SystemAlerts.Add(
            alert);

        await _realtimeOperationsService
            .SystemAlertAsync(
                alert.Title,
                alert.Message,
                alert.Severity);
    }
}
