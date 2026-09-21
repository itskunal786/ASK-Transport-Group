using ASK.Group.Api.Data;
using ASK.Group.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace ASK.Group.Api.Services;

public class PermissionService
{
    private readonly AskTransportDbContext _db;

    public PermissionService(
        AskTransportDbContext db)
    {
        _db = db;
    }

    public async Task<bool> HasPermissionAsync(
        int userId,
        string permissionCode)
    {
        var user =
            await _db.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(x =>
                    x.Id == userId &&
                    x.IsActive);

        if (user == null)
        {
            return false;
        }

        if (user.Role ==
            UserRole.Admin)
        {
            return true;
        }

        var permission =
            await _db.Permissions
                .AsNoTracking()
                .FirstOrDefaultAsync(x =>
                    x.Code ==
                        permissionCode &&
                    x.IsActive);

        if (permission == null)
        {
            return false;
        }

        var userPermission =
            await _db.UserPermissions
                .AsNoTracking()
                .FirstOrDefaultAsync(x =>
                    x.UserId ==
                        userId &&
                    x.PermissionId ==
                        permission.Id);

        if (userPermission != null)
        {
            return userPermission
                .IsGranted;
        }

        var allowedByRole =
            await (
                from userRole
                    in _db.UserRoleAssignments

                join role
                    in _db.AppRoles
                    on userRole.RoleId
                    equals role.Id

                join rolePermission
                    in _db.RolePermissions
                    on role.Id
                    equals rolePermission.RoleId

                where
                    userRole.UserId ==
                        userId &&

                    role.IsActive &&

                    rolePermission.PermissionId ==
                        permission.Id

                select rolePermission.Id
            )
            .AnyAsync();

        return allowedByRole;
    }

    public async Task<List<string>>
        GetUserPermissionsAsync(
            int userId)
    {
        var user =
            await _db.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(x =>
                    x.Id == userId);

        if (user == null)
        {
            return new List<string>();
        }

        if (user.Role ==
            UserRole.Admin)
        {
            return await _db.Permissions
                .AsNoTracking()
                .Where(x => x.IsActive)
                .OrderBy(x => x.Module)
                .ThenBy(x => x.Action)
                .Select(x => x.Code)
                .ToListAsync();
        }

        var rolePermissions =
            await (
                from userRole
                    in _db.UserRoleAssignments

                join role
                    in _db.AppRoles
                    on userRole.RoleId
                    equals role.Id

                join rolePermission
                    in _db.RolePermissions
                    on role.Id
                    equals rolePermission.RoleId

                join permission
                    in _db.Permissions
                    on rolePermission.PermissionId
                    equals permission.Id

                where
                    userRole.UserId ==
                        userId &&
                    role.IsActive &&
                    permission.IsActive

                select permission.Code
            )
            .Distinct()
            .ToListAsync();

        var individualPermissions =
            await _db.UserPermissions
                .AsNoTracking()
                .Include(x =>
                    x.Permission)
                .Where(x =>
                    x.UserId ==
                        userId &&
                    x.Permission != null &&
                    x.Permission.IsActive)
                .ToListAsync();

        var result =
            rolePermissions
                .ToHashSet(
                    StringComparer.OrdinalIgnoreCase);

        foreach (var item
                 in individualPermissions)
        {
            if (item.Permission == null)
            {
                continue;
            }

            if (item.IsGranted)
            {
                result.Add(
                    item.Permission.Code);
            }
            else
            {
                result.Remove(
                    item.Permission.Code);
            }
        }

        return result
            .OrderBy(x => x)
            .ToList();
    }
}