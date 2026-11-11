namespace ASK.Group.Api.DTOs;

public class BackendReadinessResponse
{
    public bool IsReady { get; set; }

    public string Status { get; set; } =
        string.Empty;

    public bool DatabaseConnected { get; set; }

    public bool AdminExists { get; set; }

    public bool PermissionsSeeded { get; set; }

    public bool RolesSeeded { get; set; }

    public bool CustomerRoleExists { get; set; }

    public bool NotificationTemplatesSeeded { get; set; }

    public int UserCount { get; set; }

    public int RoleCount { get; set; }

    public int PermissionCount { get; set; }

    public int BookingCount { get; set; }

    public int ShipmentCount { get; set; }

    public int DriverCount { get; set; }

    public int VehicleCount { get; set; }

    public DateTime CheckedAt { get; set; } =
        DateTime.UtcNow;

    public List<string> Issues { get; set; } =
        new();
}