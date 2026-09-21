namespace ASK.Group.Api.Services;

public class ComplianceBackgroundService
    : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<ComplianceBackgroundService> _logger;

    public ComplianceBackgroundService(
        IServiceScopeFactory scopeFactory,
        ILogger<ComplianceBackgroundService> logger)
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

                var service =
                    scope.ServiceProvider
                        .GetRequiredService<
                            ComplianceAlertService>();

                await service
                    .GenerateAlertsAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Compliance alert generation failed.");
            }

            try
            {
                await Task.Delay(
                    TimeSpan.FromHours(24),
                    stoppingToken);
            }
            catch (TaskCanceledException)
            {
                break;
            }
        }
    }
}