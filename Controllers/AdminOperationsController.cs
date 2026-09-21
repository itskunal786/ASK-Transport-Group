using ASK.Group.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ASK.Group.Api.Controllers;

[ApiController]
[Route("api/admin/operations")]
[Authorize(Roles = "Admin")]
public class AdminOperationsController
    : ControllerBase
{
    private readonly AdminOperationsService
        _operationsService;

    public AdminOperationsController(
        AdminOperationsService operationsService)
    {
        _operationsService =
            operationsService;
    }

    [HttpGet("summary")]
    public async Task<IActionResult>
        GetSummary()
    {
        var result =
            await _operationsService
                .GetSummaryAsync();

        return Ok(result);
    }

    [HttpGet("recent-activity")]
    public async Task<IActionResult>
        GetRecentActivity()
    {
        var result =
            await _operationsService
                .GetRecentActivityAsync();

        return Ok(new
        {
            count = result.Count,
            data = result
        });
    }
}