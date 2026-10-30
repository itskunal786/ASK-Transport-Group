using ASK.Group.Api.Application.Common.Interfaces;
using ASK.Group.Api.Data;
using ASK.Group.Api.Services;
using Microsoft.EntityFrameworkCore;
using QuestPDF.Infrastructure;

namespace ASK.Group.Api.Extensions;

public static class InfrastructureServiceExtensions
{
    public static IServiceCollection AddInfrastructureServices(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // 1. QuestPDF Evaluation License
        QuestPDF.Settings.License = LicenseType.Evaluation;

        // 2. Database Context & Interface Registration
        var connectionString = configuration.GetConnectionString("DefaultConnection");
        if (string.IsNullOrWhiteSpace(connectionString))
        {
            throw new InvalidOperationException("Database connection string 'DefaultConnection' is missing.");
        }

        services.AddDbContext<AskTransportDbContext>(options =>
        {
            options.UseSqlServer(connectionString);
        });

        // Clean Architecture: Bind IAskTransportDbContext to concrete DbContext
        services.AddScoped<IAskTransportDbContext>(sp => sp.GetRequiredService<AskTransportDbContext>());

        // 3. External Infrastructure Adapters
        services.AddScoped<JwtService>();
        services.AddScoped<RefreshTokenService>();
        services.AddScoped<EmailService>();
        services.AddScoped<InvoicePdfService>();
        services.AddScoped<DocumentStorageService>();
        services.AddScoped<RazorpayService>();
        services.AddScoped<RazorpayWebhookService>();
        services.AddScoped<WebhookService>();

        // 4. Partner Webhook Outbound HttpClient
        services.AddHttpClient("PartnerWebhookClient", client =>
        {
            client.Timeout = TimeSpan.FromSeconds(15);
        });

        // 5. SignalR Real-Time Communication
        services.AddSignalR();

        // 6. Startup Validation Singleton
        services.AddSingleton<StartupValidationService>();

        // 7. Background Hosted Services
        services.AddHostedService<ComplianceBackgroundService>();
        services.AddHostedService<BackgroundCleanupService>();
        services.AddHostedService<OperationsAlertBackgroundService>();
        services.AddHostedService<WebhookDeliveryBackgroundService>();
        services.AddHostedService<OperationsExceptionBackgroundService>();

        return services;
    }

    public static async Task UseInfrastructurePersistenceAsync(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AskTransportDbContext>();

        await db.Database.MigrateAsync();
        await DbInitializer.SeedAsync(db);
        await RbacSeeder.SeedAsync(db);
    }
}
