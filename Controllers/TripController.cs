using ASK.Group.Api.Authorization;
using ASK.Group.Api.Data;
using ASK.Group.Api.DTOs;
using ASK.Group.Api.Models;
using ASK.Group.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ASK.Group.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TripController : ControllerBase
{
    private readonly AskTransportDbContext _db;
    private readonly AuditService _auditService;
    private readonly NotificationService _notificationService;

    public TripController(
        AskTransportDbContext db,
        AuditService auditService,
        NotificationService notificationService)
    {
        _db = db;
        _auditService = auditService;
        _notificationService = notificationService;
    }

    [HttpGet]
    [HasPermission(Permissions.Trips.View)]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? status,
        [FromQuery] int? hubId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 25)
    {
        page = page < 1 ? 1 : page;
        pageSize = pageSize < 1 ? 25 : pageSize;
        pageSize = pageSize > 100 ? 100 : pageSize;

        var query =
            _db.TransportTrips
                .AsNoTracking()
                .AsQueryable();

        if (!string.IsNullOrWhiteSpace(status))
        {
            status = status.Trim();

            query = query.Where(x =>
                x.Status == status);
        }

        if (hubId.HasValue)
        {
            query = query.Where(x =>
                x.FromHubId == hubId.Value ||
                x.ToHubId == hubId.Value);
        }

        var totalRecords =
            await query.CountAsync();

        var data =
            await query
                .OrderByDescending(x =>
                    x.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(x => new
                {
                    x.Id,
                    x.TripNumber,

                    FromHub =
                        x.FromHub != null
                            ? x.FromHub.Name
                            : "",

                    ToHub =
                        x.ToHub != null
                            ? x.ToHub.Name
                            : "",

                    Driver =
                        x.Driver != null
                            ? x.Driver.Name
                            : "",

                    Vehicle =
                        x.Vehicle != null
                            ? x.Vehicle.VehicleNumber
                            : "",

                    x.Status,
                    x.PlannedDepartureAt,
                    x.ActualDepartureAt,
                    x.ExpectedArrivalAt,
                    x.ActualArrivalAt,
                    x.TotalWeight,
                    x.TotalShipments,
                    x.CreatedAt
                })
                .ToListAsync();

        return Ok(new
        {
            page,
            pageSize,
            totalRecords,

            totalPages =
                (int)Math.Ceiling(
                    totalRecords /
                    (double)pageSize),

            data
        });
    }

    [HttpGet("{id:int}")]
    [HasPermission(Permissions.Trips.View)]
    public async Task<IActionResult> GetById(
        int id)
    {
        var trip =
            await _db.TransportTrips
                .AsNoTracking()
                .Where(x =>
                    x.Id == id)
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
                    x.ActualDepartureAt,
                    x.ExpectedArrivalAt,
                    x.ActualArrivalAt,
                    x.TotalWeight,
                    x.TotalShipments,
                    x.Notes,
                    x.CreatedAt,
                    x.UpdatedAt
                })
                .FirstOrDefaultAsync();

        if (trip == null)
        {
            return NotFound(new
            {
                message =
                    "Trip not found"
            });
        }

        var shipments =
            await (
                from tripShipment
                    in _db.TripShipments

                join shipment
                    in _db.Shipments

                    on tripShipment.ShipmentId
                    equals shipment.Id

                join booking
                    in _db.Bookings

                    on shipment.BookingId
                    equals booking.Id

                where
                    tripShipment.TripId == id

                select new
                {
                    shipment.Id,
                    shipment.ShipmentNumber,
                    booking.BookingNumber,
                    shipment.TotalWeight,
                    shipment.Status
                }
            )
            .ToListAsync();

        return Ok(new
        {
            trip,
            shipments
        });
    }

    [HttpPost]
    [HasPermission(Permissions.Trips.Create)]
    public async Task<IActionResult> Create(
        CreateTripRequest request)
    {
        if (request.FromHubId ==
            request.ToHubId)
        {
            return BadRequest(new
            {
                message =
                    "From hub and to hub cannot be same"
            });
        }

        var fromHub =
            await _db.Hubs
                .FirstOrDefaultAsync(x =>
                    x.Id == request.FromHubId &&
                    x.IsActive);

        var toHub =
            await _db.Hubs
                .FirstOrDefaultAsync(x =>
                    x.Id == request.ToHubId &&
                    x.IsActive);

        if (fromHub == null ||
            toHub == null)
        {
            return BadRequest(new
            {
                message =
                    "Invalid source or destination hub"
            });
        }

        var driver =
            await _db.Drivers
                .FirstOrDefaultAsync(x =>
                    x.Id == request.DriverId);

        if (driver == null ||
            !driver.IsActive ||
            !driver.IsAvailable ||
            !driver.IsVerified)
        {
            return BadRequest(new
            {
                message =
                    "Driver is not available or verified"
            });
        }

        if (driver.LicenseExpiryDate.Date <
            DateTime.UtcNow.Date)
        {
            return BadRequest(new
            {
                message =
                    "Driver license is expired"
            });
        }

        var vehicle =
            await _db.Vehicles
                .FirstOrDefaultAsync(x =>
                    x.Id == request.VehicleId);

        if (vehicle == null ||
            !vehicle.IsActive ||
            !vehicle.IsAvailable)
        {
            return BadRequest(new
            {
                message =
                    "Vehicle is not available"
            });
        }

        if (request.PlannedDepartureAt <
            DateTime.UtcNow.AddMinutes(-5))
        {
            return BadRequest(new
            {
                message =
                    "Planned departure cannot be in the past"
            });
        }

        var shipmentIds =
            request.ShipmentIds
                .Distinct()
                .ToList();

        var shipments =
            await _db.Shipments
                .Where(x =>
                    shipmentIds.Contains(x.Id))
                .ToListAsync();

        if (shipments.Count !=
            shipmentIds.Count)
        {
            return BadRequest(new
            {
                message =
                    "One or more shipments are invalid"
            });
        }

        foreach (var shipment in shipments)
        {
            if (shipment.CurrentHubId !=
                request.FromHubId)
            {
                return BadRequest(new
                {
                    message =
                        $"Shipment {shipment.ShipmentNumber} is not at source hub"
                });
            }

            var alreadyAssigned =
                await _db.TripShipments
                    .AnyAsync(x =>
                        x.ShipmentId == shipment.Id &&
                        x.Trip != null &&
                        x.Trip.Status != "Completed" &&
                        x.Trip.Status != "Cancelled");

            if (alreadyAssigned)
            {
                return BadRequest(new
                {
                    message =
                        $"Shipment {shipment.ShipmentNumber} already assigned to active trip"
                });
            }
        }

        var totalWeight =
            shipments.Sum(x =>
                x.TotalWeight);

        if (totalWeight >
            vehicle.CapacityKg)
        {
            return BadRequest(new
            {
                message =
                    "Shipment weight exceeds vehicle capacity",

                totalWeight,

                vehicleCapacity =
                    vehicle.CapacityKg
            });
        }

        var trip =
            new TransportTrip
            {
                TripNumber =
                    await GenerateTripNumberAsync(),

                FromHubId =
                    request.FromHubId,

                ToHubId =
                    request.ToHubId,

                DriverId =
                    request.DriverId,

                VehicleId =
                    request.VehicleId,

                Status =
                    "Planned",

                PlannedDepartureAt =
                    request.PlannedDepartureAt,

                ExpectedArrivalAt =
                    request.ExpectedArrivalAt,

                TotalWeight =
                    totalWeight,

                TotalShipments =
                    shipments.Count,

                Notes =
                    request.Notes?.Trim(),

                CreatedAt =
                    DateTime.UtcNow
            };

        _db.TransportTrips.Add(trip);

        await _db.SaveChangesAsync();

        foreach (var shipment in shipments)
        {
            _db.TripShipments.Add(
                new TripShipment
                {
                    TripId =
                        trip.Id,

                    ShipmentId =
                        shipment.Id,

                    AssignedAt =
                        DateTime.UtcNow
                });

            shipment.Status =
                "Assigned To Trip";

            shipment.UpdatedAt =
                DateTime.UtcNow;

            _db.ShipmentMovements.Add(
                new ShipmentMovement
                {
                    ShipmentId =
                        shipment.Id,

                    TripId =
                        trip.Id,

                    FromHubId =
                        request.FromHubId,

                    ToHubId =
                        request.ToHubId,

                    Status =
                        "Assigned To Trip",

                    Description =
                        $"Assigned to trip {trip.TripNumber}",

                    MovementDate =
                        DateTime.UtcNow,

                    CreatedAt =
                        DateTime.UtcNow
                });
        }

        driver.IsAvailable = false;
        driver.Status = "Assigned";

        vehicle.IsAvailable = false;
        vehicle.Status = "Assigned";

        await _db.SaveChangesAsync();

        await _auditService.LogAsync(
            "TRIP_CREATED",
            $"Trip {trip.TripNumber} created with {shipments.Count} shipment(s)");

        return Ok(new
        {
            message =
                "Trip created successfully",

            trip.Id,
            trip.TripNumber,
            trip.TotalShipments,
            trip.TotalWeight
        });
    }

    [HttpPut("{id:int}/start")]
    [HasPermission(Permissions.Trips.Start)]
    public async Task<IActionResult> Start(
        int id)
    {
        var trip =
            await _db.TransportTrips
                .Include(x => x.Driver)
                .Include(x => x.Vehicle)
                .FirstOrDefaultAsync(x =>
                    x.Id == id);

        if (trip == null)
        {
            return NotFound(new
            {
                message =
                    "Trip not found"
            });
        }

        if (trip.Status != "Planned")
        {
            return BadRequest(new
            {
                message =
                    "Only planned trip can be started"
            });
        }

        trip.Status =
            "In Transit";

        trip.ActualDepartureAt =
            DateTime.UtcNow;

        trip.UpdatedAt =
            DateTime.UtcNow;

        var shipmentIds =
            await _db.TripShipments
                .Where(x =>
                    x.TripId == id)
                .Select(x =>
                    x.ShipmentId)
                .ToListAsync();

        var shipments =
            await _db.Shipments
                .Where(x =>
                    shipmentIds.Contains(x.Id))
                .Include(x => x.Booking)
                .ToListAsync();

        foreach (var shipment in shipments)
        {
            shipment.Status =
                "In Transit";

            shipment.DispatchedAt ??=
                DateTime.UtcNow;

            shipment.UpdatedAt =
                DateTime.UtcNow;

            if (shipment.Booking != null)
            {
                shipment.Booking.BookingStatus =
                    "In Transit";

                shipment.Booking.UpdatedAt =
                    DateTime.UtcNow;
            }

            _db.ShipmentMovements.Add(
                new ShipmentMovement
                {
                    ShipmentId =
                        shipment.Id,

                    TripId =
                        trip.Id,

                    FromHubId =
                        trip.FromHubId,

                    ToHubId =
                        trip.ToHubId,

                    Status =
                        "In Transit",

                    Description =
                        $"Trip {trip.TripNumber} departed",

                    MovementDate =
                        DateTime.UtcNow,

                    CreatedAt =
                        DateTime.UtcNow
                });
        }

        await _db.SaveChangesAsync();

        foreach (var shipment in shipments)
        {
            if (shipment.Booking != null)
            {
                await _notificationService
                    .CreateBookingStatusAsync(
                        shipment.Booking,
                        "In Transit");
            }
        }

        await _auditService.LogAsync(
            "TRIP_STARTED",
            $"Trip {trip.TripNumber} started");

        return Ok(new
        {
            message =
                "Trip started successfully",

            trip.TripNumber,
            trip.Status,
            trip.ActualDepartureAt
        });
    }

    [HttpPut("{id:int}/complete")]
    [HasPermission(Permissions.Trips.Complete)]
    public async Task<IActionResult> Complete(
        int id)
    {
        var trip =
            await _db.TransportTrips
                .Include(x => x.Driver)
                .Include(x => x.Vehicle)
                .FirstOrDefaultAsync(x =>
                    x.Id == id);

        if (trip == null)
        {
            return NotFound(new
            {
                message =
                    "Trip not found"
            });
        }

        if (trip.Status != "In Transit")
        {
            return BadRequest(new
            {
                message =
                    "Only in-transit trip can be completed"
            });
        }

        trip.Status =
            "Completed";

        trip.ActualArrivalAt =
            DateTime.UtcNow;

        trip.UpdatedAt =
            DateTime.UtcNow;

        var shipmentIds =
            await _db.TripShipments
                .Where(x =>
                    x.TripId == id)
                .Select(x =>
                    x.ShipmentId)
                .ToListAsync();

        var shipments =
            await _db.Shipments
                .Where(x =>
                    shipmentIds.Contains(x.Id))
                .Include(x => x.Booking)
                .ToListAsync();

        foreach (var shipment in shipments)
        {
            shipment.CurrentHubId =
                trip.ToHubId;

            shipment.Status =
                shipment.DestinationHubId ==
                    trip.ToHubId
                    ? "Reached Destination Hub"
                    : "At Hub";

            if (shipment.DestinationHubId ==
                trip.ToHubId)
            {
                shipment.ArrivedAtDestinationHub =
                    DateTime.UtcNow;
            }

            shipment.UpdatedAt =
                DateTime.UtcNow;

            if (shipment.Booking != null)
            {
                shipment.Booking.BookingStatus =
                    shipment.Status;

                shipment.Booking.UpdatedAt =
                    DateTime.UtcNow;
            }

            _db.ShipmentMovements.Add(
                new ShipmentMovement
                {
                    ShipmentId =
                        shipment.Id,

                    TripId =
                        trip.Id,

                    FromHubId =
                        trip.FromHubId,

                    ToHubId =
                        trip.ToHubId,

                    Status =
                        shipment.Status,

                    Description =
                        $"Trip {trip.TripNumber} completed",

                    MovementDate =
                        DateTime.UtcNow,

                    CreatedAt =
                        DateTime.UtcNow
                });
        }

        if (trip.Driver != null)
        {
            trip.Driver.IsAvailable = true;
            trip.Driver.Status = "Available";
            trip.Driver.UpdatedAt = DateTime.UtcNow;
        }

        if (trip.Vehicle != null)
        {
            trip.Vehicle.IsAvailable = true;
            trip.Vehicle.Status = "Available";
            trip.Vehicle.UpdatedAt = DateTime.UtcNow;
        }

        await _db.SaveChangesAsync();

        foreach (var shipment in shipments)
        {
            if (shipment.Booking != null)
            {
                await _notificationService
                    .CreateBookingStatusAsync(
                        shipment.Booking,
                        shipment.Status);
            }
        }

        await _auditService.LogAsync(
            "TRIP_COMPLETED",
            $"Trip {trip.TripNumber} completed");

        return Ok(new
        {
            message =
                "Trip completed successfully",

            trip.TripNumber,
            trip.Status,
            trip.ActualArrivalAt
        });
    }

    private async Task<string>
        GenerateTripNumberAsync()
    {
        for (var i = 0; i < 10; i++)
        {
            var value =
                $"TRP{DateTime.UtcNow:yyyyMMddHHmmssfff}{Random.Shared.Next(100, 999)}";

            if (!await _db.TransportTrips
                .AnyAsync(x =>
                    x.TripNumber == value))
            {
                return value;
            }
        }

        return $"TRP{Guid.NewGuid():N}"
            .ToUpperInvariant();
    }
}