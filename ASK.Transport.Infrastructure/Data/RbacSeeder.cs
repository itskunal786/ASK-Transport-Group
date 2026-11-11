using ASK.Group.Api.Authorization;
using ASK.Group.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace ASK.Group.Api.Data;

public static class RbacSeeder
{
    public static async Task SeedAsync(
        AskTransportDbContext db)
    {
        await SeedPermissionsAsync(db);

        await SeedRolesAsync(db);

        await SeedRolePermissionsAsync(db);

        await AssignExistingUsersAsync(db);

        await SeedSystemSettingsAsync(db);

        await SeedNotificationTemplatesAsync(db);
    }

    private static async Task SeedPermissionsAsync(
        AskTransportDbContext db)
    {
        var permissions = new List<PermissionSeed>
        {
            new(
                Permissions.Users.View,
                "Users",
                "View",
                "View users"),

            new(
                Permissions.Users.Create,
                "Users",
                "Create",
                "Create users"),

            new(
                Permissions.Users.Edit,
                "Users",
                "Edit",
                "Edit users"),

            new(
                Permissions.Users.Delete,
                "Users",
                "Delete",
                "Delete users"),

            new(
                Permissions.Users.ManagePermissions,
                "Users",
                "ManagePermissions",
                "Manage user roles and permissions"),

            new(
                Permissions.Roles.View,
                "Roles",
                "View",
                "View roles"),

            new(
                Permissions.Roles.Create,
                "Roles",
                "Create",
                "Create roles"),

            new(
                Permissions.Roles.Edit,
                "Roles",
                "Edit",
                "Edit roles"),

            new(
                Permissions.Roles.Delete,
                "Roles",
                "Delete",
                "Delete roles"),

            new(
                Permissions.Roles.ManagePermissions,
                "Roles",
                "ManagePermissions",
                "Manage role permissions"),

            new(
                Permissions.Bookings.View,
                "Bookings",
                "View",
                "View all bookings"),

            new(
                Permissions.Bookings.ViewOwn,
                "Bookings",
                "ViewOwn",
                "View own bookings"),

            new(
                Permissions.Bookings.Create,
                "Bookings",
                "Create",
                "Create booking"),

            new(
                Permissions.Bookings.Edit,
                "Bookings",
                "Edit",
                "Edit booking"),

            new(
                Permissions.Bookings.Cancel,
                "Bookings",
                "Cancel",
                "Cancel booking"),

            new(
                Permissions.Bookings.Assign,
                "Bookings",
                "Assign",
                "Assign booking"),

            new(
                Permissions.Bookings.UpdateStatus,
                "Bookings",
                "UpdateStatus",
                "Update booking status"),

            new(
                Permissions.Tracking.View,
                "Tracking",
                "View",
                "View shipment tracking"),

            new(
                Permissions.Tracking.Update,
                "Tracking",
                "Update",
                "Update shipment tracking"),

            new(
                Permissions.Payments.View,
                "Payments",
                "View",
                "View payments"),

            new(
                Permissions.Payments.Create,
                "Payments",
                "Create",
                "Create payment"),

            new(
                Permissions.Payments.Refund,
                "Payments",
                "Refund",
                "Process refunds"),

            new(
                Permissions.Payments.Reconcile,
                "Payments",
                "Reconcile",
                "Reconcile gateway payments"),

            new(
                Permissions.Payments.ViewRefunds,
                "Payments",
                "ViewRefunds",
                "View refunds"),

            new(
                Permissions.Invoices.View,
                "Invoices",
                "View",
                "View invoices"),

            new(
                Permissions.Invoices.Create,
                "Invoices",
                "Create",
                "Generate invoices"),

            new(
                Permissions.Invoices.Email,
                "Invoices",
                "Email",
                "Email invoices"),

            new(
                Permissions.Documents.View,
                "Documents",
                "View",
                "View documents"),

            new(
                Permissions.Documents.Upload,
                "Documents",
                "Upload",
                "Upload documents"),

            new(
                Permissions.Documents.Delete,
                "Documents",
                "Delete",
                "Delete documents"),

            new(
                Permissions.Documents.UploadPod,
                "Documents",
                "UploadPOD",
                "Upload proof of delivery"),

            new(
                Permissions.Branches.View,
                "Branches",
                "View",
                "View branches"),

            new(
                Permissions.Branches.Create,
                "Branches",
                "Create",
                "Create branches"),

            new(
                Permissions.Branches.Edit,
                "Branches",
                "Edit",
                "Edit branches"),

            new(
                Permissions.Branches.Delete,
                "Branches",
                "Delete",
                "Delete branches"),

            new(
                Permissions.Hubs.View,
                "Hubs",
                "View",
                "View hubs"),

            new(
                Permissions.Hubs.Create,
                "Hubs",
                "Create",
                "Create hubs"),

            new(
                Permissions.Hubs.Edit,
                "Hubs",
                "Edit",
                "Edit hubs"),

            new(
                Permissions.Hubs.Delete,
                "Hubs",
                "Delete",
                "Delete hubs"),

            new(
                Permissions.Drivers.View,
                "Drivers",
                "View",
                "View drivers"),

            new(
                Permissions.Drivers.Create,
                "Drivers",
                "Create",
                "Create drivers"),

            new(
                Permissions.Drivers.Edit,
                "Drivers",
                "Edit",
                "Edit drivers"),

            new(
                Permissions.Drivers.Delete,
                "Drivers",
                "Delete",
                "Delete drivers"),

            new(
                Permissions.Drivers.Assign,
                "Drivers",
                "Assign",
                "Assign drivers"),

            new(
                Permissions.Vehicles.View,
                "Vehicles",
                "View",
                "View vehicles"),

            new(
                Permissions.Vehicles.Create,
                "Vehicles",
                "Create",
                "Create vehicles"),

            new(
                Permissions.Vehicles.Edit,
                "Vehicles",
                "Edit",
                "Edit vehicles"),

            new(
                Permissions.Vehicles.Delete,
                "Vehicles",
                "Delete",
                "Delete vehicles"),

            new(
                Permissions.Vehicles.Assign,
                "Vehicles",
                "Assign",
                "Assign vehicles"),

            new(
                Permissions.Shipments.View,
                "Shipments",
                "View",
                "View shipments"),

            new(
                Permissions.Shipments.Create,
                "Shipments",
                "Create",
                "Create shipments"),

            new(
                Permissions.Shipments.Edit,
                "Shipments",
                "Edit",
                "Edit shipments"),

            new(
                Permissions.Shipments.Assign,
                "Shipments",
                "Assign",
                "Assign shipments"),

            new(
                Permissions.Shipments.UpdateStatus,
                "Shipments",
                "UpdateStatus",
                "Update shipment status"),

            new(
                Permissions.Trips.View,
                "Trips",
                "View",
                "View transport trips"),

            new(
                Permissions.Trips.Create,
                "Trips",
                "Create",
                "Create transport trips"),

            new(
                Permissions.Trips.Edit,
                "Trips",
                "Edit",
                "Edit transport trips"),

            new(
                Permissions.Trips.Assign,
                "Trips",
                "Assign",
                "Assign trip resources"),

            new(
                Permissions.Trips.Start,
                "Trips",
                "Start",
                "Start transport trip"),

            new(
                Permissions.Trips.Complete,
                "Trips",
                "Complete",
                "Complete transport trip"),

            new(
                Permissions.Routes.View,
                "Routes",
                "View",
                "View routes"),

            new(
                Permissions.Routes.Create,
                "Routes",
                "Create",
                "Create routes"),

            new(
                Permissions.Routes.Edit,
                "Routes",
                "Edit",
                "Edit routes"),

            new(
                Permissions.Routes.Delete,
                "Routes",
                "Delete",
                "Delete routes"),

            new(
                Permissions.RateCards.View,
                "RateCards",
                "View",
                "View rate cards"),

            new(
                Permissions.RateCards.Create,
                "RateCards",
                "Create",
                "Create rate cards"),

            new(
                Permissions.RateCards.Edit,
                "RateCards",
                "Edit",
                "Edit rate cards"),

            new(
                Permissions.RateCards.Delete,
                "RateCards",
                "Delete",
                "Delete rate cards"),

            new(
                Permissions.Delivery.View,
                "Delivery",
                "View",
                "View delivery information"),

            new(
                Permissions.Delivery.GenerateOtp,
                "Delivery",
                "GenerateOtp",
                "Generate delivery OTP"),

            new(
                Permissions.Delivery.Confirm,
                "Delivery",
                "Confirm",
                "Confirm delivery"),

            new(
                Permissions.Delivery.FailAttempt,
                "Delivery",
                "FailAttempt",
                "Record failed delivery attempt"),

            new(
                Permissions.Delivery.Reattempt,
                "Delivery",
                "Reattempt",
                "Schedule delivery reattempt"),

            new(
                Permissions.Reports.View,
                "Reports",
                "View",
                "View reports"),

            new(
                Permissions.Reports.Export,
                "Reports",
                "Export",
                "Export reports"),

            new(
                Permissions.Settings.View,
                "Settings",
                "View",
                "View settings"),

            new(
                Permissions.Settings.Edit,
                "Settings",
                "Edit",
                "Edit settings"),

            new(
                Permissions.Settings.CompanyProfile,
                "Settings",
                "CompanyProfile",
                "Manage company profile"),

            new(
                Permissions.Settings.Numbering,
                "Settings",
                "Numbering",
                "Manage numbering configuration"),

            new(
                Permissions.Audit.View,
                "Audit",
                "View",
                "View audit logs"),

            new(
                Permissions.Notifications.View,
                "Notifications",
                "View",
                "View notifications"),

            new(
                Permissions.Notifications.Send,
                "Notifications",
                "Send",
                "Send notifications"),

            new(
                Permissions.Notifications.ManageTemplates,
                "Notifications",
                "ManageTemplates",
                "Manage notification templates"),

            new(
                Permissions.Notifications.ViewLogs,
                "Notifications",
                "ViewLogs",
                "View notification logs"),

            new(
                Permissions.Notifications.ViewAlerts,
                "Notifications",
                "ViewAlerts",
                "View system alerts"),

            new(
                Permissions.Notifications.ResolveAlerts,
                "Notifications",
                "ResolveAlerts",
                "Resolve system alerts")
        };

        foreach (var item in permissions)
        {
            var permission =
                await db.Permissions
                    .FirstOrDefaultAsync(x =>
                        x.Code == item.Code);

            if (permission == null)
            {
                permission = new Permission
                {
                    Code = item.Code,
                    Module = item.Module,
                    Action = item.Action,
                    Description = item.Description,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };

                db.Permissions.Add(permission);
            }
            else
            {
                permission.Module =
                    item.Module;

                permission.Action =
                    item.Action;

                permission.Description =
                    item.Description;

                permission.IsActive =
                    true;
            }
        }

        await db.SaveChangesAsync();
    }

    private static async Task SeedRolesAsync(
        AskTransportDbContext db)
    {
        var roles = new[]
        {
            new RoleSeed(
                "Customer",
                "Transport customer",
                true),

            new RoleSeed(
                "Operations",
                "Transport operations staff",
                true),

            new RoleSeed(
                "Finance",
                "Accounts and payment staff",
                true),

            new RoleSeed(
                "Hub Manager",
                "Hub operations manager",
                true),

            new RoleSeed(
                "Driver",
                "Transport driver",
                true),

            new RoleSeed(
                "Support",
                "Customer support staff",
                true),

            new RoleSeed(
                "Manager",
                "Transport management staff",
                true)
        };

        foreach (var item in roles)
        {
            var role =
                await db.AppRoles
                    .FirstOrDefaultAsync(x =>
                        x.Name == item.Name);

            if (role == null)
            {
                role = new AppRole
                {
                    Name = item.Name,
                    Description = item.Description,
                    IsSystemRole = item.IsSystemRole,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };

                db.AppRoles.Add(role);
            }
            else
            {
                role.Description =
                    item.Description;

                role.IsSystemRole =
                    item.IsSystemRole;

                role.IsActive =
                    true;
            }
        }

        await db.SaveChangesAsync();
    }

    private static async Task SeedRolePermissionsAsync(
        AskTransportDbContext db)
    {
        await SetRolePermissionsAsync(
            db,
            "Customer",
            new[]
            {
                Permissions.Bookings.ViewOwn,
                Permissions.Bookings.Create,
                Permissions.Bookings.Cancel,

                Permissions.Tracking.View,

                Permissions.Payments.View,
                Permissions.Payments.Create,

                Permissions.Invoices.View,

                Permissions.Documents.View,
                Permissions.Documents.Upload,

                Permissions.Notifications.View
            });

        await SetRolePermissionsAsync(
            db,
            "Operations",
            new[]
            {
                Permissions.Bookings.View,
                Permissions.Bookings.Create,
                Permissions.Bookings.Edit,
                Permissions.Bookings.Assign,
                Permissions.Bookings.UpdateStatus,

                Permissions.Tracking.View,
                Permissions.Tracking.Update,

                Permissions.Documents.View,
                Permissions.Documents.Upload,
                Permissions.Documents.UploadPod,

                Permissions.Branches.View,

                Permissions.Hubs.View,

                Permissions.Drivers.View,
                Permissions.Drivers.Assign,

                Permissions.Vehicles.View,
                Permissions.Vehicles.Assign,

                Permissions.Shipments.View,
                Permissions.Shipments.Create,
                Permissions.Shipments.Assign,
                Permissions.Shipments.UpdateStatus,

                Permissions.Trips.View,
                Permissions.Trips.Create,
                Permissions.Trips.Assign,
                Permissions.Trips.Start,
                Permissions.Trips.Complete,

                Permissions.Routes.View,

                Permissions.RateCards.View,

                Permissions.Delivery.View,
                Permissions.Delivery.GenerateOtp,
                Permissions.Delivery.Confirm,
                Permissions.Delivery.FailAttempt,
                Permissions.Delivery.Reattempt,

                Permissions.Notifications.View,
                Permissions.Notifications.Send,
                Permissions.Notifications.ViewAlerts
            });

        await SetRolePermissionsAsync(
            db,
            "Finance",
            new[]
            {
                Permissions.Bookings.View,

                Permissions.Payments.View,
                Permissions.Payments.Refund,
                Permissions.Payments.Reconcile,
                Permissions.Payments.ViewRefunds,

                Permissions.Invoices.View,
                Permissions.Invoices.Create,
                Permissions.Invoices.Email,

                Permissions.RateCards.View,

                Permissions.Reports.View,
                Permissions.Reports.Export,

                Permissions.Documents.View
            });

        await SetRolePermissionsAsync(
            db,
            "Hub Manager",
            new[]
            {
                Permissions.Bookings.View,
                Permissions.Bookings.Assign,
                Permissions.Bookings.UpdateStatus,

                Permissions.Tracking.View,
                Permissions.Tracking.Update,

                Permissions.Branches.View,

                Permissions.Hubs.View,

                Permissions.Drivers.View,
                Permissions.Drivers.Assign,

                Permissions.Vehicles.View,
                Permissions.Vehicles.Assign,

                Permissions.Shipments.View,
                Permissions.Shipments.Assign,
                Permissions.Shipments.UpdateStatus,

                Permissions.Trips.View,
                Permissions.Trips.Create,
                Permissions.Trips.Assign,
                Permissions.Trips.Start,
                Permissions.Trips.Complete,

                Permissions.Routes.View,

                Permissions.Documents.View,
                Permissions.Documents.Upload,
                Permissions.Documents.UploadPod,

                Permissions.Delivery.View,
                Permissions.Delivery.GenerateOtp,
                Permissions.Delivery.Confirm,
                Permissions.Delivery.FailAttempt,
                Permissions.Delivery.Reattempt,

                Permissions.Reports.View,

                Permissions.Notifications.View,
                Permissions.Notifications.ViewAlerts
            });

        await SetRolePermissionsAsync(
            db,
            "Driver",
            new[]
            {
                Permissions.Bookings.View,

                Permissions.Tracking.View,
                Permissions.Tracking.Update,

                Permissions.Documents.View,
                Permissions.Documents.UploadPod,

                Permissions.Shipments.View,

                Permissions.Trips.View,

                Permissions.Delivery.View,
                Permissions.Delivery.GenerateOtp,
                Permissions.Delivery.Confirm,
                Permissions.Delivery.FailAttempt,

                Permissions.Notifications.View
            });

        await SetRolePermissionsAsync(
            db,
            "Support",
            new[]
            {
                Permissions.Users.View,

                Permissions.Bookings.View,

                Permissions.Tracking.View,

                Permissions.Payments.View,

                Permissions.Invoices.View,

                Permissions.Documents.View,

                Permissions.Notifications.View,
                Permissions.Notifications.Send
            });

        await SetRolePermissionsAsync(
            db,
            "Manager",
            new[]
            {
                Permissions.Users.View,

                Permissions.Bookings.View,
                Permissions.Bookings.Create,
                Permissions.Bookings.Edit,
                Permissions.Bookings.Cancel,
                Permissions.Bookings.Assign,
                Permissions.Bookings.UpdateStatus,

                Permissions.Tracking.View,
                Permissions.Tracking.Update,

                Permissions.Payments.View,
                Permissions.Payments.ViewRefunds,

                Permissions.Invoices.View,
                Permissions.Invoices.Create,
                Permissions.Invoices.Email,

                Permissions.Documents.View,
                Permissions.Documents.Upload,
                Permissions.Documents.UploadPod,

                Permissions.Branches.View,
                Permissions.Branches.Create,
                Permissions.Branches.Edit,

                Permissions.Hubs.View,
                Permissions.Hubs.Create,
                Permissions.Hubs.Edit,

                Permissions.Drivers.View,
                Permissions.Drivers.Create,
                Permissions.Drivers.Edit,
                Permissions.Drivers.Assign,

                Permissions.Vehicles.View,
                Permissions.Vehicles.Create,
                Permissions.Vehicles.Edit,
                Permissions.Vehicles.Assign,

                Permissions.Shipments.View,
                Permissions.Shipments.Create,
                Permissions.Shipments.Edit,
                Permissions.Shipments.Assign,
                Permissions.Shipments.UpdateStatus,

                Permissions.Trips.View,
                Permissions.Trips.Create,
                Permissions.Trips.Edit,
                Permissions.Trips.Assign,
                Permissions.Trips.Start,
                Permissions.Trips.Complete,

                Permissions.Routes.View,
                Permissions.Routes.Create,
                Permissions.Routes.Edit,

                Permissions.RateCards.View,
                Permissions.RateCards.Create,
                Permissions.RateCards.Edit,

                Permissions.Delivery.View,
                Permissions.Delivery.GenerateOtp,
                Permissions.Delivery.Confirm,
                Permissions.Delivery.FailAttempt,
                Permissions.Delivery.Reattempt,

                Permissions.Reports.View,
                Permissions.Reports.Export,

                Permissions.Settings.View,

                Permissions.Notifications.View,
                Permissions.Notifications.Send,
                Permissions.Notifications.ViewAlerts
            });
    }

    private static async Task SetRolePermissionsAsync(
        AskTransportDbContext db,
        string roleName,
        IEnumerable<string> permissionCodes)
    {
        var role =
            await db.AppRoles
                .FirstOrDefaultAsync(x =>
                    x.Name == roleName);

        if (role == null)
        {
            return;
        }

        var codes =
            permissionCodes
                .Distinct(
                    StringComparer.OrdinalIgnoreCase)
                .ToList();

        var permissionIds =
            await db.Permissions
                .Where(x =>
                    codes.Contains(x.Code) &&
                    x.IsActive)
                .Select(x => x.Id)
                .ToListAsync();

        var existing =
            await db.RolePermissions
                .Where(x =>
                    x.RoleId == role.Id)
                .ToListAsync();

        var requiredIds =
            permissionIds.ToHashSet();

        var remove =
            existing
                .Where(x =>
                    !requiredIds.Contains(
                        x.PermissionId))
                .ToList();

        if (remove.Count > 0)
        {
            db.RolePermissions
                .RemoveRange(remove);
        }

        var existingIds =
            existing
                .Select(x =>
                    x.PermissionId)
                .ToHashSet();

        foreach (var permissionId
                 in permissionIds)
        {
            if (existingIds.Contains(
                permissionId))
            {
                continue;
            }

            db.RolePermissions.Add(
                new RolePermission
                {
                    RoleId =
                        role.Id,

                    PermissionId =
                        permissionId,

                    CreatedAt =
                        DateTime.UtcNow
                });
        }

        await db.SaveChangesAsync();
    }

    private static async Task AssignExistingUsersAsync(
        AskTransportDbContext db)
    {
        var customerRole =
            await db.AppRoles
                .FirstOrDefaultAsync(x =>
                    x.Name == "Customer" &&
                    x.IsActive);

        if (customerRole == null)
        {
            return;
        }

        var users =
            await db.Users
                .Where(x =>
                    x.Role != UserRole.Admin)
                .Select(x =>
                    x.Id)
                .ToListAsync();

        foreach (var userId in users)
        {
            var hasRole =
                await db.UserRoleAssignments
                    .AnyAsync(x =>
                        x.UserId == userId);

            if (hasRole)
            {
                continue;
            }

            db.UserRoleAssignments.Add(
                new UserRoleAssignment
                {
                    UserId =
                        userId,

                    RoleId =
                        customerRole.Id,

                    CreatedAt =
                        DateTime.UtcNow
                });
        }

        await db.SaveChangesAsync();
    }

    private static async Task SeedSystemSettingsAsync(
        AskTransportDbContext db)
    {
        var defaults =
            new[]
            {
                new SettingSeed(
                    "Numbering.BookingPrefix",
                    "ASK",
                    "Numbering",
                    "Booking number prefix"),

                new SettingSeed(
                    "Numbering.ShipmentPrefix",
                    "SHP",
                    "Numbering",
                    "Shipment number prefix"),

                new SettingSeed(
                    "Numbering.TripPrefix",
                    "TRP",
                    "Numbering",
                    "Trip number prefix"),

                new SettingSeed(
                    "Numbering.InvoicePrefix",
                    "INV",
                    "Numbering",
                    "Invoice number prefix"),

                new SettingSeed(
                    "Numbering.RefundPrefix",
                    "REF",
                    "Numbering",
                    "Refund number prefix"),

                new SettingSeed(
                    "Tax.DefaultGstPercent",
                    "18",
                    "Tax",
                    "Default GST percentage"),

                new SettingSeed(
                    "Pricing.VolumetricDivisor",
                    "5000",
                    "Pricing",
                    "Default volumetric weight divisor"),

                new SettingSeed(
                    "Delivery.OtpExpiryMinutes",
                    "10",
                    "Delivery",
                    "Delivery OTP expiry time"),

                new SettingSeed(
                    "Delivery.MaxOtpAttempts",
                    "5",
                    "Delivery",
                    "Maximum delivery OTP attempts"),

                new SettingSeed(
                    "Booking.AllowCancellation",
                    "true",
                    "Booking",
                    "Allow customer booking cancellation")
            };

        foreach (var item in defaults)
        {
            var setting =
                await db.SystemSettings
                    .FirstOrDefaultAsync(x =>
                        x.Key == item.Key);

            if (setting == null)
            {
                db.SystemSettings.Add(
                    new SystemSetting
                    {
                        Key =
                            item.Key,

                        Value =
                            item.Value,

                        Group =
                            item.Group,

                        Description =
                            item.Description,

                        IsPublic =
                            false,

                        CreatedAt =
                            DateTime.UtcNow
                    });
            }
        }

        await db.SaveChangesAsync();
    }

    private static async Task SeedNotificationTemplatesAsync(
        AskTransportDbContext db)
    {
        var templates =
            new[]
            {
                new TemplateSeed(
                    "BOOKING_CREATED",
                    "Booking Created",
                    "Email",
                    "Booking {{BookingNumber}} Created",
                    "<h2>Booking Created</h2><p>Your booking {{BookingNumber}} has been created successfully.</p>"),

                new TemplateSeed(
                    "PAYMENT_SUCCESS",
                    "Payment Success",
                    "Email",
                    "Payment Successful - {{BookingNumber}}",
                    "<h2>Payment Successful</h2><p>Payment for booking {{BookingNumber}} has been received successfully.</p>"),

                new TemplateSeed(
                    "SHIPMENT_CREATED",
                    "Shipment Created",
                    "Email",
                    "Shipment Created - {{BookingNumber}}",
                    "<h2>Shipment Created</h2><p>Your shipment {{ShipmentNumber}} for booking {{BookingNumber}} has been created.</p>"),

                new TemplateSeed(
                    "SHIPMENT_IN_TRANSIT",
                    "Shipment In Transit",
                    "Email",
                    "Shipment In Transit - {{BookingNumber}}",
                    "<h2>Shipment In Transit</h2><p>Your booking {{BookingNumber}} is now in transit.</p>"),

                new TemplateSeed(
                    "DELIVERY_OTP",
                    "Delivery OTP",
                    "Email",
                    "Delivery OTP for {{BookingNumber}}",
                    "<h2>Delivery OTP</h2><p>Your OTP is <strong>{{Otp}}</strong>.</p><p>Do not share this OTP before receiving your shipment.</p>"),

                new TemplateSeed(
                    "DELIVERY_FAILED",
                    "Delivery Attempt Failed",
                    "Email",
                    "Delivery Attempt - {{BookingNumber}}",
                    "<h2>Delivery Attempt Failed</h2><p>Delivery attempt for booking {{BookingNumber}} was unsuccessful.</p><p>{{Reason}}</p>"),

                new TemplateSeed(
                    "SHIPMENT_DELIVERED",
                    "Shipment Delivered",
                    "Email",
                    "Booking {{BookingNumber}} Delivered",
                    "<h2>Delivered</h2><p>Your shipment for booking {{BookingNumber}} has been delivered successfully.</p>"),

                new TemplateSeed(
                    "REFUND_PROCESSED",
                    "Refund Processed",
                    "Email",
                    "Refund Processed - {{BookingNumber}}",
                    "<h2>Refund Processed</h2><p>Your refund of ₹{{Amount}} for booking {{BookingNumber}} has been processed.</p>")
            };

        foreach (var item in templates)
        {
            var template =
                await db.NotificationTemplates
                    .FirstOrDefaultAsync(x =>
                        x.Code == item.Code);

            if (template == null)
            {
                db.NotificationTemplates.Add(
                    new NotificationTemplate
                    {
                        Code =
                            item.Code,

                        Name =
                            item.Name,

                        Channel =
                            item.Channel,

                        Subject =
                            item.Subject,

                        Body =
                            item.Body,

                        IsActive =
                            true,

                        CreatedAt =
                            DateTime.UtcNow
                    });
            }
        }

        await db.SaveChangesAsync();
    }

    private sealed record PermissionSeed(
        string Code,
        string Module,
        string Action,
        string Description);

    private sealed record RoleSeed(
        string Name,
        string Description,
        bool IsSystemRole);

    private sealed record SettingSeed(
        string Key,
        string Value,
        string Group,
        string Description);

    private sealed record TemplateSeed(
        string Code,
        string Name,
        string Channel,
        string Subject,
        string Body);
}