using ASK.Group.Api.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace ASK.Group.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotificationController : ControllerBase
{
    private readonly AskTransportDbContext _db;

    public NotificationController(
        AskTransportDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetNotifications(
        [FromQuery] bool? unreadOnly,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var userId = GetUserId();

        if (userId == null)
        {
            return Unauthorized();
        }

        page = page < 1 ? 1 : page;
        pageSize = pageSize < 1 ? 20 : pageSize;
        pageSize = pageSize > 100 ? 100 : pageSize;

        var query = _db.Notifications
            .AsNoTracking()
            .Where(x =>
                x.UserId == userId.Value);

        if (unreadOnly == true)
        {
            query = query.Where(x =>
                !x.IsRead);
        }

        var totalRecords =
            await query.CountAsync();

        var unreadCount =
            await _db.Notifications
                .CountAsync(x =>
                    x.UserId == userId.Value &&
                    !x.IsRead);

        var notifications =
            await query
                .OrderByDescending(x =>
                    x.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(x => new
                {
                    x.Id,
                    x.Title,
                    x.Message,
                    x.Type,
                    x.IsRead,
                    x.BookingId,

                    BookingNumber =
                        x.Booking != null
                            ? x.Booking.BookingNumber
                            : null,

                    x.CreatedAt,
                    x.ReadAt
                })
                .ToListAsync();

        return Ok(new
        {
            page,
            pageSize,
            totalRecords,

            totalPages =
                (int)Math.Ceiling(
                    totalRecords /
                    (double)pageSize),

            unreadCount,

            data = notifications
        });
    }

    [HttpGet("unread-count")]
    public async Task<IActionResult> GetUnreadCount()
    {
        var userId = GetUserId();

        if (userId == null)
        {
            return Unauthorized();
        }

        var count =
            await _db.Notifications
                .CountAsync(x =>
                    x.UserId == userId.Value &&
                    !x.IsRead);

        return Ok(new
        {
            unreadCount = count
        });
    }

    [HttpPut("{id:int}/read")]
    public async Task<IActionResult> MarkRead(
        int id)
    {
        var userId = GetUserId();

        if (userId == null)
        {
            return Unauthorized();
        }

        var notification =
            await _db.Notifications
                .FirstOrDefaultAsync(x =>
                    x.Id == id &&
                    x.UserId == userId.Value);

        if (notification == null)
        {
            return NotFound(new
            {
                message =
                    "Notification not found"
            });
        }

        if (!notification.IsRead)
        {
            notification.IsRead = true;
            notification.ReadAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();
        }

        return Ok(new
        {
            message =
                "Notification marked as read"
        });
    }

    [HttpPut("read-all")]
    public async Task<IActionResult> MarkAllRead()
    {
        var userId = GetUserId();

        if (userId == null)
        {
            return Unauthorized();
        }

        var notifications =
            await _db.Notifications
                .Where(x =>
                    x.UserId == userId.Value &&
                    !x.IsRead)
                .ToListAsync();

        var now =
            DateTime.UtcNow;

        foreach (var notification in notifications)
        {
            notification.IsRead = true;
            notification.ReadAt = now;
        }

        if (notifications.Count > 0)
        {
            await _db.SaveChangesAsync();
        }

        return Ok(new
        {
            message =
                "All notifications marked as read",

            updated =
                notifications.Count
        });
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(
        int id)
    {
        var userId = GetUserId();

        if (userId == null)
        {
            return Unauthorized();
        }

        var notification =
            await _db.Notifications
                .FirstOrDefaultAsync(x =>
                    x.Id == id &&
                    x.UserId == userId.Value);

        if (notification == null)
        {
            return NotFound(new
            {
                message =
                    "Notification not found"
            });
        }

        _db.Notifications.Remove(
            notification);

        await _db.SaveChangesAsync();

        return Ok(new
        {
            message =
                "Notification deleted successfully"
        });
    }

    private int? GetUserId()
    {
        var value =
            User.FindFirstValue(
                ClaimTypes.NameIdentifier);

        if (!int.TryParse(
            value,
            out var userId))
        {
            return null;
        }

        return userId;
    }
}