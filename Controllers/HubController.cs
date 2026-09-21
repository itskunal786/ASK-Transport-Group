using ASK.Group.Api.Authorization;
using ASK.Group.Api.Data;
using ASK.Group.Api.DTOs;
using ASK.Group.Api.Models;
using ASK.Group.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ASK.Group.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HubController : ControllerBase
{
    private readonly AskTransportDbContext _db;
    private readonly AuditService _auditService;

    public HubController(
        AskTransportDbContext db,
        AuditService auditService)
    {
        _db = db;
        _auditService = auditService;
    }

    [HttpGet]
    [HasPermission(Permissions.Hubs.View)]
    public async Task<IActionResult> GetAll(
        [FromQuery] int? branchId,
        [FromQuery] bool? active,
        [FromQuery] string? search)
    {
        var query = _db.Hubs
            .AsNoTracking()
            .AsQueryable();

        if (branchId.HasValue)
        {
            query = query.Where(x =>
                x.BranchId == branchId.Value);
        }

        if (active.HasValue)
        {
            query = query.Where(x =>
                x.IsActive == active.Value);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            search = search.Trim();

            query = query.Where(x =>
                x.Name.Contains(search) ||
                x.Code.Contains(search));
        }

        var data = await query
            .OrderBy(x => x.Name)
            .Select(x => new
            {
                x.Id,
                x.Code,
                x.Name,

                x.BranchId,

                Branch = x.Branch != null
                    ? x.Branch.Name
                    : null,

                x.Email,
                x.Phone,
                x.Address,

                x.StateId,

                State = x.State != null
                    ? x.State.Name
                    : null,

                x.CityId,

                City = x.City != null
                    ? x.City.Name
                    : null,

                x.PinCode,

                x.ManagerUserId,

                Manager = x.ManagerUser != null
                    ? x.ManagerUser.Name
                    : null,

                x.IsActive,
                x.CreatedAt
            })
            .ToListAsync();

        return Ok(data);
    }

    [HttpGet("{id:int}")]
    [HasPermission(Permissions.Hubs.View)]
    public async Task<IActionResult> GetById(int id)
    {
        var hub = await _db.Hubs
            .AsNoTracking()
            .Where(x => x.Id == id)
            .Select(x => new
            {
                x.Id,
                x.Code,
                x.Name,
                x.BranchId,

                Branch = x.Branch != null
                    ? x.Branch.Name
                    : null,

                x.Email,
                x.Phone,
                x.Address,
                x.StateId,
                x.CityId,
                x.PinCode,
                x.ManagerUserId,
                x.IsActive,
                x.CreatedAt,
                x.UpdatedAt
            })
            .FirstOrDefaultAsync();

        if (hub == null)
        {
            return NotFound(new
            {
                message = "Hub not found"
            });
        }

        return Ok(hub);
    }

    [HttpPost]
    [HasPermission(Permissions.Hubs.Create)]
    public async Task<IActionResult> Create(
        HubRequest request)
    {
        var error =
            await ValidateAsync(request);

        if (error != null)
            return error;

        var code = request.Code
            .Trim()
            .ToUpperInvariant();

        if (await _db.Hubs.AnyAsync(x =>
            x.Code == code))
        {
            return BadRequest(new
            {
                message = "Hub code already exists"
            });
        }

        var hub = new Hub
        {
            Code = code,
            Name = request.Name.Trim(),
            BranchId = request.BranchId,
            Email = request.Email?.Trim(),
            Phone = request.Phone?.Trim(),
            Address = request.Address?.Trim(),
            StateId = request.StateId,
            CityId = request.CityId,
            PinCode = request.PinCode?.Trim(),
            ManagerUserId = request.ManagerUserId,
            IsActive = request.IsActive,
            CreatedAt = DateTime.UtcNow
        };

        _db.Hubs.Add(hub);

        await _db.SaveChangesAsync();

        await _auditService.LogAsync(
            "HUB_CREATED",
            $"Hub {hub.Code} - {hub.Name} created");

        return Ok(new
        {
            message = "Hub created successfully",
            hub
        });
    }

    [HttpPut("{id:int}")]
    [HasPermission(Permissions.Hubs.Edit)]
    public async Task<IActionResult> Update(
        int id,
        HubRequest request)
    {
        var hub = await _db.Hubs
            .FirstOrDefaultAsync(x =>
                x.Id == id);

        if (hub == null)
        {
            return NotFound(new
            {
                message = "Hub not found"
            });
        }

        var error =
            await ValidateAsync(request);

        if (error != null)
            return error;

        var code = request.Code
            .Trim()
            .ToUpperInvariant();

        var duplicate =
            await _db.Hubs.AnyAsync(x =>
                x.Id != id &&
                x.Code == code);

        if (duplicate)
        {
            return BadRequest(new
            {
                message = "Hub code already exists"
            });
        }

        hub.Code = code;
        hub.Name = request.Name.Trim();
        hub.BranchId = request.BranchId;
        hub.Email = request.Email?.Trim();
        hub.Phone = request.Phone?.Trim();
        hub.Address = request.Address?.Trim();
        hub.StateId = request.StateId;
        hub.CityId = request.CityId;
        hub.PinCode = request.PinCode?.Trim();
        hub.ManagerUserId = request.ManagerUserId;
        hub.IsActive = request.IsActive;
        hub.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        await _auditService.LogAsync(
            "HUB_UPDATED",
            $"Hub {hub.Code} updated");

        return Ok(new
        {
            message = "Hub updated successfully",
            hub
        });
    }

    [HttpPut("{id:int}/status")]
    [HasPermission(Permissions.Hubs.Edit)]
    public async Task<IActionResult> ChangeStatus(
        int id,
        [FromQuery] bool active)
    {
        var hub = await _db.Hubs
            .FirstOrDefaultAsync(x =>
                x.Id == id);

        if (hub == null)
        {
            return NotFound(new
            {
                message = "Hub not found"
            });
        }

        hub.IsActive = active;
        hub.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        await _auditService.LogAsync(
            active
                ? "HUB_ACTIVATED"
                : "HUB_DEACTIVATED",
            $"Hub {hub.Code} status changed");

        return Ok(new
        {
            message = active
                ? "Hub activated successfully"
                : "Hub deactivated successfully"
        });
    }

    [HttpDelete("{id:int}")]
    [HasPermission(Permissions.Hubs.Delete)]
    public async Task<IActionResult> Delete(int id)
    {
        var hub = await _db.Hubs
            .FirstOrDefaultAsync(x =>
                x.Id == id);

        if (hub == null)
        {
            return NotFound(new
            {
                message = "Hub not found"
            });
        }

        _db.Hubs.Remove(hub);

        await _db.SaveChangesAsync();

        await _auditService.LogAsync(
            "HUB_DELETED",
            $"Hub {hub.Code} deleted");

        return Ok(new
        {
            message = "Hub deleted successfully"
        });
    }

    private async Task<IActionResult?> ValidateAsync(
        HubRequest request)
    {
        var branchExists =
            await _db.Branches.AnyAsync(x =>
                x.Id == request.BranchId &&
                x.IsActive);

        if (!branchExists)
        {
            return BadRequest(new
            {
                message = "Invalid or inactive branch"
            });
        }

        var stateExists =
            await _db.States.AnyAsync(x =>
                x.Id == request.StateId);

        if (!stateExists)
        {
            return BadRequest(new
            {
                message = "Invalid state"
            });
        }

        var cityExists =
            await _db.Cities.AnyAsync(x =>
                x.Id == request.CityId &&
                x.StateId == request.StateId &&
                x.IsActive);

        if (!cityExists)
        {
            return BadRequest(new
            {
                message =
                    "City does not belong to selected state"
            });
        }

        if (request.ManagerUserId.HasValue)
        {
            var managerExists =
                await _db.Users.AnyAsync(x =>
                    x.Id == request.ManagerUserId.Value &&
                    x.IsActive);

            if (!managerExists)
            {
                return BadRequest(new
                {
                    message = "Invalid hub manager"
                });
            }
        }

        return null;
    }
}