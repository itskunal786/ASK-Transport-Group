namespace ASK.Group.Api.Services;

public class BackgroundCleanupService
    : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<BackgroundCleanupService> _logger;

    public BackgroundCleanupService(
        IServiceScopeFactory scopeFactory,
        ILogger<BackgroundCleanupService> logger)
    {
        _scopeFactory =
            scopeFactory;

        _logger =
            logger;
    }

    protected override async Task ExecuteAsync(
        CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope =
                    _scopeFactory.CreateScope();

                var cleanupService =
                    scope.ServiceProvider
                        .GetRequiredService<
                            CleanupService>();

                var removed =
                    await cleanupService
                        .CleanupExpiredDataAsync();

                if (removed > 0)
                {
                    _logger.LogInformation(
                        "Background cleanup removed {Count} expired records.",
                        removed);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Background cleanup failed.");
            }

            try
            {
                await Task.Delay(
                    TimeSpan.FromHours(1),
                    stoppingToken);
            }
            catch (TaskCanceledException)
            {
                break;
            }
        }
    }
}