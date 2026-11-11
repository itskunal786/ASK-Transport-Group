using ASK.Group.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace ASK.Group.Api.Services;

public class CleanupService
{
    private readonly AskTransportDbContext _db;

    public CleanupService(
        AskTransportDbContext db)
    {
        _db = db;
    }

    public async Task<int> CleanupExpiredDataAsync()
    {
        var now =
            DateTime.UtcNow;

        var expiredCaptchas =
            await _db.Captchas
                .Where(x =>
                    x.ExpiresAt < now)
                .ToListAsync();

        var expiredOtps =
            await _db.OtpCodes
                .Where(x =>
                    x.ExpiresAt < now ||
                    x.Used)
                .ToListAsync();

        var expiredRefreshTokens =
            await _db.RefreshTokens
                .Where(x =>
                    x.ExpiresAt < now)
                .ToListAsync();

        var oldLoginAttemptsDate =
            now.AddDays(-30);

        var oldLoginAttempts =
            await _db.LoginAttempts
                .Where(x =>
                    x.AttemptedAt <
                    oldLoginAttemptsDate)
                .ToListAsync();

        var expiredDeliveryOtps =
            await _db.DeliveryOtps
                .Where(x =>
                    x.ExpiresAt < now ||
                    x.IsUsed)
                .ToListAsync();

        if (expiredCaptchas.Count > 0)
        {
            _db.Captchas.RemoveRange(
                expiredCaptchas);
        }

        if (expiredOtps.Count > 0)
        {
            _db.OtpCodes.RemoveRange(
                expiredOtps);
        }

        if (expiredRefreshTokens.Count > 0)
        {
            _db.RefreshTokens.RemoveRange(
                expiredRefreshTokens);
        }

        if (oldLoginAttempts.Count > 0)
        {
            _db.LoginAttempts.RemoveRange(
                oldLoginAttempts);
        }

        if (expiredDeliveryOtps.Count > 0)
        {
            _db.DeliveryOtps.RemoveRange(
                expiredDeliveryOtps);
        }

        var removedRecords =
            expiredCaptchas.Count +
            expiredOtps.Count +
            expiredRefreshTokens.Count +
            oldLoginAttempts.Count +
            expiredDeliveryOtps.Count;

        if (removedRecords > 0)
        {
            await _db.SaveChangesAsync();
        }

        return removedRecords;
    }
}