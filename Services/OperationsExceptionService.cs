using ASK.Group.Api.Data;
using ASK.Group.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace ASK.Group.Api.Services;

public class OperationsExceptionService
{
    private readonly AskTransportDbContext _db;
    private readonly AuditService _auditService;
    private readonly RealtimeOperationsService
        _realtimeOperationsService;

    public OperationsExceptionService(
        AskTransportDbContext db,
        AuditService auditService,
        RealtimeOperationsService realtimeOperationsService)
    {
        _db = db;
        _auditService = auditService;
        _realtimeOperationsService =
            realtimeOperationsService;
    }

    public async Task<int> ScanAsync(
        CancellationToken cancellationToken = default)
    {
        var createdCount = 0;

        createdCount +=
            await DetectDelayedBookingsAsync(
                cancellationToken);

        createdCount +=
            await DetectDelayedTripsAsync(
                cancellationToken);

        createdCount +=
            await DetectVehicleComplianceAsync(
                cancellationToken);

        createdCount +=
            await DetectDriverComplianceAsync(
                cancellationToken);

        createdCount +=
            await DetectDeliveryFailuresAsync(
                cancellationToken);

        return createdCount;
    }

    public async Task<int> EscalateAsync(
        CancellationToken cancellationToken = default)
    {
        var now =
            DateTime.UtcNow;

        var exceptions =
            await _db.OperationsExceptions
                .Where(x =>
                    x.Status != "Resolved" &&
                    x.Status != "Closed" &&
                    x.DueAt.HasValue &&
                    x.DueAt.Value <= now)
                .ToListAsync(
                    cancellationToken);

        var count = 0;

        foreach (var item in exceptions)
        {
            var previousLevel =
                item.EscalationLevel;

            if (item.EscalationLevel < 4)
            {
                item.EscalationLevel++;
            }

            item.LastEscalatedAt =
                now;

            item.Severity =
                GetSeverityForEscalation(
                    item.EscalationLevel);

            item.AssignedDepartment =
                GetDepartmentForEscalation(
                    item.EscalationLevel);

            item.DueAt =
                CalculateNextDueAt(
                    item.EscalationLevel,
                    now);

            _db.OperationsExceptionHistories.Add(
                new OperationsExceptionHistory
                {
                    OperationsExceptionId =
                        item.Id,

                    Action =
                        "Escalated",

                    Description =
                        $"Exception escalated from level {previousLevel} to level {item.EscalationLevel}",

                    EscalationLevel =
                        item.EscalationLevel,

                    ActionAt =
                        now
                });

            count++;
        }

        if (count > 0)
        {
            await _db.SaveChangesAsync(
                cancellationToken);

            await _realtimeOperationsService
                .SystemAlertAsync(
                    "Operations exception escalation",
                    $"{count} operational exception(s) escalated.");
        }

        return count;
    }

    public async Task<bool> AcknowledgeAsync(
        int id,
        int userId,
        CancellationToken cancellationToken = default)
    {
        var item =
            await _db.OperationsExceptions
                .FirstOrDefaultAsync(
                    x => x.Id == id,
                    cancellationToken);

        if (item == null)
        {
            return false;
        }

        if (item.Status == "Resolved" ||
            item.Status == "Closed")
        {
            return false;
        }

        item.Status =
            "Acknowledged";

        item.AcknowledgedAt =
            DateTime.UtcNow;

        item.AcknowledgedByUserId =
            userId;

        item.AssignedToUserId ??=
            userId;

        _db.OperationsExceptionHistories.Add(
            new OperationsExceptionHistory
            {
                OperationsExceptionId =
                    item.Id,

                Action =
                    "Acknowledged",

                Description =
                    "Exception acknowledged",

                PerformedByUserId =
                    userId,

                EscalationLevel =
                    item.EscalationLevel
            });

        await _db.SaveChangesAsync(
            cancellationToken);

        await _auditService.LogAsync(
            "OPERATIONS_EXCEPTION_ACKNOWLEDGED",
            $"Exception {item.ExceptionNumber} acknowledged",
            userId);

        return true;
    }

    public async Task<bool> ResolveAsync(
        int id,
        int userId,
        string? resolutionNotes,
        CancellationToken cancellationToken = default)
    {
        var item =
            await _db.OperationsExceptions
                .FirstOrDefaultAsync(
                    x => x.Id == id,
                    cancellationToken);

        if (item == null)
        {
            return false;
        }

        if (item.Status == "Resolved")
        {
            return true;
        }

        item.Status =
            "Resolved";

        item.ResolvedAt =
            DateTime.UtcNow;

        item.ResolvedByUserId =
            userId;

        item.ResolutionNotes =
            resolutionNotes?.Trim();

        _db.OperationsExceptionHistories.Add(
            new OperationsExceptionHistory
            {
                OperationsExceptionId =
                    item.Id,

                Action =
                    "Resolved",

                Description =
                    item.ResolutionNotes,

                PerformedByUserId =
                    userId,

                EscalationLevel =
                    item.EscalationLevel
            });

        await _db.SaveChangesAsync(
            cancellationToken);

        await _auditService.LogAsync(
            "OPERATIONS_EXCEPTION_RESOLVED",
            $"Exception {item.ExceptionNumber} resolved",
            userId);

        await _realtimeOperationsService
            .SystemAlertAsync(
                "Exception resolved",
                $"{item.ExceptionNumber} has been resolved.");

        return true;
    }

    private async Task<int>
        DetectDelayedBookingsAsync(
            CancellationToken cancellationToken)
    {
        var now =
            DateTime.UtcNow;

        var bookings =
            await _db.Bookings
                .AsNoTracking()
                .Where(x =>
                    x.ExpectedDeliveryDate.HasValue &&
                    x.ExpectedDeliveryDate.Value < now &&
                    x.BookingStatus != "Delivered" &&
                    x.BookingStatus != "Cancelled")
                .OrderBy(x => x.ExpectedDeliveryDate)
                .Take(100)
                .ToListAsync(
                    cancellationToken);

        var created =
            0;

        foreach (var booking in bookings)
        {
            var exists =
                await ActiveExceptionExistsAsync(
                    "BOOKING_DELAY",
                    "Booking",
                    booking.BookingNumber,
                    cancellationToken);

            if (exists)
            {
                continue;
            }

            var delayHours =
                (now -
                 booking.ExpectedDeliveryDate!.Value)
                .TotalHours;

            var severity =
                delayHours >= 48
                    ? "Critical"
                    : delayHours >= 24
                        ? "High"
                        : "Medium";

            await CreateExceptionAsync(
                "BOOKING_DELAY",
                severity,
                "Booking",
                booking.BookingNumber,
                $"Booking {booking.BookingNumber} delayed",
                $"Expected delivery was {booking.ExpectedDeliveryDate:O}.",
                bookingId: booking.Id,
                cancellationToken:
                    cancellationToken);

            created++;
        }

        return created;
    }

    private async Task<int>
        DetectDelayedTripsAsync(
            CancellationToken cancellationToken)
    {
        var now =
            DateTime.UtcNow;

        var trips =
            await _db.TransportTrips
                .AsNoTracking()
                .Where(x =>
                    x.ExpectedArrivalAt.HasValue &&
                    x.ExpectedArrivalAt.Value < now &&
                    x.Status != "Completed" &&
                    x.Status != "Cancelled")
                .OrderBy(x => x.ExpectedArrivalAt)
                .Take(100)
                .ToListAsync(
                    cancellationToken);

        var created =
            0;

        foreach (var trip in trips)
        {
            var exists =
                await ActiveExceptionExistsAsync(
                    "TRIP_DELAY",
                    "Trip",
                    trip.TripNumber,
                    cancellationToken);

            if (exists)
            {
                continue;
            }

            await CreateExceptionAsync(
                "TRIP_DELAY",
                "High",
                "Trip",
                trip.TripNumber,
                $"Trip {trip.TripNumber} delayed",
                $"Expected arrival was {trip.ExpectedArrivalAt:O}.",
                tripId: trip.Id,
                cancellationToken:
                    cancellationToken);

            created++;
        }

        return created;
    }

    private async Task<int>
        DetectDriverComplianceAsync(
            CancellationToken cancellationToken)
    {
        var expiryLimit =
            DateTime.UtcNow.AddDays(15);

        var drivers =
            await _db.Drivers
                .AsNoTracking()
                .Where(x =>
                    x.IsActive &&
                    x.LicenseExpiryDate <=
                    expiryLimit)
                .OrderBy(x => x.LicenseExpiryDate)
                .Take(100)
                .ToListAsync(
                    cancellationToken);

        var created =
            0;

        foreach (var driver in drivers)
        {
            var reference =
                driver.Id.ToString();

            var exists =
                await ActiveExceptionExistsAsync(
                    "DRIVER_LICENSE_EXPIRY",
                    "Driver",
                    reference,
                    cancellationToken);

            if (exists)
            {
                continue;
            }

            var severity =
                driver.LicenseExpiryDate <
                DateTime.UtcNow
                    ? "Critical"
                    : "High";

            await CreateExceptionAsync(
                "DRIVER_LICENSE_EXPIRY",
                severity,
                "Driver",
                reference,
                $"Driver license issue - {driver.Name}",
                $"Driving license expires on {driver.LicenseExpiryDate:O}.",
                driverId: driver.Id,
                cancellationToken:
                    cancellationToken);

            created++;
        }

        return created;
    }

    private async Task<int>
        DetectVehicleComplianceAsync(
            CancellationToken cancellationToken)
    {
        var now =
            DateTime.UtcNow;

        var limit =
            now.AddDays(15);

        var vehicles =
            await _db.Vehicles
                .AsNoTracking()
                .Where(x =>
                    x.IsActive &&
                    (
                        x.InsuranceExpiryDate <= limit ||
                        x.FitnessExpiryDate <= limit ||
                        x.PucExpiryDate <= limit ||
                        x.RcExpiryDate <= limit
                    ))
                .OrderBy(x => x.Id)
                .Take(100)
                .ToListAsync(
                    cancellationToken);

        var created =
            0;

        foreach (var vehicle in vehicles)
        {
            var reference =
                vehicle.VehicleNumber;

            var exists =
                await ActiveExceptionExistsAsync(
                    "VEHICLE_COMPLIANCE",
                    "Vehicle",
                    reference,
                    cancellationToken);

            if (exists)
            {
                continue;
            }

            var expired =
                IsExpired(
                    vehicle.InsuranceExpiryDate,
                    now) ||
                IsExpired(
                    vehicle.FitnessExpiryDate,
                    now) ||
                IsExpired(
                    vehicle.PucExpiryDate,
                    now) ||
                IsExpired(
                    vehicle.RcExpiryDate,
                    now);

            await CreateExceptionAsync(
                "VEHICLE_COMPLIANCE",
                expired
                    ? "Critical"
                    : "High",
                "Vehicle",
                reference,
                $"Vehicle compliance issue - {vehicle.VehicleNumber}",
                "One or more vehicle documents are expired or nearing expiry.",
                vehicleId: vehicle.Id,
                cancellationToken:
                    cancellationToken);

            created++;
        }

        return created;
    }

    private async Task<int>
        DetectDeliveryFailuresAsync(
            CancellationToken cancellationToken)
    {
        var attempts =
            await _db.DeliveryAttempts
                .AsNoTracking()
                .Where(x =>
                    x.Status == "Failed")
                .OrderByDescending(x =>
                    x.AttemptedAt)
                .Take(100)
                .ToListAsync(
                    cancellationToken);

        var grouped =
            attempts
                .GroupBy(x =>
                    x.ShipmentId)
                .Where(x =>
                    x.Count() >= 2);

        var created =
            0;

        foreach (var group in grouped)
        {
            var shipmentId =
                group.Key;

            var shipment =
                await _db.Shipments
                    .AsNoTracking()
                    .FirstOrDefaultAsync(
                        x => x.Id == shipmentId,
                        cancellationToken);

            if (shipment == null ||
                shipment.Status == "Delivered")
            {
                continue;
            }

            var exists =
                await ActiveExceptionExistsAsync(
                    "REPEATED_DELIVERY_FAILURE",
                    "Shipment",
                    shipment.ShipmentNumber,
                    cancellationToken);

            if (exists)
            {
                continue;
            }

            await CreateExceptionAsync(
                "REPEATED_DELIVERY_FAILURE",
                "High",
                "Shipment",
                shipment.ShipmentNumber,
                $"Repeated delivery failure - {shipment.ShipmentNumber}",
                "Shipment has multiple failed delivery attempts.",
                bookingId:
                    shipment.BookingId,
                shipmentId:
                    shipment.Id,
                cancellationToken:
                    cancellationToken);

            created++;
        }

        return created;
    }

    private async Task CreateExceptionAsync(
        string exceptionType,
        string severity,
        string referenceType,
        string referenceNumber,
        string title,
        string description,
        int? bookingId = null,
        int? shipmentId = null,
        int? tripId = null,
        int? driverId = null,
        int? vehicleId = null,
        CancellationToken cancellationToken = default)
    {
        var item =
            new OperationsException
            {
                ExceptionNumber =
                    await GenerateExceptionNumberAsync(
                        cancellationToken),

                ExceptionType =
                    exceptionType,

                Severity =
                    severity,

                Status =
                    "Open",

                ReferenceType =
                    referenceType,

                ReferenceNumber =
                    referenceNumber,

                BookingId =
                    bookingId,

                ShipmentId =
                    shipmentId,

                TripId =
                    tripId,

                DriverId =
                    driverId,

                VehicleId =
                    vehicleId,

                Title =
                    title,

                Description =
                    description,

                DetectedAt =
                    DateTime.UtcNow,

                EscalationLevel =
                    1,

                AssignedDepartment =
                    "Operations",

                DueAt =
                    CalculateNextDueAt(
                        1,
                        DateTime.UtcNow),

                IsAutoGenerated =
                    true
            };

        _db.OperationsExceptions.Add(
            item);

        await _db.SaveChangesAsync(
            cancellationToken);

        _db.OperationsExceptionHistories.Add(
            new OperationsExceptionHistory
            {
                OperationsExceptionId =
                    item.Id,

                Action =
                    "Created",

                Description =
                    description,

                EscalationLevel =
                    item.EscalationLevel
            });

        await _db.SaveChangesAsync(
            cancellationToken);

        await _realtimeOperationsService
            .SystemAlertAsync(
                title,
                description);
    }

    private async Task<bool>
        ActiveExceptionExistsAsync(
            string exceptionType,
            string referenceType,
            string referenceNumber,
            CancellationToken cancellationToken)
    {
        return await _db.OperationsExceptions
            .AsNoTracking()
            .AnyAsync(
                x =>
                    x.ExceptionType ==
                        exceptionType &&
                    x.ReferenceType ==
                        referenceType &&
                    x.ReferenceNumber ==
                        referenceNumber &&
                    x.Status !=
                        "Resolved" &&
                    x.Status !=
                        "Closed",
                cancellationToken);
    }

    private async Task<string>
        GenerateExceptionNumberAsync(
            CancellationToken cancellationToken)
    {
        for (var i = 0;
             i < 5;
             i++)
        {
            var value =
                $"EXC-{DateTime.UtcNow:yyyyMMdd}-{Random.Shared.Next(100000, 999999)}";

            var exists =
                await _db.OperationsExceptions
                    .IgnoreQueryFilters()
                    .AnyAsync(
                        x =>
                            x.ExceptionNumber ==
                            value,
                        cancellationToken);

            if (!exists)
            {
                return value;
            }
        }

        return $"EXC-{Guid.NewGuid():N}"
            .Substring(
                0,
                20)
            .ToUpperInvariant();
    }

    private static DateTime CalculateNextDueAt(
        int escalationLevel,
        DateTime now)
    {
        return escalationLevel switch
        {
            1 => now.AddHours(4),
            2 => now.AddHours(2),
            3 => now.AddHours(1),
            _ => now.AddMinutes(30)
        };
    }

    private static string
        GetSeverityForEscalation(
            int escalationLevel)
    {
        return escalationLevel switch
        {
            1 => "Medium",
            2 => "High",
            3 => "Critical",
            _ => "Critical"
        };
    }

    private static string
        GetDepartmentForEscalation(
            int escalationLevel)
    {
        return escalationLevel switch
        {
            1 => "Operations",
            2 => "Hub Management",
            3 => "Management",
            _ => "Senior Management"
        };
    }

    private static bool IsExpired(
        DateTime? date,
        DateTime now)
    {
        return date.HasValue &&
               date.Value < now;
    }
}

