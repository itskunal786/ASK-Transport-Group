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
public class BranchController : ControllerBase
{
    private readonly AskTransportDbContext _db;
    private readonly AuditService _auditService;

    public BranchController(
        AskTransportDbContext db,
        AuditService auditService)
    {
        _db = db;
        _auditService = auditService;
    }

    [HttpGet]
    [HasPermission(Permissions.Branches.View)]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? search,
        [FromQuery] bool? active)
    {
        var query = _db.Branches
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            search = search.Trim();

            query = query.Where(x =>
                x.Name.Contains(search) ||
                x.Code.Contains(search));
        }

        if (active.HasValue)
        {
            query = query.Where(x =>
                x.IsActive == active.Value);
        }

        var data = await query
            .OrderBy(x => x.Name)
            .Select(x => new
            {
                x.Id,
                x.Code,
                x.Name,
                x.Email,
                x.Phone,
                x.Address,
                x.PinCode,
                x.StateId,
                State = x.State != null
                    ? x.State.Name
                    : null,
                x.CityId,
                City = x.City != null
                    ? x.City.Name
                    : null,
                x.ManagerUserId,
                Manager = x.ManagerUser != null
                    ? x.ManagerUser.Name
                    : null,
                x.IsActive,
                x.CreatedAt,

                HubCount = _db.Hubs.Count(h =>
                    h.BranchId == x.Id)
            })
            .ToListAsync();

        return Ok(data);
    }

    [HttpGet("{id:int}")]
    [HasPermission(Permissions.Branches.View)]
    public async Task<IActionResult> GetById(int id)
    {
        var branch = await _db.Branches
            .AsNoTracking()
            .Where(x => x.Id == id)
            .Select(x => new
            {
                x.Id,
                x.Code,
                x.Name,
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
                x.CreatedAt,
                x.UpdatedAt
            })
            .FirstOrDefaultAsync();

        if (branch == null)
        {
            return NotFound(new
            {
                message = "Branch not found"
            });
        }

        return Ok(branch);
    }

    [HttpPost]
    [HasPermission(Permissions.Branches.Create)]
    public async Task<IActionResult> Create(
        BranchRequest request)
    {
        var validation =
            await ValidateLocationAsync(
                request.StateId,
                request.CityId);

        if (validation != null)
            return validation;

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
                    message = "Invalid branch manager"
                });
            }
        }

        var code = request.Code
            .Trim()
            .ToUpperInvariant();

        var exists = await _db.Branches
            .AnyAsync(x => x.Code == code);

        if (exists)
        {
            return BadRequest(new
            {
                message = "Branch code already exists"
            });
        }

        var branch = new Branch
        {
            Code = code,
            Name = request.Name.Trim(),
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

        _db.Branches.Add(branch);

        await _db.SaveChangesAsync();

        await _auditService.LogAsync(
            "BRANCH_CREATED",
            $"Branch {branch.Code} - {branch.Name} created");

        return Ok(new
        {
            message = "Branch created successfully",
            branch
        });
    }

    [HttpPut("{id:int}")]
    [HasPermission(Permissions.Branches.Edit)]
    public async Task<IActionResult> Update(
        int id,
        BranchRequest request)
    {
        var branch = await _db.Branches
            .FirstOrDefaultAsync(x =>
                x.Id == id);

        if (branch == null)
        {
            return NotFound(new
            {
                message = "Branch not found"
            });
        }

        var validation =
            await ValidateLocationAsync(
                request.StateId,
                request.CityId);

        if (validation != null)
            return validation;

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
                    message = "Invalid branch manager"
                });
            }
        }

        var code = request.Code
            .Trim()
            .ToUpperInvariant();

        var duplicate = await _db.Branches
            .AnyAsync(x =>
                x.Id != id &&
                x.Code == code);

        if (duplicate)
        {
            return BadRequest(new
            {
                message = "Branch code already exists"
            });
        }

        branch.Code = code;
        branch.Name = request.Name.Trim();
        branch.Email = request.Email?.Trim();
        branch.Phone = request.Phone?.Trim();
        branch.Address = request.Address?.Trim();
        branch.StateId = request.StateId;
        branch.CityId = request.CityId;
        branch.PinCode = request.PinCode?.Trim();
        branch.ManagerUserId = request.ManagerUserId;
        branch.IsActive = request.IsActive;
        branch.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        await _auditService.LogAsync(
            "BRANCH_UPDATED",
            $"Branch {branch.Code} updated");

        return Ok(new
        {
            message = "Branch updated successfully",
            branch
        });
    }

    [HttpPut("{id:int}/status")]
    [HasPermission(Permissions.Branches.Edit)]
    public async Task<IActionResult> ChangeStatus(
        int id,
        [FromQuery] bool active)
    {
        var branch = await _db.Branches
            .FirstOrDefaultAsync(x =>
                x.Id == id);

        if (branch == null)
        {
            return NotFound(new
            {
                message = "Branch not found"
            });
        }

        branch.IsActive = active;
        branch.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        await _auditService.LogAsync(
            active
                ? "BRANCH_ACTIVATED"
                : "BRANCH_DEACTIVATED",
            $"Branch {branch.Code} status changed");

        return Ok(new
        {
            message = active
                ? "Branch activated successfully"
                : "Branch deactivated successfully"
        });
    }

    [HttpDelete("{id:int}")]
    [HasPermission(Permissions.Branches.Delete)]
    public async Task<IActionResult> Delete(int id)
    {
        var branch = await _db.Branches
            .FirstOrDefaultAsync(x =>
                x.Id == id);

        if (branch == null)
        {
            return NotFound(new
            {
                message = "Branch not found"
            });
        }

        var hasHubs = await _db.Hubs
            .AnyAsync(x =>
                x.BranchId == id);

        if (hasHubs)
        {
            return BadRequest(new
            {
                message =
                    "Branch contains hubs. Deactivate it instead."
            });
        }

        _db.Branches.Remove(branch);

        await _db.SaveChangesAsync();

        await _auditService.LogAsync(
            "BRANCH_DELETED",
            $"Branch {branch.Code} deleted");

        return Ok(new
        {
            message = "Branch deleted successfully"
        });
    }

    private async Task<IActionResult?>
        ValidateLocationAsync(
            int stateId,
            int cityId)
    {
        var stateExists =
            await _db.States.AnyAsync(x =>
                x.Id == stateId);

        if (!stateExists)
        {
            return BadRequest(new
            {
                message = "Invalid state"
            });
        }

        var cityExists =
            await _db.Cities.AnyAsync(x =>
                x.Id == cityId &&
                x.StateId == stateId &&
                x.IsActive);

        if (!cityExists)
        {
            return BadRequest(new
            {
                message =
                    "City does not belong to selected state"
            });
        }

        return null;
    }
}