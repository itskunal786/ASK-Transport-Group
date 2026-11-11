using ASK.Group.Api.Data;
using ASK.Group.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace ASK.Group.Api.Services;

public class TemplateService
{
    private readonly AskTransportDbContext _db;

    public TemplateService(
        AskTransportDbContext db)
    {
        _db = db;
    }

    public async Task<NotificationTemplate?>
        GetAsync(
            string code)
    {
        return await _db.NotificationTemplates
            .AsNoTracking()
            .FirstOrDefaultAsync(x =>
                x.Code == code &&
                x.IsActive);
    }

    public string Render(
        string template,
        Dictionary<string, string> values)
    {
        var result =
            template;

        foreach (var item in values)
        {
            result =
                result.Replace(
                    $"{{{{{item.Key}}}}}",
                    item.Value,
                    StringComparison.OrdinalIgnoreCase);
        }

        return result;
    }
}