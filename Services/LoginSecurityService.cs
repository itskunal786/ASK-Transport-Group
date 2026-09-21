using ASK.Group.Api.Data;
using ASK.Group.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace ASK.Group.Api.Services;

public class LoginSecurityService
{
    private readonly AskTransportDbContext _db;

    public LoginSecurityService(
        AskTransportDbContext db)
    {
        _db = db;
    }

    public async Task<bool> IsBlockedAsync(
        string email,
        string? ipAddress)
    {
        var since =
            DateTime.UtcNow.AddMinutes(-15);

        var failedCount =
            await _db.LoginAttempts
                .CountAsync(x =>
                    x.Email == email &&
                    x.IpAddress == ipAddress &&
                    !x.Success &&
                    x.AttemptedAt >= since);

        return failedCount >= 5;
    }

    public async Task RecordAttemptAsync(
        string email,
        string? ipAddress,
        bool success)
    {
        _db.LoginAttempts.Add(
            new LoginAttempt
            {
                Email = email,
                IpAddress = ipAddress,
                Success = success,
                AttemptedAt = DateTime.UtcNow
            });

        await _db.SaveChangesAsync();
    }
}