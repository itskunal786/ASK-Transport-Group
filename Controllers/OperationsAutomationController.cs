using ASK.Group.Api.Authorization;
using ASK.Group.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace ASK.Group.Api.Controllers;

[ApiController]
[Route("api/operations/automation")]
public class OperationsAutomationController
    : ControllerBase
{
    private readonly OperationsAlertService
        _operationsAlertService;

    public OperationsAutomationController(
        OperationsAlertService
            operationsAlertService)
    {
        _operationsAlertService =
            operationsAlertService;
    }

    [HttpPost("run-alert-check")]
    [HasPermission(Permissions.Settings.Edit)]
    public async Task<IActionResult> RunAlertCheck(
        CancellationToken cancellationToken)
    {
        await _operationsAlertService
            .CheckAndGenerateAlertsAsync(
                cancellationToken);

        return Ok(new
        {
            message =
                "Operations alert check completed successfully",

            completedAt =
                DateTime.UtcNow
        });
    }
}