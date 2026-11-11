using ASK.Group.Api.Authorization;
using ASK.Group.Api.Data;
using ASK.Group.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.Security.Cryptography;

namespace ASK.Group.Api.Controllers;

[ApiController]
[Route("api/partner-webhooks")]
[Authorize]
public class PartnerWebhookController : ControllerBase
{
    private readonly AskTransportDbContext _db;

    public PartnerWebhookController(
        AskTransportDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    [HasPermission(
        Permissions.Settings.View)]
    public async Task<IActionResult> GetAll(
        CancellationToken cancellationToken)
    {
        var webhooks =
            await _db.PartnerWebhooks
                .AsNoTracking()
                .OrderBy(x =>
                    x.PartnerName)
                .Select(x => new
                {
                    x.Id,
                    x.PartnerName,
                    x.WebhookUrl,
                    x.Events,
                    x.IsActive,
                    x.LastSuccessAt,
                    x.LastFailureAt,
                    x.LastError,
                    x.CreatedAt,
                    x.UpdatedAt
                })
                .ToListAsync(
                    cancellationToken);

        return Ok(webhooks);
    }

    [HttpGet("{id:int}")]
    [HasPermission(
        Permissions.Settings.View)]
    public async Task<IActionResult> GetById(
        int id,
        CancellationToken cancellationToken)
    {
        var webhook =
            await _db.PartnerWebhooks
                .AsNoTracking()
                .Where(x =>
                    x.Id == id)
                .Select(x => new
                {
                    x.Id,
                    x.PartnerName,
                    x.WebhookUrl,
                    x.Events,
                    x.IsActive,
                    x.LastSuccessAt,
                    x.LastFailureAt,
                    x.LastError,
                    x.CreatedAt,
                    x.UpdatedAt
                })
                .FirstOrDefaultAsync(
                    cancellationToken);

        if (webhook == null)
        {
            return NotFound(new
            {
                message =
                    "Partner webhook not found"
            });
        }

        return Ok(webhook);
    }

    [HttpPost]
    [HasPermission(
        Permissions.Settings.Edit)]
    public async Task<IActionResult> Create(
        CreatePartnerWebhookRequest request,
        CancellationToken cancellationToken)
    {
        var partnerName =
            request.PartnerName.Trim();

        var webhookUrl =
            request.WebhookUrl.Trim();

        if (!Uri.TryCreate(
            webhookUrl,
            UriKind.Absolute,
            out var uri))
        {
            return BadRequest(new
            {
                message =
                    "Invalid webhook URL"
            });
        }

        if (!string.Equals(
            uri.Scheme,
            Uri.UriSchemeHttps,
            StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest(new
            {
                message =
                    "Webhook URL must use HTTPS"
            });
        }

        var duplicate =
            await _db.PartnerWebhooks
                .AnyAsync(
                    x =>
                        x.PartnerName ==
                        partnerName,
                    cancellationToken);

        if (duplicate)
        {
            return BadRequest(new
            {
                message =
                    "Partner webhook already exists"
            });
        }

        var secret =
            GenerateSecret();

        var webhook =
            new PartnerWebhook
            {
                PartnerName =
                    partnerName,

                WebhookUrl =
                    webhookUrl,

                SecretKey =
                    secret,

                Events =
                    NormalizeEvents(
                        request.Events),

                IsActive =
                    true
            };

        _db.PartnerWebhooks.Add(
            webhook);

        await _db.SaveChangesAsync(
            cancellationToken);

        return Ok(new
        {
            message =
                "Partner webhook created successfully",

            webhook.Id,
            webhook.PartnerName,
            webhook.WebhookUrl,
            webhook.Events,
            webhook.IsActive,

            secretKey =
                secret,

            warning =
                "Save this secret securely. It should be treated as confidential."
        });
    }

    [HttpPut("{id:int}")]
    [HasPermission(
        Permissions.Settings.Edit)]
    public async Task<IActionResult> Update(
        int id,
        UpdatePartnerWebhookRequest request,
        CancellationToken cancellationToken)
    {
        var webhook =
            await _db.PartnerWebhooks
                .FirstOrDefaultAsync(
                    x =>
                        x.Id == id,
                    cancellationToken);

        if (webhook == null)
        {
            return NotFound(new
            {
                message =
                    "Partner webhook not found"
            });
        }

        if (!string.IsNullOrWhiteSpace(
            request.PartnerName))
        {
            var name =
                request.PartnerName.Trim();

            var duplicate =
                await _db.PartnerWebhooks
                    .AnyAsync(
                        x =>
                            x.Id != id &&
                            x.PartnerName ==
                            name,
                        cancellationToken);

            if (duplicate)
            {
                return BadRequest(new
                {
                    message =
                        "Partner name already exists"
                });
            }

            webhook.PartnerName =
                name;
        }

        if (!string.IsNullOrWhiteSpace(
            request.WebhookUrl))
        {
            var url =
                request.WebhookUrl.Trim();

            if (!Uri.TryCreate(
                url,
                UriKind.Absolute,
                out var uri))
            {
                return BadRequest(new
                {
                    message =
                        "Invalid webhook URL"
                });
            }

            if (!string.Equals(
                uri.Scheme,
                Uri.UriSchemeHttps,
                StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest(new
                {
                    message =
                        "Webhook URL must use HTTPS"
                });
            }

            webhook.WebhookUrl =
                url;
        }

        if (request.Events != null)
        {
            webhook.Events =
                NormalizeEvents(
                    request.Events);
        }

        if (request.IsActive.HasValue)
        {
            webhook.IsActive =
                request.IsActive.Value;
        }

        await _db.SaveChangesAsync(
            cancellationToken);

        return Ok(new
        {
            message =
                "Partner webhook updated successfully",

            webhook.Id,
            webhook.PartnerName,
            webhook.WebhookUrl,
            webhook.Events,
            webhook.IsActive
        });
    }

    [HttpPost(
        "{id:int}/rotate-secret")]
    [HasPermission(
        Permissions.Settings.Edit)]
    public async Task<IActionResult>
        RotateSecret(
            int id,
            CancellationToken cancellationToken)
    {
        var webhook =
            await _db.PartnerWebhooks
                .FirstOrDefaultAsync(
                    x =>
                        x.Id == id,
                    cancellationToken);

        if (webhook == null)
        {
            return NotFound(new
            {
                message =
                    "Partner webhook not found"
            });
        }

        var secret =
            GenerateSecret();

        webhook.SecretKey =
            secret;

        await _db.SaveChangesAsync(
            cancellationToken);

        return Ok(new
        {
            message =
                "Webhook secret rotated successfully",

            webhook.Id,

            secretKey =
                secret
        });
    }

    [HttpGet("{id:int}/logs")]
    [HasPermission(
        Permissions.Settings.View)]
    public async Task<IActionResult> GetLogs(
        int id,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        CancellationToken cancellationToken = default)
    {
        var exists =
            await _db.PartnerWebhooks
                .AsNoTracking()
                .AnyAsync(
                    x =>
                        x.Id == id,
                    cancellationToken);

        if (!exists)
        {
            return NotFound(new
            {
                message =
                    "Partner webhook not found"
            });
        }

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
            _db.WebhookDeliveryLogs
                .AsNoTracking()
                .Where(x =>
                    x.PartnerWebhookId ==
                    id);

        var totalRecords =
            await query.CountAsync(
                cancellationToken);

        var logs =
            await query
                .OrderByDescending(x =>
                    x.AttemptedAt)
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
                    x.AttemptNumber,
                    x.HttpStatusCode,
                    x.IsSuccess,
                    x.ResponseBody,
                    x.ErrorMessage,
                    x.AttemptedAt
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

            data =
                logs
        });
    }

    [HttpDelete("{id:int}")]
    [HasPermission(
        Permissions.Settings.Edit)]
    public async Task<IActionResult> Delete(
        int id,
        CancellationToken cancellationToken)
    {
        var webhook =
            await _db.PartnerWebhooks
                .FirstOrDefaultAsync(
                    x =>
                        x.Id == id,
                    cancellationToken);

        if (webhook == null)
        {
            return NotFound(new
            {
                message =
                    "Partner webhook not found"
            });
        }

        webhook.IsActive =
            false;

        await _db.SaveChangesAsync(
            cancellationToken);

        return Ok(new
        {
            message =
                "Partner webhook disabled successfully"
        });
    }

    private static string GenerateSecret()
    {
        return Convert.ToHexString(
                RandomNumberGenerator
                    .GetBytes(32))
            .ToLowerInvariant();
    }

    private static string? NormalizeEvents(
        string? events)
    {
        if (string.IsNullOrWhiteSpace(
            events))
        {
            return null;
        }

        var values =
            events.Split(
                    ',',
                    StringSplitOptions
                        .RemoveEmptyEntries |
                    StringSplitOptions
                        .TrimEntries)
                .Distinct(
                    StringComparer
                        .OrdinalIgnoreCase)
                .ToArray();

        return values.Length == 0
            ? null
            : string.Join(
                ',',
                values);
    }
}

public class CreatePartnerWebhookRequest
{
    [Required]
    [MaxLength(120)]
    public string PartnerName { get; set; } =
        string.Empty;

    [Required]
    [MaxLength(500)]
    public string WebhookUrl { get; set; } =
        string.Empty;

    [MaxLength(500)]
    public string? Events { get; set; }
}

public class UpdatePartnerWebhookRequest
{
    [MaxLength(120)]
    public string? PartnerName { get; set; }

    [MaxLength(500)]
    public string? WebhookUrl { get; set; }

    [MaxLength(500)]
    public string? Events { get; set; }

    public bool? IsActive { get; set; }
}