namespace ASK.Group.Api.Models;

public class UserPermission
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public AppUser? User { get; set; }

    public int PermissionId { get; set; }

    public Permission? Permission { get; set; }

    public bool IsGranted { get; set; }

    public DateTime CreatedAt { get; set; } =
        DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }
}