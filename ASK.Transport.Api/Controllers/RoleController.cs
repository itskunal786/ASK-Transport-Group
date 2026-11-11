using ASK.Group.Api.Data;
using ASK.Group.Api.DTOs;
using ASK.Group.Api.Models;
using ASK.Group.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ASK.Group.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RoleController : ControllerBase
{
    private readonly AskTransportDbContext _db;
    private readonly AuditService _auditService;

    public RoleController(
        AskTransportDbContext db,
        AuditService auditService)
    {
        _db = db;
        _auditService = auditService;
    }

    [HttpGet]
    public async Task<IActionResult> GetRoles()
    {
        var roles =
            await _db.AppRoles
                .AsNoTracking()
                .OrderBy(x =>
                    x.Name)
                .Select(x => new
                {
                    x.Id,
                    x.Name,
                    x.Description,
                    x.IsSystemRole,
                    x.IsActive,
                    x.CreatedAt,

                    UserCount =
                        _db.UserRoleAssignments
                            .Count(r =>
                                r.RoleId ==
                                x.Id),

                    PermissionCount =
                        _db.RolePermissions
                            .Count(r =>
                                r.RoleId ==
                                x.Id)
                })
                .ToListAsync();

        return Ok(roles);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetRole(
        int id)
    {
        var role =
            await _db.AppRoles
                .AsNoTracking()
                .FirstOrDefaultAsync(x =>
                    x.Id == id);

        if (role == null)
        {
            return NotFound(new
            {
                message =
                    "Role not found"
            });
        }

        var permissions =
            await (
                from rolePermission
                    in _db.RolePermissions

                join permission
                    in _db.Permissions

                    on rolePermission
                        .PermissionId
                    equals permission.Id

                where
                    rolePermission.RoleId ==
                    id

                orderby
                    permission.Module,
                    permission.Action

                select new
                {
                    permission.Id,
                    permission.Code,
                    permission.Module,
                    permission.Action,
                    permission.Description
                }
            )
            .ToListAsync();

        return Ok(new
        {
            role,
            permissions
        });
    }

    [HttpPost]
    public async Task<IActionResult> CreateRole(
        CreateRoleRequest request)
    {
        var name =
            request.Name.Trim();

        var exists =
            await _db.AppRoles
                .AnyAsync(x =>
                    x.Name == name);

        if (exists)
        {
            return BadRequest(new
            {
                message =
                    "Role already exists"
            });
        }

        var role =
            new AppRole
            {
                Name = name,

                Description =
                    request.Description?
                        .Trim(),

                IsSystemRole =
                    false,

                IsActive =
                    true,

                CreatedAt =
                    DateTime.UtcNow
            };

        _db.AppRoles.Add(
            role);

        await _db.SaveChangesAsync();

        await _auditService.LogAsync(
            "ROLE_CREATED",
            $"Role {role.Name} created");

        return Ok(new
        {
            message =
                "Role created successfully",

            role
        });
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateRole(
        int id,
        CreateRoleRequest request)
    {
        var role =
            await _db.AppRoles
                .FirstOrDefaultAsync(x =>
                    x.Id == id);

        if (role == null)
        {
            return NotFound(new
            {
                message =
                    "Role not found"
            });
        }

        var name =
            request.Name.Trim();

        var duplicate =
            await _db.AppRoles
                .AnyAsync(x =>
                    x.Id != id &&
                    x.Name == name);

        if (duplicate)
        {
            return BadRequest(new
            {
                message =
                    "Role already exists"
            });
        }

        role.Name =
            name;

        role.Description =
            request.Description?
                .Trim();

        role.UpdatedAt =
            DateTime.UtcNow;

        await _db.SaveChangesAsync();

        await _auditService.LogAsync(
            "ROLE_UPDATED",
            $"Role {role.Name} updated");

        return Ok(new
        {
            message =
                "Role updated successfully",

            role
        });
    }

    [HttpPut("{id:int}/permissions")]
    public async Task<IActionResult>
        UpdateRolePermissions(
            int id,
            UpdateRolePermissionsRequest request)
    {
        var role =
            await _db.AppRoles
                .FirstOrDefaultAsync(x =>
                    x.Id == id);

        if (role == null)
        {
            return NotFound(new
            {
                message =
                    "Role not found"
            });
        }

        var permissionIds =
            request.PermissionIds
                .Distinct()
                .ToList();

        var validPermissionIds =
            await _db.Permissions
                .Where(x =>
                    permissionIds
                        .Contains(x.Id) &&
                    x.IsActive)
                .Select(x => x.Id)
                .ToListAsync();

        if (validPermissionIds.Count !=
            permissionIds.Count)
        {
            return BadRequest(new
            {
                message =
                    "One or more permissions are invalid"
            });
        }

        var existing =
            await _db.RolePermissions
                .Where(x =>
                    x.RoleId == id)
                .ToListAsync();

        _db.RolePermissions
            .RemoveRange(existing);

        foreach (var permissionId
                 in validPermissionIds)
        {
            _db.RolePermissions.Add(
                new RolePermission
                {
                    RoleId = id,

                    PermissionId =
                        permissionId,

                    CreatedAt =
                        DateTime.UtcNow
                });
        }

        await _db.SaveChangesAsync();

        await _auditService.LogAsync(
            "ROLE_PERMISSIONS_UPDATED",
            $"Permissions updated for role {role.Name}");

        return Ok(new
        {
            message =
                "Role permissions updated successfully",

            roleId =
                role.Id,

            permissionCount =
                validPermissionIds.Count
        });
    }

    [HttpPut("{id:int}/status")]
    public async Task<IActionResult> ChangeStatus(
        int id,
        [FromQuery] bool active)
    {
        var role =
            await _db.AppRoles
                .FirstOrDefaultAsync(x =>
                    x.Id == id);

        if (role == null)
        {
            return NotFound(new
            {
                message =
                    "Role not found"
            });
        }

        if (role.IsSystemRole &&
            !active)
        {
            return BadRequest(new
            {
                message =
                    "System role cannot be disabled"
            });
        }

        role.IsActive =
            active;

        role.UpdatedAt =
            DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return Ok(new
        {
            message =
                active
                    ? "Role activated"
                    : "Role deactivated",

            role.Id,
            role.Name,
            role.IsActive
        });
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteRole(
        int id)
    {
        var role =
            await _db.AppRoles
                .FirstOrDefaultAsync(x =>
                    x.Id == id);

        if (role == null)
        {
            return NotFound(new
            {
                message =
                    "Role not found"
            });
        }

        if (role.IsSystemRole)
        {
            return BadRequest(new
            {
                message =
                    "System role cannot be deleted"
            });
        }

        var used =
            await _db.UserRoleAssignments
                .AnyAsync(x =>
                    x.RoleId == id);

        if (used)
        {
            return BadRequest(new
            {
                message =
                    "Role is assigned to users. Remove assignments first."
            });
        }

        var permissions =
            await _db.RolePermissions
                .Where(x =>
                    x.RoleId == id)
                .ToListAsync();

        _db.RolePermissions
            .RemoveRange(permissions);

        _db.AppRoles.Remove(
            role);

        await _db.SaveChangesAsync();

        return Ok(new
        {
            message =
                "Role deleted successfully"
        });
    }
}