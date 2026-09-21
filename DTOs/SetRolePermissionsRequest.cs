namespace ASK.Group.Api.DTOs;

public class SetRolePermissionsRequest
{
    public List<int> PermissionIds { get; set; } =
        new();
}