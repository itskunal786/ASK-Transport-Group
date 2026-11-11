using ASK.Group.Api.Authorization;
using ASK.Group.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace ASK.Group.Api.Controllers;

[ApiController]
[Route("api/system/status")]
public class SystemStatusController
    : ControllerBase
{
    private readonly BackendReadinessService
        _backendReadinessService;

    public SystemStatusController(
        BackendReadinessService backendReadinessService)
    {
        _backendReadinessService =
            backendReadinessService;
    }

    [HttpGet]
    [HasPermission(
        Permissions.Settings.View)]
    public async Task<IActionResult> Get(
        CancellationToken cancellationToken)
    {
        var result =
            await _backendReadinessService
                .CheckAsync(
                    cancellationToken);

        if (!result.IsReady)
        {
            return StatusCode(
                StatusCodes
                    .Status503ServiceUnavailable,
                result);
        }

        return Ok(result);
    }
}