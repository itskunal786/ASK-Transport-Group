using ASK.Group.Api.Data;
using ASK.Group.Api.Models;

namespace ASK.Group.Api.Services;

public class AuditService
{
    private readonly AskTransportDbContext _db;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public AuditService(
        AskTransportDbContext db,
        IHttpContextAccessor httpContextAccessor)
    {
        _db = db;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task LogAsync(
        string action,
        string? description = null,
        int? userId = null,
        string? userEmail = null)
    {
        var context =
            _httpContextAccessor.HttpContext;

        var ipAddress =
            context?.Connection
                .RemoteIpAddress?
                .ToString();

        var userAgent =
            context?.Request.Headers
                .UserAgent
                .ToString();

        var auditLog =
            new AuditLog
            {
                UserId = userId,
                UserEmail = userEmail,
                Action = action,
                Description = description,
                IpAddress = ipAddress,
                UserAgent = userAgent,
                CreatedAt = DateTime.UtcNow
            };

        _db.AuditLogs.Add(auditLog);

        await _db.SaveChangesAsync();
    }
}