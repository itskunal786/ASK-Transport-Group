using ASK.Group.Api.Authorization;
using ASK.Group.Api.Data;
using ASK.Group.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace ASK.Group.Api.Controllers;

[ApiController]
[Route("api/operations/exceptions")]
public class OperationsExceptionController
    : ControllerBase
{
    private readonly AskTransportDbContext _db;
    private readonly OperationsExceptionService
        _exceptionService;

    public OperationsExceptionController(
        AskTransportDbContext db,
        OperationsExceptionService exceptionService)
    {
        _db =
            db;

        _exceptionService =
            exceptionService;
    }

    [HttpGet]
    [HasPermission(
        Permissions.Notifications.ViewAlerts)]
    public async Task<IActionResult> Get(
        [FromQuery] string? status,
        [FromQuery] string? severity,
        [FromQuery] string? type,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        CancellationToken cancellationToken = default)
    {
        page =
            Math.Max(
                page,
                1);

        pageSize =
            Math.Clamp(
                pageSize,
                1,
                200);

        var query =
            _db.OperationsExceptions
                .AsNoTracking()
                .AsQueryable();

        if (!string.IsNullOrWhiteSpace(
            status))
        {
            status =
                status.Trim();

            query =
                query.Where(x =>
                    x.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(
            severity))
        {
            severity =
                severity.Trim();

            query =
                query.Where(x =>
                    x.Severity ==
                    severity);
        }

        if (!string.IsNullOrWhiteSpace(
            type))
        {
            type =
                type.Trim();

            query =
                query.Where(x =>
                    x.ExceptionType ==
                    type);
        }

        var totalRecords =
            await query.CountAsync(
                cancellationToken);

        var data =
            await query
                .OrderByDescending(x =>
                    x.Severity ==
                    "Critical")
                .ThenByDescending(x =>
                    x.EscalationLevel)
                .ThenByDescending(x =>
                    x.DetectedAt)
                .Skip(
                    (page - 1) *
                    pageSize)
                .Take(
                    pageSize)
                .Select(x => new
                {
                    x.Id,
                    x.ExceptionNumber,
                    x.ExceptionType,
                    x.Severity,
                    x.Status,
                    x.ReferenceType,
                    x.ReferenceNumber,
                    x.Title,
                    x.Description,
                    x.EscalationLevel,
                    x.AssignedDepartment,
                    x.AssignedToUserId,
                    x.DetectedAt,
                    x.DueAt,
                    x.LastEscalatedAt,
                    x.AcknowledgedAt,
                    x.ResolvedAt
                })
                .ToListAsync(
                    cancellationToken);

        return Ok(new
        {
            page,
            pageSize,
            totalRecords,

            totalPages =
                (int)Math.Ceiling(
                    totalRecords /
                    (double)pageSize),

            data
        });
    }

    [HttpGet("{id:int}")]
    [HasPermission(
        Permissions.Notifications.ViewAlerts)]
    public async Task<IActionResult> GetById(
        int id,
        CancellationToken cancellationToken)
    {
        var item =
            await _db.OperationsExceptions
                .AsNoTracking()
                .FirstOrDefaultAsync(
                    x => x.Id == id,
                    cancellationToken);

        if (item == null)
        {
            return NotFound(new
            {
                message =
                    "Operations exception not found"
            });
        }

        var history =
            await _db
                .OperationsExceptionHistories
                .AsNoTracking()
                .Where(x =>
                    x.OperationsExceptionId ==
                    id)
                .OrderByDescending(x =>
                    x.ActionAt)
                .ToListAsync(
                    cancellationToken);

        return Ok(new
        {
            exception =
                item,

            history
        });
    }

    [HttpPost("scan")]
    [HasPermission(
        Permissions.Notifications.ResolveAlerts)]
    public async Task<IActionResult> Scan(
        CancellationToken cancellationToken)
    {
        var created =
            await _exceptionService
                .ScanAsync(
                    cancellationToken);

        var escalated =
            await _exceptionService
                .EscalateAsync(
                    cancellationToken);

        return Ok(new
        {
            message =
                "Operations exception scan completed",

            created,
            escalated
        });
    }

    [HttpPost("{id:int}/acknowledge")]
    [HasPermission(
        Permissions.Notifications.ResolveAlerts)]
    public async Task<IActionResult> Acknowledge(
        int id,
        CancellationToken cancellationToken)
    {
        var userId =
            GetUserId();

        if (userId == null)
        {
            return Unauthorized();
        }

        var result =
            await _exceptionService
                .AcknowledgeAsync(
                    id,
                    userId.Value,
                    cancellationToken);

        if (!result)
        {
            return BadRequest(new
            {
                message =
                    "Exception cannot be acknowledged"
            });
        }

        return Ok(new
        {
            message =
                "Exception acknowledged successfully"
        });
    }

    [HttpPost("{id:int}/resolve")]
    [HasPermission(
        Permissions.Notifications.ResolveAlerts)]
    public async Task<IActionResult> Resolve(
        int id,
        ResolveOperationsExceptionRequest request,
        CancellationToken cancellationToken)
    {
        var userId =
            GetUserId();

        if (userId == null)
        {
            return Unauthorized();
        }

        var result =
            await _exceptionService
                .ResolveAsync(
                    id,
                    userId.Value,
                    request.ResolutionNotes,
                    cancellationToken);

        if (!result)
        {
            return NotFound(new
            {
                message =
                    "Operations exception not found"
            });
        }

        return Ok(new
        {
            message =
                "Exception resolved successfully"
        });
    }

    [HttpGet("dashboard")]
    [HasPermission(
        Permissions.Notifications.ViewAlerts)]
    public async Task<IActionResult> Dashboard(
        CancellationToken cancellationToken)
    {
        var open =
            await _db.OperationsExceptions
                .CountAsync(
                    x =>
                        x.Status != "Resolved" &&
                        x.Status != "Closed",
                    cancellationToken);

        var critical =
            await _db.OperationsExceptions
                .CountAsync(
                    x =>
                        x.Status != "Resolved" &&
                        x.Severity ==
                        "Critical",
                    cancellationToken);

        var escalated =
            await _db.OperationsExceptions
                .CountAsync(
                    x =>
                        x.Status != "Resolved" &&
                        x.EscalationLevel > 1,
                    cancellationToken);

        var overdue =
            await _db.OperationsExceptions
                .CountAsync(
                    x =>
                        x.Status != "Resolved" &&
                        x.DueAt.HasValue &&
                        x.DueAt.Value <
                        DateTime.UtcNow,
                    cancellationToken);

        var byType =
            await _db.OperationsExceptions
                .AsNoTracking()
                .Where(x =>
                    x.Status != "Resolved")
                .GroupBy(x =>
                    x.ExceptionType)
                .Select(x => new
                {
                    type =
                        x.Key,

                    count =
                        x.Count()
                })
                .OrderByDescending(x =>
                    x.count)
                .ToListAsync(
                    cancellationToken);

        return Ok(new
        {
            open,
            critical,
            escalated,
            overdue,
            byType
        });
    }

    private int? GetUserId()
    {
        var value =
            User.FindFirstValue(
                ClaimTypes.NameIdentifier);

        return int.TryParse(
            value,
            out var userId)
            ? userId
            : null;
    }
}

public class ResolveOperationsExceptionRequest
{
    public string? ResolutionNotes { get; set; }
}