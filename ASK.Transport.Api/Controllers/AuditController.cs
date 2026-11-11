using ASK.Group.Api.Authorization;
using ASK.Group.Api.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ASK.Group.Api.Controllers;

[ApiController]
[Route("api/audit")]
public class AuditController : ControllerBase
{
    private readonly AskTransportDbContext _db;

    public AuditController(
        AskTransportDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    [HasPermission(Permissions.Reports.View)]
    public async Task<IActionResult> Get(
        [FromQuery] string? action,
        [FromQuery] string? search,
        [FromQuery] int? userId,
        [FromQuery] DateTime? fromDate,
        [FromQuery] DateTime? toDate,
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
            _db.AuditLogs
                .AsNoTracking()
                .AsQueryable();

        if (!string.IsNullOrWhiteSpace(
            action))
        {
            action =
                action.Trim();

            query =
                query.Where(x =>
                    x.Action == action);
        }

        if (userId.HasValue)
        {
            query =
                query.Where(x =>
                    x.UserId ==
                    userId.Value);
        }

        if (!string.IsNullOrWhiteSpace(
            search))
        {
            search =
                search.Trim();

            query =
                query.Where(x =>
                    x.Action.Contains(
                        search) ||
                    (x.Description != null &&
                     x.Description.Contains(
                         search)) ||
                    (x.UserEmail != null &&
                     x.UserEmail.Contains(
                         search)) ||
                    (x.IpAddress != null &&
                     x.IpAddress.Contains(
                         search)));
        }

        if (fromDate.HasValue)
        {
            var from =
                fromDate.Value;

            query =
                query.Where(x =>
                    x.CreatedAt >= from);
        }

        if (toDate.HasValue)
        {
            var to =
                toDate.Value;

            query =
                query.Where(x =>
                    x.CreatedAt <= to);
        }

        var totalRecords =
            await query.CountAsync(
                cancellationToken);

        var data =
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
                    x.UserId,
                    x.UserEmail,
                    x.Action,
                    x.Description,
                    x.IpAddress,
                    x.UserAgent,
                    x.CreatedAt
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
    [HasPermission(Permissions.Reports.View)]
    public async Task<IActionResult> GetById(
        int id,
        CancellationToken cancellationToken)
    {
        var auditLog =
            await _db.AuditLogs
                .AsNoTracking()
                .Where(x =>
                    x.Id == id)
                .Select(x => new
                {
                    x.Id,
                    x.UserId,
                    x.UserEmail,
                    x.Action,
                    x.Description,
                    x.IpAddress,
                    x.UserAgent,
                    x.CreatedAt
                })
                .FirstOrDefaultAsync(
                    cancellationToken);

        if (auditLog == null)
        {
            return NotFound(new
            {
                message =
                    "Audit log not found"
            });
        }

        return Ok(auditLog);
    }

    [HttpGet("actions")]
    [HasPermission(Permissions.Reports.View)]
    public async Task<IActionResult> GetActions(
        CancellationToken cancellationToken)
    {
        var actions =
            await _db.AuditLogs
                .AsNoTracking()
                .Where(x =>
                    !string.IsNullOrWhiteSpace(
                        x.Action))
                .Select(x =>
                    x.Action)
                .Distinct()
                .OrderBy(x =>
                    x)
                .ToListAsync(
                    cancellationToken);

        return Ok(actions);
    }
}