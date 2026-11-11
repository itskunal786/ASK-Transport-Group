namespace ASK.Group.Api.Services;

public class WebhookDeliveryBackgroundService
    : BackgroundService
{
    private readonly IServiceScopeFactory
        _scopeFactory;

    private readonly ILogger<
        WebhookDeliveryBackgroundService>
        _logger;

    public WebhookDeliveryBackgroundService(
        IServiceScopeFactory scopeFactory,
        ILogger<
            WebhookDeliveryBackgroundService>
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
        try
        {
            await Task.Delay(
                TimeSpan.FromSeconds(20),
                stoppingToken);
        }
        catch (OperationCanceledException)
            when (stoppingToken.IsCancellationRequested)
        {
            return;
        }

        while (!stoppingToken
            .IsCancellationRequested)
        {
            try
            {
                using var scope =
                    _scopeFactory
                        .CreateScope();

                var webhookService =
                    scope.ServiceProvider
                        .GetRequiredService<
                            WebhookService>();

                var recovered =
                    await webhookService
                        .RecoverStuckMessagesAsync(
                            stoppingToken);

                var processed =
                    await webhookService
                        .ProcessPendingAsync(
                            25,
                            stoppingToken);

                if (recovered > 0)
                {
                    _logger.LogWarning(
                        "Recovered {Recovered} stuck webhook message(s).",
                        recovered);
                }

                if (processed > 0)
                {
                    _logger.LogInformation(
                        "Processed {Processed} webhook outbox message(s).",
                        processed);
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
                    "Webhook background delivery cycle failed.");
            }

            try
            {
                await Task.Delay(
                    TimeSpan.FromSeconds(30),
                    stoppingToken);
            }
            catch (OperationCanceledException)
                when (stoppingToken
                    .IsCancellationRequested)
            {
                break;
            }
        }
    }
}