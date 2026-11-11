using ASK.Group.Api.Authorization;
using ASK.Group.Api.Data;
using ASK.Group.Api.DTOs;
using ASK.Group.Api.Models;
using ASK.Group.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace ASK.Group.Api.Controllers;

[ApiController]
[Route("api/user-access")]
public class UserAccessController
    : ControllerBase
{
    private readonly AskTransportDbContext _db;
    private readonly PermissionService _permissionService;
    private readonly AdminSafetyService _adminSafetyService;
    private readonly AuditService _auditService;

    public UserAccessController(
        AskTransportDbContext db,
        PermissionService permissionService,
        AdminSafetyService adminSafetyService,
        AuditService auditService)
    {
        _db =
            db;

        _permissionService =
            permissionService;

        _adminSafetyService =
            adminSafetyService;

        _auditService =
            auditService;
    }

    [HttpGet("{userId:int}")]
    [HasPermission(Permissions.Users.View)]
    public async Task<IActionResult> GetUserAccess(
        int userId,
        CancellationToken cancellationToken)
    {
        var user =
            await _db.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(
                    x => x.Id == userId,
                    cancellationToken);

        if (user == null)
        {
            return NotFound(new
            {
                message =
                    "User not found"
            });
        }

        var roles =
            await (
                from assignment
                    in _db.UserRoleAssignments
                        .AsNoTracking()

                join role
                    in _db.AppRoles
                        .AsNoTracking()

                    on assignment.RoleId
                    equals role.Id

                where
                    assignment.UserId ==
                    userId

                orderby
                    role.Name

                select new
                {
                    role.Id,
                    role.Name,
                    role.Description,
                    role.IsSystemRole,
                    role.IsActive
                }
            )
            .ToListAsync(
                cancellationToken);

        var overrides =
            await _db.UserPermissions
                .AsNoTracking()
                .Where(x =>
                    x.UserId == userId)
                .Join(
                    _db.Permissions
                        .AsNoTracking(),

                    overrideItem =>
                        overrideItem.PermissionId,

                    permission =>
                        permission.Id,

                    (
                        overrideItem,
                        permission) =>
                        new
                        {
                            permission.Id,
                            permission.Code,
                            permission.Module,
                            permission.Action,
                            permission.Description,
                            overrideItem.IsGranted,
                            permission.IsActive
                        })
                .OrderBy(x =>
                    x.Module)
                .ThenBy(x =>
                    x.Action)
                .ToListAsync(
                    cancellationToken);

        var effectivePermissions =
            await _permissionService
                .GetUserPermissionsAsync(
                    userId);

        return Ok(new
        {
            user = new
            {
                user.Id,
                user.Name,
                user.Email,
                user.Phone,

                systemRole =
                    user.Role.ToString(),

                user.IsVerified,
                user.IsActive
            },

            isAdministrator =
                user.Role ==
                UserRole.Admin,

            roles,

            overrides,

            effectivePermissions
        });
    }

    [HttpPut("{userId:int}/roles")]
    [HasPermission(
        Permissions.Users.ManagePermissions)]
    public async Task<IActionResult> UpdateRoles(
        int userId,
        UpdateUserRolesRequest request,
        CancellationToken cancellationToken)
    {
        var currentUserId =
            GetCurrentUserId();

        if (currentUserId == null)
        {
            return Unauthorized(new
            {
                message =
                    "Invalid user session"
            });
        }

        _adminSafetyService
            .EnsureCannotModifyOwnPrivilege(
                currentUserId.Value,
                userId);

        var user =
            await _db.Users
                .FirstOrDefaultAsync(
                    x => x.Id == userId,
                    cancellationToken);

        if (user == null)
        {
            return NotFound(new
            {
                message =
                    "User not found"
            });
        }

        if (user.Role ==
            UserRole.Admin)
        {
            return BadRequest(new
            {
                message =
                    "Administrator access cannot be modified through RBAC assignments"
            });
        }

        if (!user.IsActive)
        {
            return BadRequest(new
            {
                message =
                    "Roles cannot be changed for an inactive user"
            });
        }

        var roleIds =
            request.RoleIds
                .Distinct()
                .ToList();

        if (roleIds.Count == 0)
        {
            return BadRequest(new
            {
                message =
                    "At least one active role must be assigned"
            });
        }

        var validRoles =
            await _db.AppRoles
                .AsNoTracking()
                .Where(x =>
                    roleIds.Contains(x.Id) &&
                    x.IsActive)
                .Select(x =>
                    new
                    {
                        x.Id,
                        x.Name
                    })
                .ToListAsync(
                    cancellationToken);

        if (validRoles.Count !=
            roleIds.Count)
        {
            return BadRequest(new
            {
                message =
                    "One or more roles are invalid or inactive"
            });
        }

        var existingAssignments =
            await _db.UserRoleAssignments
                .Where(x =>
                    x.UserId == userId)
                .ToListAsync(
                    cancellationToken);

        if (existingAssignments.Count > 0)
        {
            _db.UserRoleAssignments
                .RemoveRange(
                    existingAssignments);
        }

        foreach (var roleId
                 in roleIds)
        {
            _db.UserRoleAssignments.Add(
                new UserRoleAssignment
                {
                    UserId =
                        userId,

                    RoleId =
                        roleId,

                    CreatedAt =
                        DateTime.UtcNow
                });
        }

        await _db.SaveChangesAsync(
            cancellationToken);

        await _adminSafetyService
            .RevokeSessionsAsync(
                userId);

        var roleNames =
            string.Join(
                ", ",
                validRoles
                    .Select(x =>
                        x.Name));

        await _auditService.LogAsync(
            "USER_ROLES_UPDATED",
            $"Roles updated for user {user.Email}: {roleNames}",
            user.Id,
            user.Email);

        return Ok(new
        {
            message =
                "User roles updated successfully",

            userId =
                user.Id,

            roleCount =
                validRoles.Count,

            roles =
                validRoles
        });
    }

    [HttpPut("{userId:int}/permissions")]
    [HasPermission(
        Permissions.Users.ManagePermissions)]
    public async Task<IActionResult>
        UpdatePermissions(
            int userId,
            UpdateUserPermissionsRequest request,
            CancellationToken cancellationToken)
    {
        var currentUserId =
            GetCurrentUserId();

        if (currentUserId == null)
        {
            return Unauthorized(new
            {
                message =
                    "Invalid user session"
            });
        }

        _adminSafetyService
            .EnsureCannotModifyOwnPrivilege(
                currentUserId.Value,
                userId);

        var user =
            await _db.Users
                .FirstOrDefaultAsync(
                    x => x.Id == userId,
                    cancellationToken);

        if (user == null)
        {
            return NotFound(new
            {
                message =
                    "User not found"
            });
        }

        if (user.Role ==
            UserRole.Admin)
        {
            return BadRequest(new
            {
                message =
                    "Administrator already has full access and cannot have permission overrides"
            });
        }

        if (!user.IsActive)
        {
            return BadRequest(new
            {
                message =
                    "Permissions cannot be changed for an inactive user"
            });
        }

        var duplicatePermissionIds =
            request.Permissions
                .GroupBy(x =>
                    x.PermissionId)
                .Where(x =>
                    x.Count() > 1)
                .Select(x =>
                    x.Key)
                .ToList();

        if (duplicatePermissionIds.Count > 0)
        {
            return BadRequest(new
            {
                message =
                    "Duplicate permission IDs are not allowed",

                duplicatePermissionIds
            });
        }

        var permissionIds =
            request.Permissions
                .Select(x =>
                    x.PermissionId)
                .Distinct()
                .ToList();

        var validPermissionIds =
            await _db.Permissions
                .AsNoTracking()
                .Where(x =>
                    permissionIds.Contains(
                        x.Id) &&
                    x.IsActive)
                .Select(x =>
                    x.Id)
                .ToListAsync(
                    cancellationToken);

        if (validPermissionIds.Count !=
            permissionIds.Count)
        {
            return BadRequest(new
            {
                message =
                    "One or more permissions are invalid or inactive"
            });
        }

        var existing =
            await _db.UserPermissions
                .Where(x =>
                    x.UserId == userId)
                .ToListAsync(
                    cancellationToken);

        if (existing.Count > 0)
        {
            _db.UserPermissions
                .RemoveRange(existing);
        }

        foreach (var item
                 in request.Permissions)
        {
            _db.UserPermissions.Add(
                new UserPermission
                {
                    UserId =
                        userId,

                    PermissionId =
                        item.PermissionId,

                    IsGranted =
                        item.IsGranted,

                    CreatedAt =
                        DateTime.UtcNow
                });
        }

        await _db.SaveChangesAsync(
            cancellationToken);

        await _adminSafetyService
            .RevokeSessionsAsync(
                userId);

        await _auditService.LogAsync(
            "USER_PERMISSIONS_UPDATED",
            $"Permission overrides updated for user {user.Email}. Override count: {request.Permissions.Count}",
            user.Id,
            user.Email);

        var effectivePermissions =
            await _permissionService
                .GetUserPermissionsAsync(
                    userId);

        return Ok(new
        {
            message =
                "User permissions updated successfully",

            userId =
                user.Id,

            overrideCount =
                request.Permissions.Count,

            effectivePermissions
        });
    }

    [HttpDelete(
        "{userId:int}/permissions/{permissionId:int}")]
    [HasPermission(
        Permissions.Users.ManagePermissions)]
    public async Task<IActionResult>
        RemovePermissionOverride(
            int userId,
            int permissionId,
            CancellationToken cancellationToken)
    {
        var currentUserId =
            GetCurrentUserId();

        if (currentUserId == null)
        {
            return Unauthorized(new
            {
                message =
                    "Invalid user session"
            });
        }

        _adminSafetyService
            .EnsureCannotModifyOwnPrivilege(
                currentUserId.Value,
                userId);

        var user =
            await _db.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(
                    x => x.Id == userId,
                    cancellationToken);

        if (user == null)
        {
            return NotFound(new
            {
                message =
                    "User not found"
            });
        }

        if (user.Role ==
            UserRole.Admin)
        {
            return BadRequest(new
            {
                message =
                    "Administrator permissions cannot be modified"
            });
        }

        var item =
            await _db.UserPermissions
                .FirstOrDefaultAsync(
                    x =>
                        x.UserId ==
                            userId &&
                        x.PermissionId ==
                            permissionId,
                    cancellationToken);

        if (item == null)
        {
            return NotFound(new
            {
                message =
                    "User permission override not found"
            });
        }

        var permissionCode =
            await _db.Permissions
                .AsNoTracking()
                .Where(x =>
                    x.Id == permissionId)
                .Select(x =>
                    x.Code)
                .FirstOrDefaultAsync(
                    cancellationToken);

        _db.UserPermissions.Remove(
            item);

        await _db.SaveChangesAsync(
            cancellationToken);

        await _adminSafetyService
            .RevokeSessionsAsync(
                userId);

        await _auditService.LogAsync(
            "USER_PERMISSION_OVERRIDE_REMOVED",
            $"Permission override {permissionCode ?? permissionId.ToString()} removed for user {user.Email}",
            user.Id,
            user.Email);

        return Ok(new
        {
            message =
                "Permission override removed successfully. Role permissions now apply.",

            userId,

            permissionId
        });
    }

    private int? GetCurrentUserId()
    {
        var value =
            User.FindFirstValue(
                ClaimTypes.NameIdentifier);

        return int.TryParse(
            value,
            out var userId)
            ? userId
            : null;
    }
}