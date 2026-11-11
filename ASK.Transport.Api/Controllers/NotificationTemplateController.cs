using ASK.Group.Api.Authorization;
using ASK.Group.Api.Data;
using ASK.Group.Api.DTOs;
using ASK.Group.Api.Models;
using ASK.Group.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ASK.Group.Api.Controllers;

[ApiController]
[Route("api/notification-templates")]
public class NotificationTemplateController
    : ControllerBase
{
    private readonly AskTransportDbContext _db;
    private readonly AuditService _auditService;

    public NotificationTemplateController(
        AskTransportDbContext db,
        AuditService auditService)
    {
        _db = db;
        _auditService = auditService;
    }

    [HttpGet]
    [HasPermission(
        Permissions.Notifications.ManageTemplates)]
    public async Task<IActionResult> GetAll()
    {
        var data =
            await _db.NotificationTemplates
                .AsNoTracking()
                .OrderBy(x =>
                    x.Name)
                .ToListAsync();

        return Ok(data);
    }

    [HttpPost]
    [HasPermission(
        Permissions.Notifications.ManageTemplates)]
    public async Task<IActionResult> Create(
        NotificationTemplateRequest request)
    {
        var code =
            request.Code
                .Trim()
                .ToUpperInvariant();

        if (await _db.NotificationTemplates
            .AnyAsync(x =>
                x.Code == code))
        {
            return BadRequest(new
            {
                message =
                    "Template code already exists"
            });
        }

        var template =
            new NotificationTemplate
            {
                Code =
                    code,

                Name =
                    request.Name.Trim(),

                Channel =
                    request.Channel.Trim(),

                Subject =
                    request.Subject?.Trim(),

                Body =
                    request.Body,

                IsActive =
                    request.IsActive,

                CreatedAt =
                    DateTime.UtcNow
            };

        _db.NotificationTemplates.Add(
            template);

        await _db.SaveChangesAsync();

        await _auditService.LogAsync(
            "NOTIFICATION_TEMPLATE_CREATED",
            $"Template {template.Code} created");

        return Ok(new
        {
            message =
                "Template created successfully",

            template
        });
    }

    [HttpPut("{id:int}")]
    [HasPermission(
        Permissions.Notifications.ManageTemplates)]
    public async Task<IActionResult> Update(
        int id,
        NotificationTemplateRequest request)
    {
        var template =
            await _db.NotificationTemplates
                .FirstOrDefaultAsync(x =>
                    x.Id == id);

        if (template == null)
        {
            return NotFound(new
            {
                message =
                    "Template not found"
            });
        }

        template.Name =
            request.Name.Trim();

        template.Channel =
            request.Channel.Trim();

        template.Subject =
            request.Subject?.Trim();

        template.Body =
            request.Body;

        template.IsActive =
            request.IsActive;

        template.UpdatedAt =
            DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return Ok(new
        {
            message =
                "Template updated successfully"
        });
    }
}