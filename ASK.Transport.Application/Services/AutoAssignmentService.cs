using ASK.Group.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace ASK.Group.Api.Services;

public class AutoAssignmentService
{
    private readonly AskTransportDbContext _db;
    private readonly AuditService _auditService;
    private readonly RealtimeOperationsService _realtimeOperationsService;

    public AutoAssignmentService(
        AskTransportDbContext db,
        AuditService auditService,
        RealtimeOperationsService realtimeOperationsService)
    {
        _db = db;
        _auditService = auditService;
        _realtimeOperationsService = realtimeOperationsService;
    }

    public async Task<AutoAssignmentResult> AssignTripAsync(
        int tripId,
        int? performedByUserId = null,
        CancellationToken cancellationToken = default)
    {
        var trip = await _db.TransportTrips
            .FirstOrDefaultAsync(
                x => x.Id == tripId,
                cancellationToken);

        if (trip == null)
        {
            return AutoAssignmentResult.Fail(
                "Trip not found");
        }

        if (string.Equals(
            trip.Status,
            "Completed",
            StringComparison.OrdinalIgnoreCase))
        {
            return AutoAssignmentResult.Fail(
                "Completed trip cannot be assigned");
        }

        if (string.Equals(
            trip.Status,
            "Cancelled",
            StringComparison.OrdinalIgnoreCase))
        {
            return AutoAssignmentResult.Fail(
                "Cancelled trip cannot be assigned");
        }

        if (trip.DriverId > 0 ||
            trip.VehicleId > 0)
        {
            return AutoAssignmentResult.Fail(
                "Trip already has a driver or vehicle assigned");
        }

        if (trip.TotalWeight <= 0)
        {
            return AutoAssignmentResult.Fail(
                "Trip total weight must be greater than zero");
        }

        var driver = await _db.Drivers
            .Where(x =>
                x.IsActive &&
                x.IsAvailable &&
                x.HubId == trip.FromHubId)
            .OrderByDescending(x =>
                x.IsVerified)
            .ThenBy(x =>
                x.Id)
            .FirstOrDefaultAsync(
                cancellationToken);

        if (driver == null)
        {
            return AutoAssignmentResult.Fail(
                "No available driver found at origin hub");
        }

        var vehicle = await _db.Vehicles
            .Where(x =>
                x.IsActive &&
                x.IsAvailable &&
                x.HubId == trip.FromHubId &&
                x.CapacityKg >= trip.TotalWeight)
            .OrderBy(x =>
                x.CapacityKg)
            .ThenBy(x =>
                x.Id)
            .FirstOrDefaultAsync(
                cancellationToken);

        if (vehicle == null)
        {
            return AutoAssignmentResult.Fail(
                "No suitable vehicle found for trip weight at origin hub");
        }

        trip.DriverId = driver.Id;
        trip.VehicleId = vehicle.Id;
        trip.UpdatedAt = DateTime.UtcNow;

        driver.IsAvailable = false;
        driver.Status = "Assigned";
        driver.UpdatedAt = DateTime.UtcNow;

        vehicle.IsAvailable = false;
        vehicle.Status = "Assigned";
        vehicle.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(
            cancellationToken);

        await _auditService.LogAsync(
            "AUTO_TRIP_ASSIGNMENT",
            $"Trip {trip.TripNumber} automatically assigned to driver {driver.Name} and vehicle {vehicle.VehicleNumber}",
            performedByUserId);

        await _realtimeOperationsService
            .SystemAlertAsync(
                "Trip auto assigned",
                $"Trip {trip.TripNumber} assigned to {driver.Name} / {vehicle.VehicleNumber}.",
                "Info");

        return AutoAssignmentResult.CreateSuccess(
            trip.Id,
            trip.TripNumber,
            driver.Id,
            driver.Name,
            vehicle.Id,
            vehicle.VehicleNumber,
            vehicle.CapacityKg);
    }

    public async Task<AutoAssignmentPreviewResult>
        PreviewTripAssignmentAsync(
            int tripId,
            CancellationToken cancellationToken = default)
    {
        var trip = await _db.TransportTrips
            .AsNoTracking()
            .FirstOrDefaultAsync(
                x => x.Id == tripId,
                cancellationToken);

        if (trip == null)
        {
            return AutoAssignmentPreviewResult.Fail(
                "Trip not found");
        }

        if (string.Equals(
            trip.Status,
            "Completed",
            StringComparison.OrdinalIgnoreCase))
        {
            return AutoAssignmentPreviewResult.Fail(
                "Completed trip cannot be assigned");
        }

        if (string.Equals(
            trip.Status,
            "Cancelled",
            StringComparison.OrdinalIgnoreCase))
        {
            return AutoAssignmentPreviewResult.Fail(
                "Cancelled trip cannot be assigned");
        }

        if (trip.DriverId > 0 ||
            trip.VehicleId > 0)
        {
            return AutoAssignmentPreviewResult.Fail(
                "Trip already has a driver or vehicle assigned");
        }

        if (trip.TotalWeight <= 0)
        {
            return AutoAssignmentPreviewResult.Fail(
                "Trip total weight must be greater than zero");
        }

        var driver = await _db.Drivers
            .AsNoTracking()
            .Where(x =>
                x.IsActive &&
                x.IsAvailable &&
                x.HubId == trip.FromHubId)
            .OrderByDescending(x =>
                x.IsVerified)
            .ThenBy(x =>
                x.Id)
            .Select(x => new
            {
                x.Id,
                x.Name,
                x.Phone,
                x.IsVerified
            })
            .FirstOrDefaultAsync(
                cancellationToken);

        var vehicle = await _db.Vehicles
            .AsNoTracking()
            .Where(x =>
                x.IsActive &&
                x.IsAvailable &&
                x.HubId == trip.FromHubId &&
                x.CapacityKg >= trip.TotalWeight)
            .OrderBy(x =>
                x.CapacityKg)
            .ThenBy(x =>
                x.Id)
            .Select(x => new
            {
                x.Id,
                x.VehicleNumber,
                x.VehicleType,
                x.CapacityKg
            })
            .FirstOrDefaultAsync(
                cancellationToken);

        if (driver == null)
        {
            return new AutoAssignmentPreviewResult
            {
                Success = false,
                Message = "No available driver found",
                TripId = trip.Id,
                TripNumber = trip.TripNumber,
                TripWeight = trip.TotalWeight
            };
        }

        if (vehicle == null)
        {
            return new AutoAssignmentPreviewResult
            {
                Success = false,
                Message = "No suitable vehicle found",
                TripId = trip.Id,
                TripNumber = trip.TripNumber,
                TripWeight = trip.TotalWeight,
                DriverId = driver.Id,
                DriverName = driver.Name,
                DriverPhone = driver.Phone,
                DriverVerified = driver.IsVerified
            };
        }

        return new AutoAssignmentPreviewResult
        {
            Success = true,
            Message =
                "Suitable driver and vehicle found",

            TripId = trip.Id,
            TripNumber = trip.TripNumber,
            TripWeight = trip.TotalWeight,

            DriverId = driver.Id,
            DriverName = driver.Name,
            DriverPhone = driver.Phone,
            DriverVerified = driver.IsVerified,

            VehicleId = vehicle.Id,
            VehicleNumber = vehicle.VehicleNumber,
            VehicleType = vehicle.VehicleType,
            VehicleCapacityKg = vehicle.CapacityKg
        };
    }
}

public class AutoAssignmentResult
{
    public bool Success { get; set; }

    public string Message { get; set; } =
        string.Empty;

    public int? TripId { get; set; }

    public string? TripNumber { get; set; }

    public int? DriverId { get; set; }

    public string? DriverName { get; set; }

    public int? VehicleId { get; set; }

    public string? VehicleNumber { get; set; }

    public decimal? VehicleCapacityKg { get; set; }

    public static AutoAssignmentResult Fail(
        string message)
    {
        return new AutoAssignmentResult
        {
            Success = false,
            Message = message
        };
    }

    public static AutoAssignmentResult CreateSuccess(
        int tripId,
        string tripNumber,
        int driverId,
        string driverName,
        int vehicleId,
        string vehicleNumber,
        decimal vehicleCapacityKg)
    {
        return new AutoAssignmentResult
        {
            Success = true,
            Message =
                "Driver and vehicle assigned successfully",

            TripId = tripId,
            TripNumber = tripNumber,

            DriverId = driverId,
            DriverName = driverName,

            VehicleId = vehicleId,
            VehicleNumber = vehicleNumber,
            VehicleCapacityKg = vehicleCapacityKg
        };
    }
}

public class AutoAssignmentPreviewResult
{
    public bool Success { get; set; }

    public string Message { get; set; } =
        string.Empty;

    public int? TripId { get; set; }

    public string? TripNumber { get; set; }

    public decimal? TripWeight { get; set; }

    public int? DriverId { get; set; }

    public string? DriverName { get; set; }

    public string? DriverPhone { get; set; }

    public bool? DriverVerified { get; set; }

    public int? VehicleId { get; set; }

    public string? VehicleNumber { get; set; }

    public string? VehicleType { get; set; }

    public decimal? VehicleCapacityKg { get; set; }

    public static AutoAssignmentPreviewResult Fail(
        string message)
    {
        return new AutoAssignmentPreviewResult
        {
            Success = false,
            Message = message
        };
    }
}