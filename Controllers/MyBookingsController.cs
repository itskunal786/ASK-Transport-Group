using ASK.Group.Api.Authorization;
using ASK.Group.Api.DTOs;
using ASK.Group.Api.Services;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ASK.Group.Api.Controllers;

[ApiController]
[Route("api/my/bookings")]
public class MyBookingsController
    : ControllerBase
{
    private readonly BookingQueryService
        _bookingQueryService;

    public MyBookingsController(
        BookingQueryService bookingQueryService)
    {
        _bookingQueryService =
            bookingQueryService;
    }

    [HttpGet]
    [HasPermission(
        Permissions.Bookings.ViewOwn)]
    public async Task<IActionResult> Get(
        [FromQuery]
        BookingFilterRequest request,
        CancellationToken cancellationToken)
    {
        var userIdText =
            User.FindFirstValue(
                ClaimTypes.NameIdentifier);

        if (!int.TryParse(
            userIdText,
            out var userId))
        {
            return Unauthorized(new
            {
                message =
                    "Invalid user session"
            });
        }

        var result =
            await _bookingQueryService
                .GetAsync(
                    request,
                    userId,
                    cancellationToken);

        return Ok(result);
    }
}