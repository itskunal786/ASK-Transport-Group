namespace ASK.Group.Api.Services;

public class OperationsExceptionBackgroundService
    : BackgroundService
{
    private readonly IServiceScopeFactory
        _scopeFactory;

    private readonly ILogger<
        OperationsExceptionBackgroundService>
        _logger;

    public OperationsExceptionBackgroundService(
        IServiceScopeFactory scopeFactory,
        ILogger<
            OperationsExceptionBackgroundService>
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
            TimeSpan.FromSeconds(45),
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
                            OperationsExceptionService>();

                var created =
                    await service.ScanAsync(
                        stoppingToken);

                var escalated =
                    await service.EscalateAsync(
                        stoppingToken);

                if (created > 0 ||
                    escalated > 0)
                {
                    _logger.LogInformation(
                        "Operations exception engine created {Created} and escalated {Escalated} exceptions.",
                        created,
                        escalated);
                }
            }
            catch (OperationCanceledException)
                when (stoppingToken
                    .IsCancellationRequested)
            {
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Operations exception engine failed.");
            }

            await Task.Delay(
                TimeSpan.FromMinutes(5),
                stoppingToken);
        }
    }
}