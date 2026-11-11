using ASK.Group.Api.Authorization;
using ASK.Group.Api.DTOs;
using ASK.Group.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace ASK.Group.Api.Controllers;

[ApiController]
[Route("api/management/bookings")]
public class BookingManagementController
    : ControllerBase
{
    private readonly BookingQueryService
        _bookingQueryService;

    public BookingManagementController(
        BookingQueryService bookingQueryService)
    {
        _bookingQueryService =
            bookingQueryService;
    }

    [HttpGet]
    [HasPermission(
        Permissions.Bookings.View)]
    public async Task<IActionResult> Get(
        [FromQuery]
        BookingFilterRequest request,
        CancellationToken cancellationToken)
    {
        var result =
            await _bookingQueryService
                .GetAsync(
                    request,
                    null,
                    cancellationToken);

        return Ok(result);
    }
}