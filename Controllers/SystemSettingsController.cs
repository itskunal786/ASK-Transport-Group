using ASK.Group.Api.Authorization;
using ASK.Group.Api.Data;
using ASK.Group.Api.DTOs;
using ASK.Group.Api.Models;
using ASK.Group.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ASK.Group.Api.Controllers;

[ApiController]
[Route("api/system-settings")]
public class SystemSettingsController : ControllerBase
{
    private readonly AskTransportDbContext _db;
    private readonly AuditService _auditService;

    public SystemSettingsController(
        AskTransportDbContext db,
        AuditService auditService)
    {
        _db = db;
        _auditService = auditService;
    }

    [HttpGet("public")]
    [AllowAnonymous]
    public async Task<IActionResult> GetPublic()
    {
        var data = await _db.SystemSettings
            .AsNoTracking()
            .Where(x => x.IsPublic)
            .OrderBy(x => x.Group)
            .ThenBy(x => x.Key)
            .Select(x => new
            {
                x.Key,
                x.Value,
                x.Group
            })
            .ToListAsync();

        return Ok(data);
    }

    [HttpGet]
    [HasPermission(Permissions.Settings.View)]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? group)
    {
        var query = _db.SystemSettings
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(group))
        {
            group = group.Trim();

            query = query.Where(x =>
                x.Group == group);
        }

        var data = await query
            .OrderBy(x => x.Group)
            .ThenBy(x => x.Key)
            .ToListAsync();

        return Ok(data);
    }

    [HttpPut]
    [HasPermission(Permissions.Settings.Edit)]
    public async Task<IActionResult> Set(
        UpdateSettingRequest request)
    {
        var key = request.Key.Trim();

        var setting = await _db.SystemSettings
            .FirstOrDefaultAsync(x =>
                x.Key == key);

        if (setting == null)
        {
            setting = new SystemSetting
            {
                Key = key,
                Value = request.Value.Trim(),
                Group = request.Group.Trim(),
                Description =
                    request.Description?.Trim(),
                IsPublic =
                    request.IsPublic,
                CreatedAt =
                    DateTime.UtcNow
            };

            _db.SystemSettings.Add(setting);
        }
        else
        {
            setting.Value =
                request.Value.Trim();

            setting.Group =
                request.Group.Trim();

            setting.Description =
                request.Description?.Trim();

            setting.IsPublic =
                request.IsPublic;

            setting.UpdatedAt =
                DateTime.UtcNow;
        }

        await _db.SaveChangesAsync();

        await _auditService.LogAsync(
            "SETTING_UPDATED",
            $"Setting {setting.Key} updated");

        return Ok(new
        {
            message =
                "Setting saved successfully",

            setting
        });
    }

    [HttpDelete("{id:int}")]
    [HasPermission(Permissions.Settings.Edit)]
    public async Task<IActionResult> Delete(
        int id)
    {
        var setting = await _db.SystemSettings
            .FirstOrDefaultAsync(x =>
                x.Id == id);

        if (setting == null)
        {
            return NotFound(new
            {
                message =
                    "Setting not found"
            });
        }

        _db.SystemSettings.Remove(setting);

        await _db.SaveChangesAsync();

        return Ok(new
        {
            message =
                "Setting deleted successfully"
        });
    }
}