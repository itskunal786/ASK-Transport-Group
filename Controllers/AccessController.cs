using ASK.Group.Api.Data;
using ASK.Group.Api.Models;
using ASK.Group.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace ASK.Group.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AccessController : ControllerBase
{
    private readonly AskTransportDbContext _db;
    private readonly PermissionService _permissionService;

    public AccessController(
        AskTransportDbContext db,
        PermissionService permissionService)
    {
        _db = db;
        _permissionService =
            permissionService;
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetMyAccess()
    {
        var userIdValue =
            User.FindFirstValue(
                ClaimTypes.NameIdentifier);

        if (!int.TryParse(
            userIdValue,
            out var userId))
        {
            return Unauthorized(new
            {
                message =
                    "Invalid user token"
            });
        }

        var user =
            await _db.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(x =>
                    x.Id == userId);

        if (user == null)
        {
            return Unauthorized(new
            {
                message =
                    "User not found"
            });
        }

        var permissions =
            await _permissionService
                .GetUserPermissionsAsync(
                    userId);

        var roles =
            await (
                from assignment
                    in _db.UserRoleAssignments

                join role
                    in _db.AppRoles

                    on assignment.RoleId
                    equals role.Id

                where
                    assignment.UserId ==
                        userId &&
                    role.IsActive

                select role.Name
            )
            .Distinct()
            .OrderBy(x => x)
            .ToListAsync();

        return Ok(new
        {
            user = new
            {
                user.Id,
                user.Name,
                user.Email,

                systemRole =
                    user.Role.ToString(),

                isAdmin =
                    user.Role ==
                    UserRole.Admin
            },

            roles,

            permissions
        });
    }
}