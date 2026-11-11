using ASK.Group.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace ASK.Group.Api.Services;

public class SystemSettingService
{
    private readonly AskTransportDbContext _db;

    public SystemSettingService(
        AskTransportDbContext db)
    {
        _db = db;
    }

    public async Task<string> GetAsync(
        string key,
        string defaultValue = "")
    {
        var value = await _db.SystemSettings
            .AsNoTracking()
            .Where(x => x.Key == key)
            .Select(x => x.Value)
            .FirstOrDefaultAsync();

        return string.IsNullOrWhiteSpace(value)
            ? defaultValue
            : value;
    }

    public async Task<int> GetIntAsync(
        string key,
        int defaultValue)
    {
        var value = await GetAsync(
            key,
            defaultValue.ToString());

        return int.TryParse(
            value,
            out var result)
            ? result
            : defaultValue;
    }

    public async Task<decimal> GetDecimalAsync(
        string key,
        decimal defaultValue)
    {
        var value = await GetAsync(
            key,
            defaultValue.ToString());

        return decimal.TryParse(
            value,
            out var result)
            ? result
            : defaultValue;
    }

    public async Task SetAsync(
        string key,
        string value,
        string group = "General",
        string? description = null,
        bool isPublic = false)
    {
        var setting = await _db.SystemSettings
            .FirstOrDefaultAsync(x =>
                x.Key == key);

        if (setting == null)
        {
            setting = new Models.SystemSetting
            {
                Key = key,
                Value = value,
                Group = group,
                Description = description,
                IsPublic = isPublic,
                CreatedAt = DateTime.UtcNow
            };

            _db.SystemSettings.Add(setting);
        }
        else
        {
            setting.Value = value;
            setting.Group = group;
            setting.Description = description;
            setting.IsPublic = isPublic;
            setting.UpdatedAt = DateTime.UtcNow;
        }

        await _db.SaveChangesAsync();
    }
}