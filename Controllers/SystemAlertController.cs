using ASK.Group.Api.Authorization;
using ASK.Group.Api.Data;
using ASK.Group.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ASK.Group.Api.Controllers;

[ApiController]
[Route("api/system-alerts")]
public class SystemAlertController
    : ControllerBase
{
    private readonly AskTransportDbContext _db;
    private readonly ComplianceAlertService _complianceAlertService;

    public SystemAlertController(
        AskTransportDbContext db,
        ComplianceAlertService complianceAlertService)
    {
        _db = db;
        _complianceAlertService =
            complianceAlertService;
    }

    [HttpGet]
    [HasPermission(
        Permissions.Notifications.ViewAlerts)]
    public async Task<IActionResult> GetAll(
        [FromQuery] bool? resolved,
        [FromQuery] string? severity)
    {
        var query =
            _db.SystemAlerts
                .AsNoTracking()
                .AsQueryable();

        if (resolved.HasValue)
        {
            query = query.Where(x =>
                x.IsResolved ==
                resolved.Value);
        }

        if (!string.IsNullOrWhiteSpace(
            severity))
        {
            severity =
                severity.Trim();

            query = query.Where(x =>
                x.Severity ==
                severity);
        }

        var data =
            await query
                .OrderByDescending(x =>
                    x.CreatedAt)
                .ToListAsync();

        return Ok(data);
    }

    [HttpPost("refresh")]
    [HasPermission(
        Permissions.Notifications.ViewAlerts)]
    public async Task<IActionResult> Refresh()
    {
        await _complianceAlertService
            .GenerateAlertsAsync();

        return Ok(new
        {
            message =
                "Compliance alerts refreshed"
        });
    }

    [HttpPut("{id:int}/resolve")]
    [HasPermission(
        Permissions.Notifications.ResolveAlerts)]
    public async Task<IActionResult> Resolve(
        int id)
    {
        var alert =
            await _db.SystemAlerts
                .FirstOrDefaultAsync(x =>
                    x.Id == id);

        if (alert == null)
        {
            return NotFound(new
            {
                message =
                    "Alert not found"
            });
        }

        alert.IsResolved =
            true;

        alert.ResolvedAt =
            DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return Ok(new
        {
            message =
                "Alert resolved successfully"
        });
    }
}