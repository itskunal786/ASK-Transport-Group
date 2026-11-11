using ASK.Group.Api.Data;
using ASK.Group.Api.DTOs;
using Microsoft.EntityFrameworkCore;

namespace ASK.Group.Api.Services;

public sealed class ClientAccountService
{
    private readonly AskTransportDbContext _db;
    private readonly RefreshTokenService _refreshTokenService;

    public ClientAccountService(
        AskTransportDbContext db,
        RefreshTokenService refreshTokenService)
    {
        _db = db;
        _refreshTokenService =
            refreshTokenService;
    }

    public async Task DeactivateAsync(
        int userId,
        DeactivateAccountRequest request)
    {
        var user =
            await _db.Users
                .FirstOrDefaultAsync(
                    x => x.Id == userId);

        if (user == null)
        {
            throw new InvalidOperationException(
                "User not found.");
        }

        if (!user.IsActive)
        {
            throw new InvalidOperationException(
                "Account is already deactivated.");
        }

        var passwordValid =
            BCrypt.Net.BCrypt.Verify(
                request.Password,
                user.PasswordHash);

        if (!passwordValid)
        {
            throw new InvalidOperationException(
                "Invalid password.");
        }

        user.IsActive = false;

        await _db.SaveChangesAsync();

        await _refreshTokenService
            .RevokeAllAsync(userId);
    }
}