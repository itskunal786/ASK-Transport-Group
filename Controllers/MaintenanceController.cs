using ASK.Group.Api.Authorization;
using ASK.Group.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace ASK.Group.Api.Controllers;

[ApiController]
[Route("api/maintenance")]
public class MaintenanceController : ControllerBase
{
    private readonly CleanupService _cleanupService;
    private readonly AuditService _auditService;

    public MaintenanceController(
        CleanupService cleanupService,
        AuditService auditService)
    {
        _cleanupService = cleanupService;
        _auditService = auditService;
    }

    [HttpPost("cleanup")]
    [HasPermission(Permissions.Settings.Edit)]
    public async Task<IActionResult> Cleanup()
    {
        var removedRecords =
            await _cleanupService
                .CleanupExpiredDataAsync();

        await _auditService.LogAsync(
            "SYSTEM_CLEANUP",
            $"System cleanup completed. Removed records: {removedRecords}");

        return Ok(new
        {
            message =
                "Cleanup completed successfully",

            removedRecords,

            executedAt =
                DateTime.UtcNow
        });
    }
}