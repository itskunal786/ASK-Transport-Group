using ASK.Group.Api.Authorization;
using ASK.Group.Api.Data;
using ASK.Group.Api.DTOs;
using ASK.Group.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace ASK.Group.Api.Controllers;

[ApiController]
[Route("api/admin/security")]
public class AdminSecurityController
    : ControllerBase
{
    private readonly AskTransportDbContext _db;
    private readonly AdminSafetyService _adminSafetyService;
    private readonly AuditService _auditService;

    public AdminSecurityController(
        AskTransportDbContext db,
        AdminSafetyService adminSafetyService,
        AuditService auditService)
    {
        _db = db;
        _adminSafetyService =
            adminSafetyService;

        _auditService =
            auditService;
    }

    [HttpPut("users/{userId:int}/status")]
    [HasPermission(
        Permissions.Users.Edit)]
    public async Task<IActionResult> ChangeStatus(
        int userId,
        ChangeUserStatusRequest request)
    {
        var currentUserId =
            GetCurrentUserId();

        if (currentUserId == null)
        {
            return Unauthorized();
        }

        var user =
            await _db.Users
                .FirstOrDefaultAsync(x =>
                    x.Id == userId);

        if (user == null)
        {
            return NotFound(new
            {
                message =
                    "User not found"
            });
        }

        if (!request.IsActive)
        {
            await _adminSafetyService
                .EnsureCanDeactivateAsync(
                    currentUserId.Value,
                    user);
        }

        user.IsActive =
            request.IsActive;

        await _db.SaveChangesAsync();

        if (!request.IsActive)
        {
            await _adminSafetyService
                .RevokeSessionsAsync(
                    user.Id);
        }

        await _auditService.LogAsync(
            request.IsActive
                ? "USER_ACTIVATED"
                : "USER_DEACTIVATED",

            $"User {user.Email} status changed to {(request.IsActive ? "Active" : "Inactive")}",

            user.Id,
            user.Email);

        return Ok(new
        {
            message =
                request.IsActive
                    ? "User activated successfully"
                    : "User deactivated successfully",

            user.Id,
            user.Email,
            user.IsActive
        });
    }

    [HttpPost("users/{userId:int}/revoke-sessions")]
    [HasPermission(
        Permissions.Users.Edit)]
    public async Task<IActionResult> RevokeSessions(
        int userId)
    {
        var user =
            await _db.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(x =>
                    x.Id == userId);

        if (user == null)
        {
            return NotFound(new
            {
                message =
                    "User not found"
            });
        }

        await _adminSafetyService
            .RevokeSessionsAsync(
                userId);

        await _auditService.LogAsync(
            "USER_SESSIONS_REVOKED",
            $"All sessions revoked for {user.Email}",
            user.Id,
            user.Email);

        return Ok(new
        {
            message =
                "All active sessions revoked successfully"
        });
    }

    [HttpGet("admins")]
    [HasPermission(
        Permissions.Users.View)]
    public async Task<IActionResult> GetAdmins()
    {
        var admins =
            await _db.Users
                .AsNoTracking()
                .Where(x =>
                    x.Role ==
                        Models.UserRole.Admin)
                .OrderBy(x =>
                    x.Name)
                .Select(x =>
                    new
                    {
                        x.Id,
                        x.Name,
                        x.Email,
                        x.Phone,
                        x.IsActive,
                        x.IsVerified,
                        x.CreatedAt
                    })
                .ToListAsync();

        return Ok(admins);
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