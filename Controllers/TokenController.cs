using ASK.Group.Api.DTOs;
using ASK.Group.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ASK.Group.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TokenController : ControllerBase
{
    private readonly RefreshTokenService _refreshTokenService;
    private readonly JwtService _jwtService;
    private readonly AuditService _auditService;

    public TokenController(
        RefreshTokenService refreshTokenService,
        JwtService jwtService,
        AuditService auditService)
    {
        _refreshTokenService =
            refreshTokenService;

        _jwtService =
            jwtService;

        _auditService =
            auditService;
    }

    // =========================================
    // REFRESH TOKEN
    // POST: /api/Token/refresh
    // =========================================

    [HttpPost("refresh")]
    [AllowAnonymous]
    public async Task<IActionResult> Refresh(
        RefreshTokenRequest request)
    {
        var refreshToken =
            await _refreshTokenService
                .GetValidAsync(
                    request.RefreshToken);

        if (refreshToken == null ||
            refreshToken.User == null)
        {
            return Unauthorized(new
            {
                message =
                    "Invalid or expired refresh token"
            });
        }

        if (!refreshToken.User.IsActive)
        {
            return Unauthorized(new
            {
                message =
                    "User account is disabled"
            });
        }

        var accessToken =
            _jwtService.GenerateToken(
                refreshToken.User);

        // Old refresh token revoke
        await _refreshTokenService
            .RevokeAsync(
                refreshToken);

        // New refresh token create
        var newRefreshToken =
            await _refreshTokenService
                .CreateAsync(
                    refreshToken.User.Id);

        await _auditService.LogAsync(
            "TOKEN_REFRESH",
            "Access token refreshed",
            refreshToken.User.Id,
            refreshToken.User.Email);

        return Ok(new
        {
            token =
                accessToken,

            refreshToken =
                newRefreshToken.Token,

            refreshTokenExpiresAt =
                newRefreshToken.ExpiresAt
        });
    }

    // =========================================
    // LOGOUT CURRENT SESSION
    // POST: /api/Token/logout
    // =========================================

    [HttpPost("logout")]
    [AllowAnonymous]
    public async Task<IActionResult> Logout(
        LogoutRequest request)
    {
        var refreshToken =
            await _refreshTokenService
                .GetValidAsync(
                    request.RefreshToken);

        // Token already expired/revoked ho
        // tab bhi logout successful maana jayega.
        if (refreshToken == null)
        {
            return Ok(new
            {
                message =
                    "Logged out successfully"
            });
        }

        var userId =
            refreshToken.UserId;

        var email =
            refreshToken.User?.Email;

        await _refreshTokenService
            .RevokeAsync(
                refreshToken);

        await _auditService.LogAsync(
            "LOGOUT",
            "User logged out",
            userId,
            email);

        return Ok(new
        {
            message =
                "Logged out successfully"
        });
    }

    // =========================================
    // LOGOUT ALL SESSIONS
    // POST: /api/Token/logout-all
    // =========================================

    [HttpPost("logout-all")]
    [Authorize]
    public async Task<IActionResult> LogoutAll()
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
                    "Invalid user"
            });
        }

        await _refreshTokenService
            .RevokeAllAsync(
                userId);

        var email =
            User.FindFirstValue(
                ClaimTypes.Email);

        await _auditService.LogAsync(
            "LOGOUT_ALL",
            "User logged out from all sessions",
            userId,
            email);

        return Ok(new
        {
            message =
                "Logged out from all sessions successfully"
        });
    }
}