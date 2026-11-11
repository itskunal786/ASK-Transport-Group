using ASK.Group.Api.Authorization;
using ASK.Group.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ASK.Group.Api.Controllers;

[ApiController]
[Route("api/analytics")]
[Authorize]
public class AdvancedAnalyticsController
    : ControllerBase
{
    private readonly AdvancedAnalyticsService
        _analyticsService;

    public AdvancedAnalyticsController(
        AdvancedAnalyticsService analyticsService)
    {
        _analyticsService =
            analyticsService;
    }

    [HttpGet("executive")]
    [HasPermission(
        Permissions.Reports.View)]
    public async Task<IActionResult>
        Executive(
            [FromQuery] DateTime? from,
            [FromQuery] DateTime? to,
            CancellationToken cancellationToken)
    {
        var result =
            await _analyticsService
                .GetExecutiveDashboardAsync(
                    from,
                    to,
                    cancellationToken);

        return Ok(result);
    }

    [HttpGet("daily-trend")]
    [HasPermission(
        Permissions.Reports.View)]
    public async Task<IActionResult>
        DailyTrend(
            [FromQuery] DateTime? from,
            [FromQuery] DateTime? to,
            CancellationToken cancellationToken)
    {
        var result =
            await _analyticsService
                .GetDailyTrendAsync(
                    from,
                    to,
                    cancellationToken);

        return Ok(result);
    }

    [HttpGet("booking-status")]
    [HasPermission(
        Permissions.Reports.View)]
    public async Task<IActionResult>
        BookingStatus(
            [FromQuery] DateTime? from,
            [FromQuery] DateTime? to,
            CancellationToken cancellationToken)
    {
        var result =
            await _analyticsService
                .GetBookingStatusBreakdownAsync(
                    from,
                    to,
                    cancellationToken);

        return Ok(result);
    }

    [HttpGet("top-routes")]
    [HasPermission(
        Permissions.Reports.View)]
    public async Task<IActionResult>
        TopRoutes(
            [FromQuery] DateTime? from,
            [FromQuery] DateTime? to,
            [FromQuery] int limit = 10,
            CancellationToken cancellationToken = default)
    {
        var result =
            await _analyticsService
                .GetTopRoutesAsync(
                    from,
                    to,
                    limit,
                    cancellationToken);

        return Ok(result);
    }

    [HttpGet("fleet")]
    [HasPermission(
        Permissions.Reports.View)]
    public async Task<IActionResult>
        Fleet(
            CancellationToken cancellationToken)
    {
        var result =
            await _analyticsService
                .GetFleetAnalyticsAsync(
                    cancellationToken);

        return Ok(result);
    }

    [HttpGet("operations")]
    [HasPermission(
        Permissions.Reports.View)]
    public async Task<IActionResult>
        Operations(
            CancellationToken cancellationToken)
    {
        var result =
            await _analyticsService
                .GetOperationsAnalyticsAsync(
                    cancellationToken);

        return Ok(result);
    }
}