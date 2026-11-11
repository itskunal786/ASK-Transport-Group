namespace ASK.Group.Api.Models;

public class UserRoleAssignment
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public AppUser? User { get; set; }

    public int RoleId { get; set; }

    public AppRole? Role { get; set; }

    public DateTime CreatedAt { get; set; } =
        DateTime.UtcNow;
}