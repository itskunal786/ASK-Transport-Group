using ASK.Group.Api.Data;
using ASK.Group.Api.DTOs;
using ASK.Group.Api.Models;
using ASK.Group.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ASK.Group.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,SuperAdmin")]
public class AdminController : ControllerBase
{
    private readonly AskTransportDbContext _db;
    private readonly NotificationService _notificationService;
    private readonly AuditService _auditService;
    private readonly WebhookService _webhookService;
    private readonly AdminSafetyService _adminSafetyService;

    public AdminController(
        AskTransportDbContext db,
        NotificationService notificationService,
        AuditService auditService,
        WebhookService webhookService,
        AdminSafetyService adminSafetyService)
    {
        _db = db;
        _notificationService = notificationService;
        _auditService = auditService;
        _webhookService = webhookService;
        _adminSafetyService = adminSafetyService;
    }

    [HttpGet("dashboard")]
    public async Task<IActionResult> Dashboard()
    {
        var totalUsers =
            await _db.Users.CountAsync();

        var totalBookings =
            await _db.Bookings.CountAsync();

        var activeShipments =
            await _db.Bookings.CountAsync(x =>
                x.BookingStatus != "Delivered" &&
                x.BookingStatus != "Cancelled");

        var deliveredBookings =
            await _db.Bookings.CountAsync(x =>
                x.BookingStatus == "Delivered");

        var cancelledBookings =
            await _db.Bookings.CountAsync(x =>
                x.BookingStatus == "Cancelled");

        var pendingPayments =
            await _db.Bookings.CountAsync(x =>
                x.PaymentStatus != "Paid");

        var totalRevenue =
            await _db.PaymentTransactions
                .Where(x =>
                    x.PaymentStatus == "Success")
                .SumAsync(x =>
                    (decimal?)x.Amount) ?? 0;

        var recentBookings =
            await _db.Bookings
                .Include(x => x.User)
                .Include(x => x.TransportService)
                .OrderByDescending(x => x.CreatedAt)
                .Take(10)
                .Select(x => new
                {
                    x.Id,
                    x.BookingNumber,

                    UserName =
                        x.User != null
                            ? x.User.Name
                            : "",

                    Service =
                        x.TransportService != null
                            ? x.TransportService.Name
                            : "",

                    x.FromCity,
                    x.ToCity,
                    x.TotalAmount,
                    x.BookingStatus,
                    x.PaymentStatus,
                    x.CreatedAt
                })
                .ToListAsync();

        return Ok(new
        {
            totalUsers,
            totalBookings,
            activeShipments,
            deliveredBookings,
            cancelledBookings,
            pendingPayments,
            totalRevenue,
            recentBookings
        });
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetUsers(
        [FromQuery] string? search,
        [FromQuery] bool? active,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        page =
            page < 1
                ? 1
                : page;

        pageSize =
            pageSize < 1
                ? 10
                : pageSize;

        pageSize =
            pageSize > 100
                ? 100
                : pageSize;

        var query =
            _db.Users
                .AsNoTracking();

        if (!string.IsNullOrWhiteSpace(
            search))
        {
            search =
                search.Trim();

            query =
                query.Where(x =>
                    x.Name.Contains(search) ||
                    x.Email.Contains(search) ||
                    x.Phone.Contains(search));
        }

        if (active.HasValue)
        {
            query =
                query.Where(x =>
                    x.IsActive ==
                    active.Value);
        }

        var totalRecords =
            await query.CountAsync();

        var users =
            await query
                .OrderByDescending(x =>
                    x.CreatedAt)
                .Skip(
                    (page - 1) *
                    pageSize)
                .Take(
                    pageSize)
                .Select(x => new
                {
                    x.Id,
                    x.Name,
                    x.Email,
                    x.Phone,

                    Role =
                        x.Role.ToString(),

                    x.IsVerified,
                    x.IsActive,
                    x.CreatedAt
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

            data =
                users
        });
    }

    [HttpGet("bookings")]
    public async Task<IActionResult> GetBookings(
        [FromQuery] string? search,
        [FromQuery] string? status,
        [FromQuery] string? paymentStatus,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        page =
            page < 1
                ? 1
                : page;

        pageSize =
            pageSize < 1
                ? 20
                : pageSize;

        pageSize =
            pageSize > 100
                ? 100
                : pageSize;

        var query =
            _db.Bookings
                .AsNoTracking();

        if (!string.IsNullOrWhiteSpace(
            search))
        {
            search =
                search.Trim();

            query =
                query.Where(x =>
                    x.BookingNumber
                        .Contains(search) ||
                    x.SenderName
                        .Contains(search) ||
                    x.ReceiverName
                        .Contains(search) ||
                    x.FromCity
                        .Contains(search) ||
                    x.ToCity
                        .Contains(search));
        }

        if (!string.IsNullOrWhiteSpace(
            status))
        {
            status =
                status.Trim();

            query =
                query.Where(x =>
                    x.BookingStatus ==
                    status);
        }

        if (!string.IsNullOrWhiteSpace(
            paymentStatus))
        {
            paymentStatus =
                paymentStatus.Trim();

            query =
                query.Where(x =>
                    x.PaymentStatus ==
                    paymentStatus);
        }

        var totalRecords =
            await query.CountAsync();

        var bookings =
            await query
                .Include(x => x.User)
                .Include(x =>
                    x.TransportService)
                .OrderByDescending(x =>
                    x.CreatedAt)
                .Skip(
                    (page - 1) *
                    pageSize)
                .Take(
                    pageSize)
                .Select(x => new
                {
                    x.Id,
                    x.BookingNumber,

                    UserName =
                        x.User != null
                            ? x.User.Name
                            : "",

                    UserEmail =
                        x.User != null
                            ? x.User.Email
                            : "",

                    Service =
                        x.TransportService != null
                            ? x.TransportService.Name
                            : "",

                    x.SenderName,
                    x.ReceiverName,
                    x.FromCity,
                    x.ToCity,
                    x.GoodsType,
                    x.Weight,
                    x.Quantity,
                    x.TotalAmount,
                    x.BookingStatus,
                    x.PaymentStatus,
                    x.PickupDate,
                    x.ExpectedDeliveryDate,
                    x.CreatedAt
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

            data =
                bookings
        });
    }

    [HttpGet(
        "bookings/{bookingNumber}")]
    public async Task<IActionResult> GetBooking(
        string bookingNumber)
    {
        var booking =
            await _db.Bookings
                .Include(x => x.User)
                .Include(x =>
                    x.TransportService)
                .Include(x =>
                    x.BookingItems)
                .Include(x =>
                    x.ShipmentTrackings)
                .Include(x =>
                    x.Invoice)
                    .ThenInclude(x =>
                        x!.InvoiceItems)
                .Include(x =>
                    x.PaymentTransactions)
                .FirstOrDefaultAsync(x =>
                    x.BookingNumber ==
                    bookingNumber);

        if (booking == null)
        {
            return NotFound(new
            {
                message =
                    "Booking not found"
            });
        }

        return Ok(
            booking);
    }

    [HttpPut(
        "bookings/{bookingNumber}/status")]
    public async Task<IActionResult>
        UpdateBookingStatus(
            string bookingNumber,
            UpdateBookingStatusRequest request)
    {
        if (string.IsNullOrWhiteSpace(
            bookingNumber))
        {
            return BadRequest(new
            {
                message =
                    "Booking number is required"
            });
        }

        if (string.IsNullOrWhiteSpace(
            request.Status))
        {
            return BadRequest(new
            {
                message =
                    "Booking status is required"
            });
        }

        bookingNumber =
            bookingNumber.Trim();

        var booking =
            await _db.Bookings
                .FirstOrDefaultAsync(x =>
                    x.BookingNumber ==
                    bookingNumber);

        if (booking == null)
        {
            return NotFound(new
            {
                message =
                    "Booking not found"
            });
        }

        if (string.Equals(
            booking.BookingStatus,
            "Delivered",
            StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest(new
            {
                message =
                    "Delivered booking cannot be updated"
            });
        }

        if (string.Equals(
            booking.BookingStatus,
            "Cancelled",
            StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest(new
            {
                message =
                    "Cancelled booking cannot be updated"
            });
        }

        var allowedStatuses =
            new[]
            {
                "Booked",
                "Picked Up",
                "In Transit",
                "Reached Hub",
                "Out For Delivery",
                "Delivered",
                "Cancelled"
            };

        var status =
            allowedStatuses
                .FirstOrDefault(x =>
                    x.Equals(
                        request.Status.Trim(),
                        StringComparison
                            .OrdinalIgnoreCase));

        if (status == null)
        {
            return BadRequest(new
            {
                message =
                    "Invalid booking status",

                allowedStatuses
            });
        }

        if (string.Equals(
            booking.BookingStatus,
            status,
            StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest(new
            {
                message =
                    $"Booking is already in {status} status"
            });
        }

        booking.BookingStatus =
            status;

        booking.UpdatedAt =
            DateTime.UtcNow;

        if (string.Equals(
            status,
            "Delivered",
            StringComparison.OrdinalIgnoreCase))
        {
            booking.DeliveredDate =
                DateTime.UtcNow;
        }

        var tracking =
            new ShipmentTracking
            {
                BookingId =
                    booking.Id,

                Status =
                    status,

                Location =
                    string.IsNullOrWhiteSpace(
                        request.Location)
                        ? booking.FromCity
                        : request.Location.Trim(),

                Description =
                    request.Description?
                        .Trim(),

                StatusDate =
                    DateTime.UtcNow,

                CreatedAt =
                    DateTime.UtcNow
            };

        _db.ShipmentTrackings.Add(
            tracking);

        await _db.SaveChangesAsync();

        await _notificationService
            .CreateBookingStatusAsync(
                booking,
                status);

        await _auditService.LogAsync(
            "BOOKING_STATUS_UPDATE",
            $"Booking {booking.BookingNumber} changed to {status}",
            booking.UserId);

        await _webhookService
            .BookingStatusChangedAsync(
                booking.Id,
                booking.BookingNumber,
                booking.BookingStatus,
                tracking.Location);

        return Ok(new
        {
            message =
                "Booking status updated successfully",

            booking.BookingNumber,
            booking.BookingStatus,
            booking.DeliveredDate
        });
    }

    [HttpPut(
        "users/{id:int}/status")]
    public async Task<IActionResult>
        ChangeUserStatus(
            int id,
            [FromQuery] bool active)
    {
        var user =
            await _db.Users
                .FirstOrDefaultAsync(x =>
                    x.Id == id);

        if (user == null)
        {
            return NotFound(new
            {
                message =
                    "User not found"
            });
        }

        if (user.Role == UserRole.Admin || user.Role == UserRole.SuperAdmin)
        {
            if (!User.IsInRole("SuperAdmin"))
            {
                return BadRequest(new
                {
                    message = "Admin and SuperAdmin accounts can only be managed by a SuperAdmin"
                });
            }
        }

        if (user.IsActive ==
            active)
        {
            return Ok(new
            {
                message =
                    active
                        ? "User is already active"
                        : "User is already inactive",

                user.Id,
                user.Name,
                user.Email,
                user.IsActive
            });
        }

        user.IsActive =
            active;

        await _db.SaveChangesAsync();

        if (!active)
        {
            await _adminSafetyService
                .RevokeSessionsAsync(
                    user.Id);
        }

        await _auditService.LogAsync(
            active
                ? "USER_ACTIVATED"
                : "USER_DEACTIVATED",

            $"User {user.Email} status changed",

            user.Id,
            user.Email);

        return Ok(new
        {
            message =
                active
                    ? "User activated successfully"
                    : "User deactivated successfully",

            user.Id,
            user.Name,
            user.Email,
            user.IsActive
        });
    }

    [HttpPut("users/{id:int}")]
    public async Task<IActionResult> UpdateUser(int id, [FromBody] AdminUpdateUserDto request)
    {
        var user = await _db.Users.FirstOrDefaultAsync(x => x.Id == id);
        if (user == null)
        {
            return NotFound(new { message = "User not found" });
        }

        var isCallerSuperAdmin = User.IsInRole("SuperAdmin");
        if ((user.Role == UserRole.Admin || user.Role == UserRole.SuperAdmin) && !isCallerSuperAdmin)
        {
            return StatusCode(403, new { message = "Only Super Admin can modify administrative accounts." });
        }

        if (!string.IsNullOrWhiteSpace(request.Name)) user.Name = request.Name.Trim();
        if (!string.IsNullOrWhiteSpace(request.Phone)) user.Phone = request.Phone.Trim();
        if (!string.IsNullOrWhiteSpace(request.Email) && request.Email.Contains('@')) user.Email = request.Email.Trim().ToLowerInvariant();
        if (request.IsActive.HasValue) user.IsActive = request.IsActive.Value;

        await _db.SaveChangesAsync();

        await _auditService.LogAsync(
            "USER_UPDATED_BY_ADMIN",
            $"User {user.Email} updated by admin",
            user.Id,
            user.Email);

        return Ok(new
        {
            message = "User updated successfully",
            user = new
            {
                user.Id,
                user.Name,
                user.Email,
                user.Phone,
                role = user.Role.ToString(),
                user.IsActive,
                user.IsVerified
            }
        });
    }

    [HttpPut("users/{id:int}/role")]
    public async Task<IActionResult> UpdateUserRole(int id, [FromBody] AdminUpdateRoleDto request)
    {
        if (!User.IsInRole("SuperAdmin"))
        {
            return StatusCode(403, new { message = "Forbidden: Only Super Admin can assign or change roles." });
        }

        var user = await _db.Users.FirstOrDefaultAsync(x => x.Id == id);
        if (user == null)
        {
            return NotFound(new { message = "User not found" });
        }

        if (!Enum.TryParse<UserRole>(request.Role, true, out var parsedRole))
        {
            return BadRequest(new { message = "Invalid role. Allowed values: User, Admin, SuperAdmin." });
        }

        if (user.Role == UserRole.SuperAdmin && parsedRole != UserRole.SuperAdmin)
        {
            var superAdminCount = await _db.Users.CountAsync(x => x.Role == UserRole.SuperAdmin && x.IsActive);
            if (superAdminCount <= 1)
            {
                return BadRequest(new { message = "Cannot demote the last active Super Admin." });
            }
        }

        var oldRole = user.Role;
        user.Role = parsedRole;
        await _db.SaveChangesAsync();

        await _auditService.LogAsync(
            "USER_ROLE_CHANGED",
            $"SuperAdmin changed role of {user.Email} from {oldRole} to {parsedRole}",
            user.Id,
            user.Email);

        return Ok(new
        {
            message = $"User role successfully changed to {parsedRole}",
            userId = user.Id,
            role = user.Role.ToString()
        });
    }

    [HttpGet("rights")]
    public async Task<IActionResult> GetAllRights()
    {
        var permissions = await _db.Permissions
            .AsNoTracking()
            .Where(x => x.IsActive)
            .OrderBy(x => x.Module)
            .ThenBy(x => x.Action)
            .Select(x => new
            {
                x.Id,
                x.Code,
                x.Module,
                x.Action,
                x.Description
            })
            .ToListAsync();

        return Ok(permissions);
    }

    [HttpGet("users/{id:int}/rights")]
    public async Task<IActionResult> GetUserRights(int id)
    {
        var user = await _db.Users.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id);
        if (user == null)
        {
            return NotFound(new { message = "User not found" });
        }

        var grantedPermissionIds = await _db.UserPermissions
            .AsNoTracking()
            .Where(x => x.UserId == id && x.IsGranted)
            .Select(x => x.PermissionId)
            .ToListAsync();

        var revokedPermissionIds = await _db.UserPermissions
            .AsNoTracking()
            .Where(x => x.UserId == id && !x.IsGranted)
            .Select(x => x.PermissionId)
            .ToListAsync();

        return Ok(new
        {
            userId = user.Id,
            userName = user.Name,
            userRole = user.Role.ToString(),
            grantedPermissionIds,
            revokedPermissionIds
        });
    }

    [HttpPut("users/{id:int}/rights")]
    public async Task<IActionResult> UpdateUserRights(int id, [FromBody] AdminUpdateUserRightsDto request)
    {
        if (!User.IsInRole("SuperAdmin"))
        {
            return StatusCode(403, new { message = "Forbidden: Only Super Admin can delegate or revoke rights." });
        }

        var user = await _db.Users.FirstOrDefaultAsync(x => x.Id == id);
        if (user == null)
        {
            return NotFound(new { message = "User not found" });
        }

        var existing = await _db.UserPermissions.Where(x => x.UserId == id).ToListAsync();
        _db.UserPermissions.RemoveRange(existing);

        if (request.GrantedPermissionIds != null)
        {
            foreach (var pid in request.GrantedPermissionIds.Distinct())
            {
                _db.UserPermissions.Add(new UserPermission
                {
                    UserId = id,
                    PermissionId = pid,
                    IsGranted = true,
                    CreatedAt = DateTime.UtcNow
                });
            }
        }

        if (request.RevokedPermissionIds != null)
        {
            foreach (var pid in request.RevokedPermissionIds.Distinct())
            {
                if (request.GrantedPermissionIds != null && request.GrantedPermissionIds.Contains(pid)) continue;
                _db.UserPermissions.Add(new UserPermission
                {
                    UserId = id,
                    PermissionId = pid,
                    IsGranted = false,
                    CreatedAt = DateTime.UtcNow
                });
            }
        }

        await _db.SaveChangesAsync();

        await _auditService.LogAsync(
            "USER_RIGHTS_UPDATED",
            $"SuperAdmin updated rights for {user.Email}",
            user.Id,
            user.Email);

        return Ok(new
        {
            message = $"Rights successfully updated for {user.Name}",
            userId = user.Id,
            grantedCount = request.GrantedPermissionIds?.Count ?? 0,
            revokedCount = request.RevokedPermissionIds?.Count ?? 0
        });
    }

    [HttpPost("force-logout/{userId:int}")]
    public async Task<IActionResult> ForceLogout(int userId)
    {
        if (!User.IsInRole("SuperAdmin"))
        {
            return StatusCode(403, new { message = "Only Super Admin can force logout sessions." });
        }

        var user = await _db.Users.FirstOrDefaultAsync(x => x.Id == userId);
        if (user == null) return NotFound(new { message = "User not found" });

        await _adminSafetyService.RevokeSessionsAsync(userId);

        await _auditService.LogAsync(
            "FORCE_LOGOUT",
            $"SuperAdmin terminated all active sessions for {user.Email}",
            user.Id,
            user.Email);

        return Ok(new { message = $"All active sessions for {user.Name} ({user.Email}) have been terminated." });
    }

    [HttpGet("audit-logs")]
    public async Task<IActionResult> GetAuditLogs(
        [FromQuery] string? search,
        [FromQuery] string? action,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 30)
    {
        page = Math.Max(page, 1);
        pageSize = Math.Clamp(pageSize, 5, 100);

        var query = _db.AuditLogs.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            search = search.Trim().ToLower();
            query = query.Where(x =>
                x.Action.ToLower().Contains(search) ||
                (x.Description != null && x.Description.ToLower().Contains(search)) ||
                (x.UserEmail != null && x.UserEmail.ToLower().Contains(search)));
        }

        if (!string.IsNullOrWhiteSpace(action) && action != "All")
        {
            query = query.Where(x => x.Action == action);
        }

        var total = await query.CountAsync();
        var logs = await query
            .OrderByDescending(x => x.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new
            {
                x.Id,
                x.Action,
                Details = x.Description,
                x.UserId,
                x.UserEmail,
                x.IpAddress,
                x.CreatedAt
            })
            .ToListAsync();

        return Ok(new
        {
            page,
            pageSize,
            total,
            totalPages = (int)Math.Ceiling(total / (double)pageSize),
            data = logs
        });
    }
}

public class AdminUpdateUserDto
{
    public string? Name { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public bool? IsActive { get; set; }
}

public class AdminUpdateRoleDto
{
    public string Role { get; set; } = string.Empty;
}

public class AdminUpdateUserRightsDto
{
    public List<int> GrantedPermissionIds { get; set; } = new();
    public List<int> RevokedPermissionIds { get; set; } = new();
}
