using ASK.Group.Api.Authorization;
using ASK.Group.Api.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ASK.Group.Api.Controllers;

[ApiController]
[Route("api/permissions")]
public class PermissionController : ControllerBase
{
    private readonly AskTransportDbContext _db;

    public PermissionController(
        AskTransportDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    [HasPermission(Permissions.Roles.View)]
    public async Task<IActionResult> GetPermissions(
        [FromQuery] string? module,
        [FromQuery] bool? active,
        CancellationToken cancellationToken)
    {
        var query =
            _db.Permissions
                .AsNoTracking()
                .AsQueryable();

        if (!string.IsNullOrWhiteSpace(
            module))
        {
            module =
                module.Trim();

            query =
                query.Where(x =>
                    x.Module == module);
        }

        if (active.HasValue)
        {
            query =
                query.Where(x =>
                    x.IsActive ==
                    active.Value);
        }

        var permissions =
            await query
                .OrderBy(x =>
                    x.Module)
                .ThenBy(x =>
                    x.Action)
                .Select(x => new
                {
                    x.Id,
                    x.Code,
                    x.Module,
                    x.Action,
                    x.Description,
                    x.IsActive,
                    x.CreatedAt
                })
                .ToListAsync(
                    cancellationToken);

        return Ok(permissions);
    }

    [HttpGet("modules")]
    [HasPermission(Permissions.Roles.View)]
    public async Task<IActionResult> GetModules(
        CancellationToken cancellationToken)
    {
        var modules =
            await _db.Permissions
                .AsNoTracking()
                .Where(x =>
                    x.IsActive)
                .Select(x =>
                    x.Module)
                .Distinct()
                .OrderBy(x =>
                    x)
                .ToListAsync(
                    cancellationToken);

        return Ok(modules);
    }

    [HttpPut("{id:int}/status")]
    [HasPermission(
        Permissions.Roles.ManagePermissions)]
    public async Task<IActionResult> ChangeStatus(
        int id,
        [FromQuery] bool active,
        CancellationToken cancellationToken)
    {
        var permission =
            await _db.Permissions
                .FirstOrDefaultAsync(
                    x => x.Id == id,
                    cancellationToken);

        if (permission == null)
        {
            return NotFound(new
            {
                message =
                    "Permission not found"
            });
        }

        permission.IsActive =
            active;

        await _db.SaveChangesAsync(
            cancellationToken);

        return Ok(new
        {
            message =
                active
                    ? "Permission activated"
                    : "Permission deactivated",

            permission.Id,
            permission.Code,
            permission.IsActive
        });
    }
}