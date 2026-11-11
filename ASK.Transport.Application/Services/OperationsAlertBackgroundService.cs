namespace ASK.Group.Api.Services;

public class OperationsAlertBackgroundService
    : BackgroundService
{
    private readonly IServiceScopeFactory
        _scopeFactory;

    private readonly ILogger<
        OperationsAlertBackgroundService>
        _logger;

    public OperationsAlertBackgroundService(
        IServiceScopeFactory scopeFactory,
        ILogger<
            OperationsAlertBackgroundService>
            logger)
    {
        _scopeFactory =
            scopeFactory;

        _logger =
            logger;
    }

    protected override async Task ExecuteAsync(
        CancellationToken stoppingToken)
    {
        await Task.Delay(
            TimeSpan.FromSeconds(30),
            stoppingToken);

        while (!stoppingToken
            .IsCancellationRequested)
        {
            try
            {
                using var scope =
                    _scopeFactory
                        .CreateScope();

                var service =
                    scope.ServiceProvider
                        .GetRequiredService<
                            OperationsAlertService>();

                await service
                    .CheckAndGenerateAlertsAsync(
                        stoppingToken);
            }
            catch (OperationCanceledException)
                when (
                    stoppingToken
                        .IsCancellationRequested)
            {
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Operations alert background job failed");
            }

            try
            {
                await Task.Delay(
                    TimeSpan.FromMinutes(5),
                    stoppingToken);
            }
            catch (OperationCanceledException)
                when (
                    stoppingToken
                        .IsCancellationRequested)
            {
                break;
            }
        }
    }
}