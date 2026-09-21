using ASK.Group.Api.DTOs;
using ASK.Group.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ASK.Group.Api.Controllers;

[ApiController]
[Route("api/booking-status")]
[Authorize]
public class BookingStatusController
    : ControllerBase
{
    private readonly BookingStatusService
        _bookingStatusService;

    private readonly AuditService
        _auditService;

    public BookingStatusController(
        BookingStatusService bookingStatusService,
        AuditService auditService)
    {
        _bookingStatusService =
            bookingStatusService;

        _auditService =
            auditService;
    }

    [HttpPut("{bookingNumber}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult>
        ChangeStatus(
            string bookingNumber,
            ChangeBookingStatusRequest request)
    {
        if (string.IsNullOrWhiteSpace(
                request.Status))
        {
            return BadRequest(new
            {
                message =
                    "Status is required"
            });
        }

        var result =
            await _bookingStatusService
                .ChangeStatusAsync(
                    bookingNumber,
                    request.Status);

        if (!result.Success)
        {
            if (result.Message ==
                "Booking not found")
            {
                return NotFound(new
                {
                    message =
                        result.Message
                });
            }

            return BadRequest(new
            {
                message =
                    result.Message
            });
        }

        await _auditService.LogAsync(
            "BOOKING_STATUS_CHANGED",
            $"Booking {bookingNumber} changed to {result.Status}",
            null,
            User.Identity?.Name);

        return Ok(result);
    }
}