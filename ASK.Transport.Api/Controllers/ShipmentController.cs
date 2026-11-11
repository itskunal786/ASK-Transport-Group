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
public class ShipmentController : ControllerBase
{
    private readonly AskTransportDbContext _db;
    private readonly AuditService _auditService;
    private readonly NotificationService _notificationService;

    public ShipmentController(
        AskTransportDbContext db,
        AuditService auditService,
        NotificationService notificationService)
    {
        _db = db;
        _auditService = auditService;
        _notificationService = notificationService;
    }

    [HttpGet]
    [HasPermission(Permissions.Shipments.View)]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? search,
        [FromQuery] string? status,
        [FromQuery] int? hubId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 25)
    {
        page = page < 1 ? 1 : page;
        pageSize = pageSize < 1 ? 25 : pageSize;
        pageSize = pageSize > 100 ? 100 : pageSize;

        var query =
            _db.Shipments
                .AsNoTracking()
                .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            search = search.Trim();

            query = query.Where(x =>
                x.ShipmentNumber.Contains(search) ||
                (x.Booking != null &&
                 x.Booking.BookingNumber.Contains(search)));
        }

        if (!string.IsNullOrWhiteSpace(status))
        {
            status = status.Trim();

            query = query.Where(x =>
                x.Status == status);
        }

        if (hubId.HasValue)
        {
            query = query.Where(x =>
                x.CurrentHubId == hubId.Value ||
                x.OriginHubId == hubId.Value ||
                x.DestinationHubId == hubId.Value);
        }

        var totalRecords =
            await query.CountAsync();

        var data =
            await query
                .OrderByDescending(x => x.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(x => new
                {
                    x.Id,
                    x.ShipmentNumber,

                    BookingNumber =
                        x.Booking != null
                            ? x.Booking.BookingNumber
                            : "",

                    x.Status,
                    x.TotalWeight,
                    x.TotalQuantity,

                    OriginHub =
                        x.OriginHub != null
                            ? x.OriginHub.Name
                            : null,

                    DestinationHub =
                        x.DestinationHub != null
                            ? x.DestinationHub.Name
                            : null,

                    CurrentHub =
                        x.CurrentHub != null
                            ? x.CurrentHub.Name
                            : null,

                    x.DispatchedAt,
                    x.ArrivedAtDestinationHub,
                    x.DeliveredAt,
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
    [HasPermission(Permissions.Shipments.View)]
    public async Task<IActionResult> GetById(
        int id)
    {
        var shipment =
            await _db.Shipments
                .AsNoTracking()
                .Where(x => x.Id == id)
                .Select(x => new
                {
                    x.Id,
                    x.ShipmentNumber,

                    BookingNumber =
                        x.Booking != null
                            ? x.Booking.BookingNumber
                            : "",

                    x.BookingId,
                    x.Status,
                    x.TotalWeight,
                    x.TotalQuantity,
                    x.OriginHubId,
                    x.DestinationHubId,
                    x.CurrentHubId,
                    x.DispatchedAt,
                    x.ArrivedAtDestinationHub,
                    x.DeliveredAt,
                    x.Notes,
                    x.CreatedAt,
                    x.UpdatedAt
                })
                .FirstOrDefaultAsync();

        if (shipment == null)
        {
            return NotFound(new
            {
                message =
                    "Shipment not found"
            });
        }

        var movements =
            await _db.ShipmentMovements
                .AsNoTracking()
                .Where(x =>
                    x.ShipmentId == id)
                .OrderBy(x =>
                    x.MovementDate)
                .Select(x => new
                {
                    x.Id,
                    x.Status,

                    FromHub =
                        x.FromHub != null
                            ? x.FromHub.Name
                            : null,

                    ToHub =
                        x.ToHub != null
                            ? x.ToHub.Name
                            : null,

                    x.Location,
                    x.Description,
                    x.MovementDate
                })
                .ToListAsync();

        return Ok(new
        {
            shipment,
            movements
        });
    }

    [HttpPost]
    [HasPermission(Permissions.Shipments.Create)]
    public async Task<IActionResult> Create(
        CreateShipmentRequest request)
    {
        var booking =
            await _db.Bookings
                .FirstOrDefaultAsync(x =>
                    x.BookingNumber ==
                    request.BookingNumber);

        if (booking == null)
        {
            return NotFound(new
            {
                message =
                    "Booking not found"
            });
        }

        if (booking.BookingStatus ==
            "Cancelled")
        {
            return BadRequest(new
            {
                message =
                    "Cancelled booking cannot create shipment"
            });
        }

        var existing =
            await _db.Shipments
                .FirstOrDefaultAsync(x =>
                    x.BookingId == booking.Id);

        if (existing != null)
        {
            return BadRequest(new
            {
                message =
                    "Shipment already exists for this booking",

                existingShipmentNumber =
                    existing.ShipmentNumber
            });
        }

        if (request.OriginHubId.HasValue)
        {
            var validOrigin =
                await _db.Hubs.AnyAsync(x =>
                    x.Id == request.OriginHubId.Value &&
                    x.IsActive);

            if (!validOrigin)
            {
                return BadRequest(new
                {
                    message =
                        "Invalid origin hub"
                });
            }
        }

        if (request.DestinationHubId.HasValue)
        {
            var validDestination =
                await _db.Hubs.AnyAsync(x =>
                    x.Id ==
                        request.DestinationHubId.Value &&
                    x.IsActive);

            if (!validDestination)
            {
                return BadRequest(new
                {
                    message =
                        "Invalid destination hub"
                });
            }
        }

        if (request.OriginHubId.HasValue &&
            request.DestinationHubId.HasValue &&
            request.OriginHubId ==
            request.DestinationHubId)
        {
            return BadRequest(new
            {
                message =
                    "Origin and destination hub cannot be same"
            });
        }

        var shipment =
            new Shipment
            {
                ShipmentNumber =
                    await GenerateShipmentNumberAsync(),

                BookingId =
                    booking.Id,

                OriginHubId =
                    request.OriginHubId,

                DestinationHubId =
                    request.DestinationHubId,

                CurrentHubId =
                    request.OriginHubId,

                Status =
                    "Created",

                TotalWeight =
                    booking.Weight,

                TotalQuantity =
                    booking.Quantity,

                Notes =
                    request.Notes?.Trim(),

                CreatedAt =
                    DateTime.UtcNow
            };

        _db.Shipments.Add(shipment);

        await _db.SaveChangesAsync();

        _db.ShipmentMovements.Add(
            new ShipmentMovement
            {
                ShipmentId =
                    shipment.Id,

                FromHubId =
                    request.OriginHubId,

                ToHubId =
                    request.OriginHubId,

                Status =
                    "Created",

                Description =
                    "Shipment created",

                MovementDate =
                    DateTime.UtcNow,

                CreatedAt =
                    DateTime.UtcNow
            });

        booking.BookingStatus =
            "Shipment Created";

        booking.UpdatedAt =
            DateTime.UtcNow;

        await _db.SaveChangesAsync();

        await _notificationService.CreateAsync(
            booking.UserId,
            "Shipment Created",
            $"Shipment {shipment.ShipmentNumber} created for booking {booking.BookingNumber}.",
            "Shipment",
            booking.Id);

        await _auditService.LogAsync(
            "SHIPMENT_CREATED",
            $"Shipment {shipment.ShipmentNumber} created");

        return Ok(new
        {
            message =
                "Shipment created successfully",

            shipment.Id,
            shipment.ShipmentNumber
        });
    }

    private async Task<string>
        GenerateShipmentNumberAsync()
    {
        for (var i = 0; i < 10; i++)
        {
            var value =
                $"SHP{DateTime.UtcNow:yyyyMMddHHmmssfff}{Random.Shared.Next(100, 999)}";

            if (!await _db.Shipments
                .AnyAsync(x =>
                    x.ShipmentNumber == value))
            {
                return value;
            }
        }

        return $"SHP{Guid.NewGuid():N}"
            .ToUpperInvariant();
    }
}