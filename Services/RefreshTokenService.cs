using ASK.Group.Api.Data;
using ASK.Group.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace ASK.Group.Api.Services;

public class RefreshTokenService
{
    private readonly AskTransportDbContext _db;
    private readonly JwtService _jwtService;

    public RefreshTokenService(
        AskTransportDbContext db,
        JwtService jwtService)
    {
        _db = db;
        _jwtService = jwtService;
    }

    public async Task<RefreshToken>
        CreateAsync(int userId)
    {
        var oldTokens =
            await _db.RefreshTokens
                .Where(x =>
                    x.UserId == userId &&
                    !x.IsRevoked &&
                    x.ExpiresAt >
                        DateTime.UtcNow)
                .ToListAsync();

        foreach (var oldToken in oldTokens)
        {
            oldToken.IsRevoked =
                true;

            oldToken.RevokedAt =
                DateTime.UtcNow;
        }

        var refreshToken =
            new RefreshToken
            {
                UserId =
                    userId,

                Token =
                    _jwtService
                        .GenerateRefreshToken(),

                ExpiresAt =
                    _jwtService
                        .GetRefreshTokenExpiry(),

                IsRevoked =
                    false,

                CreatedAt =
                    DateTime.UtcNow
            };

        _db.RefreshTokens.Add(
            refreshToken);

        await _db.SaveChangesAsync();

        return refreshToken;
    }

    public async Task<RefreshToken?>
        GetValidAsync(
            string token)
    {
        return await _db.RefreshTokens
            .Include(x => x.User)
            .FirstOrDefaultAsync(x =>
                x.Token == token &&
                !x.IsRevoked &&
                x.ExpiresAt >
                    DateTime.UtcNow);
    }

    public async Task RevokeAsync(
        RefreshToken token)
    {
        if (token.IsRevoked)
        {
            return;
        }

        token.IsRevoked =
            true;

        token.RevokedAt =
            DateTime.UtcNow;

        await _db.SaveChangesAsync();
    }

    public async Task RevokeAllAsync(
        int userId)
    {
        var tokens =
            await _db.RefreshTokens
                .Where(x =>
                    x.UserId == userId &&
                    !x.IsRevoked)
                .ToListAsync();

        foreach (var token in tokens)
        {
            token.IsRevoked =
                true;

            token.RevokedAt =
                DateTime.UtcNow;
        }

        await _db.SaveChangesAsync();
    }

    public async Task<int>
        CleanupExpiredAsync()
    {
        var expired =
            await _db.RefreshTokens
                .Where(x =>
                    x.ExpiresAt <
                        DateTime.UtcNow)
                .ToListAsync();

        if (expired.Count == 0)
        {
            return 0;
        }

        _db.RefreshTokens.RemoveRange(
            expired);

        await _db.SaveChangesAsync();

        return expired.Count;
    }
}