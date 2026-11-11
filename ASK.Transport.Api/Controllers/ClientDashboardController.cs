using ASK.Group.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ASK.Group.Api.Controllers;

[ApiController]
[Route("api/client/dashboard")]
[Authorize]
public sealed class ClientDashboardController : ControllerBase
{
    private readonly ClientDashboardService _dashboardService;

    public ClientDashboardController(
        ClientDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }


    [HttpGet]
    public async Task<IActionResult> GetDashboard(
        CancellationToken cancellationToken)
    {
        var userIdValue =
            User.FindFirstValue(
                ClaimTypes.NameIdentifier);


        if (!int.TryParse(
                userIdValue,
                out var userId))
        {
            return Unauthorized(new
            {
                success = false,
                message = "Invalid user."
            });
        }


        var dashboard =
            await _dashboardService
                .GetDashboardAsync(
                    userId,
                    cancellationToken);


        return Ok(new
        {
            success = true,

            message =
                "Client dashboard loaded successfully.",

            data = dashboard
        });
    }
}