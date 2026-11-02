using ASK.Group.Api.Data;
using ASK.Group.Api.Models;
using ASK.Group.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace ASK.Group.Api.Controllers;

[ApiController]
[Route("api/account-approval")]
public class AccountApprovalController : ControllerBase
{
    private readonly AskTransportDbContext _db;
    private readonly NotificationService _notificationService;
    private readonly AuditService _auditService;

    public AccountApprovalController(
        AskTransportDbContext db,
        NotificationService notificationService,
        AuditService auditService)
    {
        _db = db;
        _notificationService = notificationService;
        _auditService = auditService;
    }

    [HttpPost("request")]
    [Authorize]
    public async Task<IActionResult> RequestApproval()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized(new { success = false, message = "Invalid user identity" });
        }

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (user == null)
        {
            return NotFound(new { success = false, message = "User not found" });
        }

        // Notify all SuperAdmin and Admin users
        var adminUsers = await _db.Users
            .Where(u => u.Role == UserRole.SuperAdmin || u.Role == UserRole.Admin)
            .ToListAsync();

        foreach (var admin in adminUsers)
        {
            await _notificationService.CreateAsync(
                admin.Id,
                "🔔 Account Clearance Approval Requested",
                $"Shipper '{user.Name}' ({user.Email}, Phone: {user.Phone}) has requested full account access to unlock Invoices, Payments & Documents.",
                "ACCOUNT_APPROVAL_REQUEST"
            );
        }

        await _auditService.LogAsync(
            "APPROVAL_REQUESTED",
            $"User {user.Email} requested account clearance from SuperAdmin",
            user.Id,
            user.Email
        );

        return Ok(new
        {
            success = true,
            message = "Approval request sent to Super Admin successfully.",
            userId = user.Id,
            userName = user.Name,
            userEmail = user.Email,
            userPhone = user.Phone,
            requestedAt = DateTime.UtcNow
        });
    }

    [HttpGet("pending")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<IActionResult> GetPendingRequests()
    {
        var requests = await _db.Notifications
            .AsNoTracking()
            .Where(n => n.Type == "ACCOUNT_APPROVAL_REQUEST")
            .OrderByDescending(n => n.CreatedAt)
            .Take(20)
            .Select(n => new
            {
                n.Id,
                n.Title,
                n.Message,
                n.CreatedAt,
                n.IsRead
            })
            .ToListAsync();

        return Ok(new { success = true, data = requests });
    }

    [HttpPost("approve/{userId:int}")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<IActionResult> ApproveUser(int userId)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (user == null)
        {
            return NotFound(new { success = false, message = "User not found" });
        }

        user.IsVerified = true;
        user.IsActive = true;
        await _db.SaveChangesAsync();

        await _notificationService.CreateAsync(
            user.Id,
            "🎉 Account Verified & Unlocked!",
            "Your account has been approved by Super Admin. Payments, Invoices, and Documents are now fully unlocked.",
            "ACCOUNT_APPROVED"
        );

        var notifs = await _db.Notifications
            .Where(n => n.Type == "ACCOUNT_APPROVAL_REQUEST" && n.Message.Contains(user.Email))
            .ToListAsync();
        foreach (var n in notifs) n.IsRead = true;
        await _db.SaveChangesAsync();

        await _auditService.LogAsync(
            "ACCOUNT_APPROVED",
            $"SuperAdmin approved full access for {user.Email}",
            user.Id,
            user.Email
        );

        return Ok(new
        {
            success = true,
            message = $"Full access granted to {user.Name}!",
            userId = user.Id,
            userEmail = user.Email
        });
    }

    [HttpPost("reject/{userId:int}")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<IActionResult> RejectUser(int userId)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (user == null)
        {
            return NotFound(new { success = false, message = "User not found" });
        }

        await _notificationService.CreateAsync(
            user.Id,
            "⚠️ Account Clearance Pending Review",
            "Your full access request is currently restricted to Book & Track only. Contact support for assistance.",
            "ACCOUNT_RESTRICTED"
        );

        return Ok(new
        {
            success = true,
            message = $"User {user.Name} access restricted to Book & Track.",
            userId = user.Id
        });
    }
}
