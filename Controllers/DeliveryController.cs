using ASK.Group.Api.Authorization;
using ASK.Group.Api.Data;
using ASK.Group.Api.DTOs;
using ASK.Group.Api.Models;
using ASK.Group.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace ASK.Group.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DeliveryController : ControllerBase
{
    private readonly AskTransportDbContext _db;
    private readonly DeliveryService _deliveryService;
    private readonly NotificationService _notificationService;
    private readonly AuditService _auditService;
    private readonly IWebHostEnvironment _environment;

    public DeliveryController(
        AskTransportDbContext db,
        DeliveryService deliveryService,
        NotificationService notificationService,
        AuditService auditService,
        IWebHostEnvironment environment)
    {
        _db = db;
        _deliveryService = deliveryService;
        _notificationService =
            notificationService;
        _auditService = auditService;
        _environment = environment;
    }

    [HttpGet("{bookingNumber}")]
    [HasPermission(Permissions.Delivery.View)]
    public async Task<IActionResult> GetDelivery(
        string bookingNumber)
    {
        var booking =
            await _db.Bookings
                .AsNoTracking()
                .FirstOrDefaultAsync(x =>
                    x.BookingNumber ==
                    bookingNumber);

        if (booking == null)
        {
            return NotFound(new
            {
                message =
                    "Booking not found"
            });
        }

        var shipment =
            await _db.Shipments
                .AsNoTracking()
                .FirstOrDefaultAsync(x =>
                    x.BookingId ==
                    booking.Id);

        if (shipment == null)
        {
            return NotFound(new
            {
                message =
                    "Shipment not found"
            });
        }

        var attempts =
            await _db.DeliveryAttempts
                .AsNoTracking()
                .Where(x =>
                    x.BookingId ==
                    booking.Id)
                .OrderByDescending(x =>
                    x.AttemptNumber)
                .ToListAsync();

        var pod =
            await _db.ProofsOfDelivery
                .AsNoTracking()
                .FirstOrDefaultAsync(x =>
                    x.BookingId ==
                    booking.Id);

        return Ok(new
        {
            booking.BookingNumber,
            booking.BookingStatus,

            shipment =
                new
                {
                    shipment.Id,
                    shipment.ShipmentNumber,
                    shipment.Status,
                    shipment.DeliveredAt
                },

            attempts,

            proofOfDelivery =
                pod
        });
    }

    [HttpPost("generate-otp")]
    [HasPermission(
        Permissions.Delivery.GenerateOtp)]
    public async Task<IActionResult> GenerateOtp(
        GenerateDeliveryOtpRequest request)
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

        var shipment =
            await _db.Shipments
                .FirstOrDefaultAsync(x =>
                    x.BookingId ==
                    booking.Id);

        if (shipment == null)
        {
            return NotFound(new
            {
                message =
                    "Shipment not found"
            });
        }

        var allowedStatuses =
            new[]
            {
                "Reached Destination Hub",
                "Out For Delivery",
                "Delivery Reattempt"
            };

        if (!allowedStatuses.Contains(
            shipment.Status))
        {
            return BadRequest(new
            {
                message =
                    "Shipment is not ready for delivery"
            });
        }

        var result =
            await _deliveryService
                .GenerateOtpAsync(
                    booking,
                    shipment);

        if (_environment.IsDevelopment())
        {
            return Ok(new
            {
                message =
                    "Delivery OTP generated",

                expiresAt =
                    result.Record.ExpiresAt,

                otp =
                    result.Otp
            });
        }

        return Ok(new
        {
            message =
                "Delivery OTP generated",

            expiresAt =
                result.Record.ExpiresAt
        });
    }

    [HttpPost("confirm")]
    [HasPermission(
        Permissions.Delivery.Confirm)]
    public async Task<IActionResult> Confirm(
        ConfirmDeliveryRequest request)
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
            "Delivered")
        {
            return BadRequest(new
            {
                message =
                    "Booking is already delivered"
            });
        }

        var shipment =
            await _db.Shipments
                .FirstOrDefaultAsync(x =>
                    x.BookingId ==
                    booking.Id);

        if (shipment == null)
        {
            return NotFound(new
            {
                message =
                    "Shipment not found"
            });
        }

        var validOtp =
            await _deliveryService
                .VerifyOtpAsync(
                    booking,
                    request.Otp.Trim());

        if (!validOtp)
        {
            return BadRequest(new
            {
                message =
                    "Invalid or expired delivery OTP"
            });
        }

        BookingDocument? podDocument =
            null;

        if (request.PodDocumentId.HasValue)
        {
            podDocument =
                await _db.BookingDocuments
                    .FirstOrDefaultAsync(x =>
                        x.Id ==
                            request.PodDocumentId.Value &&
                        x.BookingId ==
                            booking.Id);

            if (podDocument == null)
            {
                return BadRequest(new
                {
                    message =
                        "Invalid POD document"
                });
            }
        }

        var existingPod =
            await _db.ProofsOfDelivery
                .AnyAsync(x =>
                    x.BookingId ==
                    booking.Id);

        if (existingPod)
        {
            return BadRequest(new
            {
                message =
                    "Proof of delivery already exists"
            });
        }

        var driverId =
            await GetCurrentDriverIdAsync();

        var attemptNumber =
            await _db.DeliveryAttempts
                .CountAsync(x =>
                    x.BookingId ==
                    booking.Id)
            + 1;

        var now =
            DateTime.UtcNow;

        var attempt =
            new DeliveryAttempt
            {
                ShipmentId =
                    shipment.Id,

                BookingId =
                    booking.Id,

                DriverId =
                    driverId,

                AttemptNumber =
                    attemptNumber,

                Status =
                    "Delivered",

                DeliveryLocation =
                    request.DeliveryLocation?
                        .Trim(),

                AttemptedAt =
                    now,

                DeliveredAt =
                    now,

                CreatedAt =
                    now
            };

        var pod =
            new ProofOfDelivery
            {
                BookingId =
                    booking.Id,

                ShipmentId =
                    shipment.Id,

                DriverId =
                    driverId,

                ReceiverName =
                    request.ReceiverName.Trim(),

                ReceiverPhone =
                    request.ReceiverPhone?
                        .Trim(),

                VerificationMethod =
                    "OTP",

                DeliveryLocation =
                    request.DeliveryLocation?
                        .Trim(),

                Notes =
                    request.Notes?
                        .Trim(),

                DocumentId =
                    podDocument?.Id,

                DeliveredAt =
                    now,

                CreatedAt =
                    now
            };

        _db.DeliveryAttempts.Add(
            attempt);

        _db.ProofsOfDelivery.Add(
            pod);

        shipment.Status =
            "Delivered";

        shipment.DeliveredAt =
            now;

        shipment.UpdatedAt =
            now;

        booking.BookingStatus =
            "Delivered";

        booking.DeliveredDate =
            now;

        booking.UpdatedAt =
            now;

        _db.ShipmentMovements.Add(
            new ShipmentMovement
            {
                ShipmentId =
                    shipment.Id,

                Status =
                    "Delivered",

                Location =
                    request.DeliveryLocation?
                        .Trim(),

                Description =
                    $"Delivered to {request.ReceiverName.Trim()}",

                MovementDate =
                    now,

                CreatedAt =
                    now
            });

        await _db.SaveChangesAsync();

        await _notificationService
            .CreateBookingStatusAsync(
                booking,
                "Delivered");

        await _auditService.LogAsync(
            "DELIVERY_CONFIRMED",
            $"Booking {booking.BookingNumber} delivered successfully",
            booking.UserId);

        return Ok(new
        {
            message =
                "Delivery confirmed successfully",

            booking.BookingNumber,
            shipment.ShipmentNumber,
            deliveredAt =
                now,

            receiverName =
                pod.ReceiverName
        });
    }

    [HttpPost("failed-attempt")]
    [HasPermission(
        Permissions.Delivery.FailAttempt)]
    public async Task<IActionResult> FailedAttempt(
        FailedDeliveryRequest request)
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

        var shipment =
            await _db.Shipments
                .FirstOrDefaultAsync(x =>
                    x.BookingId ==
                    booking.Id);

        if (shipment == null)
        {
            return NotFound(new
            {
                message =
                    "Shipment not found"
            });
        }

        if (shipment.Status ==
            "Delivered")
        {
            return BadRequest(new
            {
                message =
                    "Delivered shipment cannot record failed attempt"
            });
        }

        var attemptNumber =
            await _db.DeliveryAttempts
                .CountAsync(x =>
                    x.BookingId ==
                    booking.Id)
            + 1;

        var driverId =
            await GetCurrentDriverIdAsync();

        var now =
            DateTime.UtcNow;

        var attempt =
            new DeliveryAttempt
            {
                ShipmentId =
                    shipment.Id,

                BookingId =
                    booking.Id,

                DriverId =
                    driverId,

                AttemptNumber =
                    attemptNumber,

                Status =
                    "Failed",

                FailureReason =
                    request.Reason.Trim(),

                DeliveryLocation =
                    request.Location?
                        .Trim(),

                AttemptedAt =
                    now,

                NextAttemptAt =
                    request.NextAttemptAt,

                CreatedAt =
                    now
            };

        _db.DeliveryAttempts.Add(
            attempt);

        shipment.Status =
            request.NextAttemptAt.HasValue
                ? "Delivery Reattempt"
                : "Delivery Failed";

        shipment.UpdatedAt =
            now;

        booking.BookingStatus =
            shipment.Status;

        booking.UpdatedAt =
            now;

        _db.ShipmentMovements.Add(
            new ShipmentMovement
            {
                ShipmentId =
                    shipment.Id,

                Status =
                    shipment.Status,

                Location =
                    request.Location?
                        .Trim(),

                Description =
                    request.Reason.Trim(),

                MovementDate =
                    now,

                CreatedAt =
                    now
            });

        await _db.SaveChangesAsync();

        await _notificationService
            .CreateAsync(
                booking.UserId,
                "Delivery Attempt Failed",
                request.NextAttemptAt.HasValue
                    ? $"Delivery attempt failed for booking {booking.BookingNumber}. Next attempt scheduled."
                    : $"Delivery attempt failed for booking {booking.BookingNumber}.",
                "Delivery",
                booking.Id);

        await _auditService.LogAsync(
            "DELIVERY_ATTEMPT_FAILED",
            $"Delivery attempt {attemptNumber} failed for booking {booking.BookingNumber}: {request.Reason.Trim()}",
            booking.UserId);

        return Ok(new
        {
            message =
                "Failed delivery attempt recorded",

            attempt.AttemptNumber,
            shipment.Status,
            attempt.NextAttemptAt
        });
    }

    private async Task<int?> GetCurrentDriverIdAsync()
    {
        var userIdText =
            User.FindFirstValue(
                ClaimTypes.NameIdentifier);

        if (!int.TryParse(
            userIdText,
            out var userId))
        {
            return null;
        }

        return await _db.Drivers
            .Where(x =>
                x.UserId ==
                userId)
            .Select(x =>
                (int?)x.Id)
            .FirstOrDefaultAsync();
    }
}