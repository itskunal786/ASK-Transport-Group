using ASK.Group.Api.Authorization;
using ASK.Group.Api.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ASK.Group.Api.Controllers;

[ApiController]
[Route("api/webhook-outbox")]
[Authorize]
public class WebhookOutboxController
    : ControllerBase
{
    private readonly AskTransportDbContext _db;

    public WebhookOutboxController(
        AskTransportDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    [HasPermission(
        Permissions.Settings.View)]
    public async Task<IActionResult> Get(
        [FromQuery] string? status,
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
            _db.WebhookOutboxMessages
                .AsNoTracking()
                .AsQueryable();

        if (!string.IsNullOrWhiteSpace(
            status))
        {
            status =
                status.Trim();

            query =
                query.Where(x =>
                    x.Status ==
                    status);
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
                    x.EventName,
                    x.ReferenceId,
                    x.Status,
                    x.AttemptCount,
                    x.MaxAttempts,
                    x.NextAttemptAt,
                    x.CompletedAt,
                    x.FailedAt,
                    x.LastError,
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

    [HttpPost("{id:int}/retry")]
    [HasPermission(
        Permissions.Settings.Edit)]
    public async Task<IActionResult> Retry(
        int id,
        CancellationToken cancellationToken)
    {
        var message =
            await _db.WebhookOutboxMessages
                .FirstOrDefaultAsync(
                    x =>
                        x.Id == id,
                    cancellationToken);

        if (message == null)
        {
            return NotFound(new
            {
                message =
                    "Webhook message not found"
            });
        }

        if (message.Status ==
            "Completed")
        {
            return BadRequest(new
            {
                message =
                    "Completed webhook cannot be retried"
            });
        }

        message.Status =
            "Pending";

        message.AttemptCount =
            0;

        message.NextAttemptAt =
            DateTime.UtcNow;

        message.ProcessingStartedAt =
            null;

        message.CompletedAt =
            null;

        message.FailedAt =
            null;

        message.LastError =
            null;

        await _db.SaveChangesAsync(
            cancellationToken);

        return Ok(new
        {
            message =
                "Webhook queued for retry"
        });
    }

    [HttpPost("retry-all-failed")]
    [HasPermission(
        Permissions.Settings.Edit)]
    public async Task<IActionResult>
        RetryAllFailed(
            CancellationToken cancellationToken)
    {
        var messages =
            await _db.WebhookOutboxMessages
                .Where(x =>
                    x.Status ==
                    "Failed")
                .OrderBy(x => x.Id)
                .Take(500)
                .ToListAsync(
                    cancellationToken);

        foreach (var message
                 in messages)
        {
            message.Status =
                "Pending";

            message.AttemptCount =
                0;

            message.NextAttemptAt =
                DateTime.UtcNow;

            message.ProcessingStartedAt =
                null;

            message.FailedAt =
                null;

            message.LastError =
                null;
        }

        if (messages.Count > 0)
        {
            await _db.SaveChangesAsync(
                cancellationToken);
        }

        return Ok(new
        {
            message =
                "Failed webhooks queued for retry",

            count =
                messages.Count
        });
    }
}
