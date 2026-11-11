using System.ComponentModel.DataAnnotations;

namespace ASK.Group.Api.DTOs;

public class UpdateRolePermissionsRequest
{
    [Required]
    public List<int> PermissionIds { get; set; }
        = new();
}