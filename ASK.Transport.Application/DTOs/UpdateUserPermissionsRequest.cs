using System.ComponentModel.DataAnnotations;

namespace ASK.Group.Api.DTOs;

public class UpdateUserPermissionsRequest
{
    [Required]
    public List<UserPermissionRequest> Permissions
    {
        get;
        set;
    } = new();
}