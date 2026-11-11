using Microsoft.Extensions.Logging;

namespace ASK.Transport.Logging;

public class AppLogger<T> : IAppLogger<T>
{
    private readonly ILogger<T> _logger;

    public AppLogger(ILogger<T> logger)
    {
        _logger = logger;
    }

    public void LogInfo(string message, params object[] args)
    {
        _logger.LogInformation(message, args);
    }

    public void LogWarning(string message, params object[] args)
    {
        _logger.LogWarning(message, args);
    }

    public void LogError(Exception exception, string message, params object[] args)
    {
        _logger.LogError(exception, message, args);
    }

    public void LogAuditEvent(string action, string user, string details)
    {
        _logger.LogInformation(
            "[LOGISTICS_AUDIT] Action: {Action} | Identity: {User} | Payload: {Details} | Timestamp: {Timestamp}",
            action,
            user,
            details,
            DateTime.UtcNow);
    }
}
