using ASK.Group.Api.DTOs;
using ASK.Group.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ASK.Group.Api.Controllers;

[ApiController]
[Route("api/client/bookings")]
[Authorize]
public sealed class ClientBookingController : ControllerBase
{
    private readonly ClientBookingService _bookingService;

    public ClientBookingController(
        ClientBookingService bookingService)
    {
        _bookingService = bookingService;
    }


    [HttpGet]
    public async Task<IActionResult> GetMyBookings(
        int page = 1,
        int pageSize = 10,
        string? search = null,
        string? status = null,
        DateTime? fromDate = null,
        DateTime? toDate = null,
        string? sortBy = null,
        string? sortOrder = null,
        CancellationToken cancellationToken = default)
    {
        var userId = GetUserId();

        if (userId == null)
        {
            return Unauthorized(new
            {
                success = false,
                message = "Invalid user."
            });
        }

        var result =
            await _bookingService.GetMyBookingsAsync(
                userId.Value,
                page,
                pageSize,
                search,
                status,
                fromDate,
                toDate,
                sortBy,
                sortOrder,
                cancellationToken);

        return Ok(new
        {
            success = true,
            message = "Bookings loaded successfully.",
            data = result
        });
    }


    [HttpGet("{bookingNumber}")]
    public async Task<IActionResult> GetBooking(
        string bookingNumber,
        CancellationToken cancellationToken)
    {
        var userId = GetUserId();

        if (userId == null)
        {
            return Unauthorized(new
            {
                success = false,
                message = "Invalid user."
            });
        }

        var booking =
            await _bookingService.GetBookingAsync(
                userId.Value,
                bookingNumber,
                cancellationToken);

        if (booking == null)
        {
            return NotFound(new
            {
                success = false,
                message = "Booking not found."
            });
        }

        return Ok(new
        {
            success = true,
            message = "Booking loaded successfully.",
            data = booking
        });
    }


    [HttpPut("{bookingNumber}/cancel")]
    public async Task<IActionResult> CancelBooking(
        string bookingNumber,
        [FromBody] CancelClientBookingRequest request,
        CancellationToken cancellationToken)
    {
        var userId = GetUserId();

        if (userId == null)
        {
            return Unauthorized(new
            {
                success = false,
                message = "Invalid user."
            });
        }

        var result =
            await _bookingService.CancelBookingAsync(
                userId.Value,
                bookingNumber,
                request.Reason,
                cancellationToken);

        if (!result.Success)
        {
            return BadRequest(new
            {
                success = false,
                message = result.Message
            });
        }

        return Ok(new
        {
            success = true,
            message = result.Message
        });
    }


    private int? GetUserId()
    {
        var value =
            User.FindFirstValue(
                ClaimTypes.NameIdentifier);

        if (!int.TryParse(value, out var userId))
        {
            return null;
        }

        return userId;
    }
}