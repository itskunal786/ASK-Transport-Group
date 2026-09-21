using ASK.Group.Api.Models;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace ASK.Group.Api.Services;

public class JwtService
{
    private readonly IConfiguration _configuration;

    public JwtService(
        IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public string GenerateToken(
        AppUser user)
    {
        var key =
            _configuration["Jwt:Key"];

        if (string.IsNullOrWhiteSpace(key))
        {
            throw new Exception(
                "JWT key is not configured.");
        }

        var issuer =
            _configuration["Jwt:Issuer"];

        var audience =
            _configuration["Jwt:Audience"];

        var expiresMinutes =
            int.TryParse(
                _configuration[
                    "Jwt:ExpiresMinutes"],
                out var minutes)
                ? minutes
                : 120;

        var claims =
            new List<Claim>
            {
                new(
                    ClaimTypes.NameIdentifier,
                    user.Id.ToString()),

                new(
                    ClaimTypes.Name,
                    user.Name),

                new(
                    ClaimTypes.Email,
                    user.Email),

                new(
                    ClaimTypes.Role,
                    user.Role.ToString())
            };

        var securityKey =
            new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(
                    key));

        var credentials =
            new SigningCredentials(
                securityKey,
                SecurityAlgorithms.HmacSha256);

        var token =
            new JwtSecurityToken(
                issuer:
                    issuer,

                audience:
                    audience,

                claims:
                    claims,

                expires:
                    DateTime.UtcNow
                        .AddMinutes(
                            expiresMinutes),

                signingCredentials:
                    credentials);

        return new JwtSecurityTokenHandler()
            .WriteToken(token);
    }

    public string GenerateRefreshToken()
    {
        var randomBytes =
            new byte[64];

        using var random =
            RandomNumberGenerator.Create();

        random.GetBytes(
            randomBytes);

        return Convert.ToBase64String(
            randomBytes);
    }

    public DateTime GetRefreshTokenExpiry()
    {
        var days =
            int.TryParse(
                _configuration[
                    "Jwt:RefreshTokenDays"],
                out var refreshDays)
                ? refreshDays
                : 7;

        return DateTime.UtcNow
            .AddDays(days);
    }
}