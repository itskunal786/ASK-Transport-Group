using Microsoft.Extensions.DependencyInjection;

namespace ASK.Transport.Logging;

public static class LoggingExtensions
{
    public static IServiceCollection AddApplicationLogging(this IServiceCollection services)
    {
        services.AddScoped(typeof(IAppLogger<>), typeof(AppLogger<>));
        return services;
    }
}
