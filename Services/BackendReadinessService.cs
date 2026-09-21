using ASK.Group.Api.Data;
using ASK.Group.Api.DTOs;
using ASK.Group.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace ASK.Group.Api.Services;

public class BackendReadinessService
{
    private readonly AskTransportDbContext _db;
    private readonly IConfiguration _configuration;

    public BackendReadinessService(
        AskTransportDbContext db,
        IConfiguration configuration)
    {
        _db = db;
        _configuration = configuration;
    }

    public async Task<BackendReadinessResponse>
        CheckAsync(
            CancellationToken cancellationToken =
                default)
    {
        var result =
            new BackendReadinessResponse();

        try
        {
            result.DatabaseConnected =
                await _db.Database
                    .CanConnectAsync(
                        cancellationToken);
        }
        catch
        {
            result.DatabaseConnected =
                false;
        }

        if (!result.DatabaseConnected)
        {
            result.Issues.Add(
                "Database connection failed.");

            result.Status =
                "Not Ready";

            result.IsReady =
                false;

            return result;
        }

        result.AdminExists =
            await _db.Users
                .AsNoTracking()
                .AnyAsync(
                    x =>
                        x.Role ==
                            UserRole.Admin &&
                        x.IsActive,
                    cancellationToken);

        result.PermissionCount =
            await _db.Permissions
                .AsNoTracking()
                .CountAsync(
                    x =>
                        x.IsActive,
                    cancellationToken);

        result.PermissionsSeeded =
            result.PermissionCount > 0;

        result.RoleCount =
            await _db.AppRoles
                .AsNoTracking()
                .CountAsync(
                    x =>
                        x.IsActive,
                    cancellationToken);

        result.RolesSeeded =
            result.RoleCount > 0;

        result.CustomerRoleExists =
            await _db.AppRoles
                .AsNoTracking()
                .AnyAsync(
                    x =>
                        x.Name ==
                            "Customer" &&
                        x.IsActive,
                    cancellationToken);

        result.NotificationTemplatesSeeded =
            await _db.NotificationTemplates
                .AsNoTracking()
                .AnyAsync(
                    x =>
                        x.IsActive,
                    cancellationToken);

        result.UserCount =
            await _db.Users
                .AsNoTracking()
                .CountAsync(
                    cancellationToken);

        result.BookingCount =
            await _db.Bookings
                .AsNoTracking()
                .CountAsync(
                    cancellationToken);

        result.ShipmentCount =
            await _db.Shipments
                .AsNoTracking()
                .CountAsync(
                    cancellationToken);

        result.DriverCount =
            await _db.Drivers
                .AsNoTracking()
                .CountAsync(
                    cancellationToken);

        result.VehicleCount =
            await _db.Vehicles
                .AsNoTracking()
                .CountAsync(
                    cancellationToken);

        if (!result.AdminExists)
        {
            result.Issues.Add(
                "No active administrator exists.");
        }

        if (!result.PermissionsSeeded)
        {
            result.Issues.Add(
                "Permissions are not seeded.");
        }

        if (!result.RolesSeeded)
        {
            result.Issues.Add(
                "Roles are not seeded.");
        }

        if (!result.CustomerRoleExists)
        {
            result.Issues.Add(
                "Customer role is missing.");
        }

        if (!result.NotificationTemplatesSeeded)
        {
            result.Issues.Add(
                "Notification templates are missing.");
        }

        ValidateConfiguration(
            result);

        result.IsReady =
            result.Issues.Count == 0;

        result.Status =
            result.IsReady
                ? "Ready"
                : "Needs Attention";

        result.CheckedAt =
            DateTime.UtcNow;

        return result;
    }

    private void ValidateConfiguration(
        BackendReadinessResponse result)
    {
        var jwtKey =
            _configuration[
                "Jwt:Key"];

        var jwtIssuer =
            _configuration[
                "Jwt:Issuer"];

        var jwtAudience =
            _configuration[
                "Jwt:Audience"];

        if (string.IsNullOrWhiteSpace(
            jwtKey))
        {
            result.Issues.Add(
                "JWT key is missing.");
        }

        if (string.IsNullOrWhiteSpace(
            jwtIssuer))
        {
            result.Issues.Add(
                "JWT issuer is missing.");
        }

        if (string.IsNullOrWhiteSpace(
            jwtAudience))
        {
            result.Issues.Add(
                "JWT audience is missing.");
        }

        var razorpayKeyId =
            _configuration[
                "Razorpay:KeyId"];

        var razorpaySecret =
            _configuration[
                "Razorpay:KeySecret"];

        if (string.IsNullOrWhiteSpace(
                razorpayKeyId) !=
            string.IsNullOrWhiteSpace(
                razorpaySecret))
        {
            result.Issues.Add(
                "Razorpay KeyId and KeySecret must be configured together.");
        }
    }
}