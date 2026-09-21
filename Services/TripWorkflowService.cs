using ASK.Group.Api.Data;
using ASK.Group.Api.DTOs;
using ASK.Group.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace ASK.Group.Api.Services;

public class TripWorkflowService
{
    private readonly AskTransportDbContext _db;

    public TripWorkflowService(
        AskTransportDbContext db)
    {
        _db = db;
    }

    public async Task<TripWorkflowResult>
        DispatchAsync(
            int tripId,
            int driverId,
            int vehicleId)
    {
        if (tripId <= 0)
        {
            return Fail(
                tripId,
                "Invalid trip");
        }

        if (driverId <= 0)
        {
            return Fail(
                tripId,
                "Invalid driver");
        }

        if (vehicleId <= 0)
        {
            return Fail(
                tripId,
                "Invalid vehicle");
        }

        var trip =
            await _db.TransportTrips
                .FirstOrDefaultAsync(x =>
                    x.Id == tripId);

        if (trip == null)
        {
            return Fail(
                tripId,
                "Trip not found");
        }

        if (trip.Status != "Planned")
        {
            return Fail(
                tripId,
                $"Trip cannot be dispatched from {trip.Status}");
        }

        var driver =
            await _db.Drivers
                .FirstOrDefaultAsync(x =>
                    x.Id == driverId);

        if (driver == null)
        {
            return Fail(
                tripId,
                "Driver not found");
        }

        if (!driver.IsActive)
        {
            return Fail(
                tripId,
                "Driver is not active");
        }

        if (!driver.IsAvailable)
        {
            return Fail(
                tripId,
                "Driver is not available");
        }

        var vehicle =
            await _db.Vehicles
                .FirstOrDefaultAsync(x =>
                    x.Id == vehicleId);

        if (vehicle == null)
        {
            return Fail(
                tripId,
                "Vehicle not found");
        }

        if (!vehicle.IsActive)
        {
            return Fail(
                tripId,
                "Vehicle is not active");
        }

        if (!vehicle.IsAvailable)
        {
            return Fail(
                tripId,
                "Vehicle is not available");
        }

        var driverBusy =
            await _db.TransportTrips
                .AnyAsync(x =>
                    x.Id != tripId &&
                    x.DriverId == driverId &&
                    (
                        x.Status == "Dispatched" ||
                        x.Status == "In Transit"
                    ));

        if (driverBusy)
        {
            return Fail(
                tripId,
                "Driver is already assigned to an active trip");
        }

        var vehicleBusy =
            await _db.TransportTrips
                .AnyAsync(x =>
                    x.Id != tripId &&
                    x.VehicleId == vehicleId &&
                    (
                        x.Status == "Dispatched" ||
                        x.Status == "In Transit"
                    ));

        if (vehicleBusy)
        {
            return Fail(
                tripId,
                "Vehicle is already assigned to an active trip");
        }

        trip.DriverId = driverId;
        trip.VehicleId = vehicleId;
        trip.Status = "Dispatched";
        trip.UpdatedAt = DateTime.UtcNow;

        driver.IsAvailable = false;
        driver.UpdatedAt = DateTime.UtcNow;

        vehicle.IsAvailable = false;
        vehicle.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return Success(
            trip,
            "Trip dispatched successfully");
    }

    public async Task<TripWorkflowResult>
        StartAsync(int tripId)
    {
        if (tripId <= 0)
        {
            return Fail(
                tripId,
                "Invalid trip");
        }

        var trip =
            await _db.TransportTrips
                .FirstOrDefaultAsync(x =>
                    x.Id == tripId);

        if (trip == null)
        {
            return Fail(
                tripId,
                "Trip not found");
        }

        if (trip.Status == "In Transit")
        {
            return Success(
                trip,
                "Trip is already in transit");
        }

        if (trip.Status != "Dispatched")
        {
            return Fail(
                tripId,
                $"Trip cannot start from {trip.Status}");
        }

        if (trip.DriverId <= 0 ||
            trip.VehicleId <= 0)
        {
            return Fail(
                tripId,
                "Driver and vehicle must be assigned");
        }

        trip.Status = "In Transit";
        trip.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return Success(
            trip,
            "Trip started successfully");
    }

    public async Task<TripWorkflowResult>
        CompleteAsync(int tripId)
    {
        if (tripId <= 0)
        {
            return Fail(
                tripId,
                "Invalid trip");
        }

        var trip =
            await _db.TransportTrips
                .FirstOrDefaultAsync(x =>
                    x.Id == tripId);

        if (trip == null)
        {
            return Fail(
                tripId,
                "Trip not found");
        }

        if (trip.Status == "Completed")
        {
            return Success(
                trip,
                "Trip is already completed");
        }

        if (trip.Status != "In Transit")
        {
            return Fail(
                tripId,
                $"Trip cannot be completed from {trip.Status}");
        }

        var driver =
            trip.DriverId > 0
                ? await _db.Drivers
                    .FirstOrDefaultAsync(x =>
                        x.Id == trip.DriverId)
                : null;

        var vehicle =
            trip.VehicleId > 0
                ? await _db.Vehicles
                    .FirstOrDefaultAsync(x =>
                        x.Id == trip.VehicleId)
                : null;

        trip.Status = "Completed";
        trip.UpdatedAt = DateTime.UtcNow;

        if (driver != null)
        {
            driver.IsAvailable = true;
            driver.UpdatedAt = DateTime.UtcNow;
        }

        if (vehicle != null)
        {
            vehicle.IsAvailable = true;
            vehicle.UpdatedAt = DateTime.UtcNow;
        }

        await _db.SaveChangesAsync();

        return Success(
            trip,
            "Trip completed successfully");
    }

    public async Task<TripWorkflowResult>
        CancelAsync(int tripId)
    {
        if (tripId <= 0)
        {
            return Fail(
                tripId,
                "Invalid trip");
        }

        var trip =
            await _db.TransportTrips
                .FirstOrDefaultAsync(x =>
                    x.Id == tripId);

        if (trip == null)
        {
            return Fail(
                tripId,
                "Trip not found");
        }

        if (trip.Status == "Completed")
        {
            return Fail(
                tripId,
                "Completed trip cannot be cancelled");
        }

        if (trip.Status == "Cancelled")
        {
            return Success(
                trip,
                "Trip is already cancelled");
        }

        var driver =
            trip.DriverId > 0
                ? await _db.Drivers
                    .FirstOrDefaultAsync(x =>
                        x.Id == trip.DriverId)
                : null;

        var vehicle =
            trip.VehicleId > 0
                ? await _db.Vehicles
                    .FirstOrDefaultAsync(x =>
                        x.Id == trip.VehicleId)
                : null;

        trip.Status = "Cancelled";
        trip.UpdatedAt = DateTime.UtcNow;

        if (driver != null)
        {
            driver.IsAvailable = true;
            driver.UpdatedAt = DateTime.UtcNow;
        }

        if (vehicle != null)
        {
            vehicle.IsAvailable = true;
            vehicle.UpdatedAt = DateTime.UtcNow;
        }

        await _db.SaveChangesAsync();

        return Success(
            trip,
            "Trip cancelled successfully");
    }

    private static TripWorkflowResult Fail(
        int tripId,
        string message)
    {
        return new TripWorkflowResult
        {
            Success = false,
            TripId = tripId,
            Message = message
        };
    }

    private static TripWorkflowResult Success(
        TransportTrip trip,
        string message)
    {
        return new TripWorkflowResult
        {
            Success = true,
            TripId = trip.Id,
            Status = trip.Status,
            Message = message
        };
    }
}
