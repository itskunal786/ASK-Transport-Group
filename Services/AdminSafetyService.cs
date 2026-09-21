using ASK.Group.Api.Data;
using ASK.Group.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace ASK.Group.Api.Services;

public class AdminSafetyService
{
    private readonly AskTransportDbContext _db;

    public AdminSafetyService(
        AskTransportDbContext db)
    {
        _db = db;
    }

    public async Task<bool> IsAdminAsync(
        int userId)
    {
        return await _db.Users
            .AsNoTracking()
            .AnyAsync(x =>
                x.Id == userId &&
                x.Role == UserRole.Admin &&
                x.IsActive);
    }

    public async Task<int> GetActiveAdminCountAsync()
    {
        return await _db.Users
            .AsNoTracking()
            .CountAsync(x =>
                x.Role == UserRole.Admin &&
                x.IsActive);
    }

    public async Task EnsureCanDeactivateAsync(
        int currentUserId,
        AppUser targetUser)
    {
        if (currentUserId ==
            targetUser.Id)
        {
            throw new InvalidOperationException(
                "You cannot deactivate your own account.");
        }

        if (targetUser.Role !=
            UserRole.Admin)
        {
            return;
        }

        var activeAdminCount =
            await GetActiveAdminCountAsync();

        if (activeAdminCount <= 1)
        {
            throw new InvalidOperationException(
                "The last active administrator cannot be deactivated.");
        }
    }

    public async Task EnsureCanDeleteAsync(
        int currentUserId,
        AppUser targetUser)
    {
        if (currentUserId ==
            targetUser.Id)
        {
            throw new InvalidOperationException(
                "You cannot delete your own account.");
        }

        if (targetUser.Role !=
            UserRole.Admin)
        {
            return;
        }

        var activeAdminCount =
            await GetActiveAdminCountAsync();

        if (targetUser.IsActive &&
            activeAdminCount <= 1)
        {
            throw new InvalidOperationException(
                "The last active administrator cannot be deleted.");
        }
    }

    public void EnsureCannotModifyOwnPrivilege(
        int currentUserId,
        int targetUserId)
    {
        if (currentUserId ==
            targetUserId)
        {
            throw new InvalidOperationException(
                "You cannot modify your own roles or permissions.");
        }
    }

    public async Task RevokeSessionsAsync(
        int userId)
    {
        var tokens =
            await _db.RefreshTokens
                .Where(x =>
                    x.UserId == userId &&
                    !x.IsRevoked)
                .ToListAsync();

        var now =
            DateTime.UtcNow;

        foreach (var token in tokens)
        {
            token.IsRevoked =
                true;

            token.RevokedAt =
                now;
        }

        await _db.SaveChangesAsync();
    }
}