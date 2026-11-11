namespace ASK.Transport.Logging;

public interface IAppLogger<T>
{
    void LogInfo(string message, params object[] args);
    void LogWarning(string message, params object[] args);
    void LogError(Exception exception, string message, params object[] args);
    void LogAuditEvent(string action, string user, string details);
}
