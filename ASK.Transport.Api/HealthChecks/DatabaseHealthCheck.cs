using ASK.Group.Api.Data;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace ASK.Group.Api.HealthChecks;

public class DatabaseHealthCheck
    : IHealthCheck
{
    private readonly AskTransportDbContext _db;

    public DatabaseHealthCheck(
        AskTransportDbContext db)
    {
        _db = db;
    }

    public async Task<HealthCheckResult>
        CheckHealthAsync(
            HealthCheckContext context,
            CancellationToken cancellationToken =
                default)
    {
        try
        {
            var canConnect =
                await _db.Database
                    .CanConnectAsync(
                        cancellationToken);

            if (!canConnect)
            {
                return HealthCheckResult
                    .Unhealthy(
                        "Database connection failed.");
            }

            return HealthCheckResult
                .Healthy(
                    "Database connection is healthy.");
        }
        catch (Exception ex)
        {
            return HealthCheckResult
                .Unhealthy(
                    "Database health check failed.",
                    ex);
        }
    }
}