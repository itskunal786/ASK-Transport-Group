using System.ComponentModel.DataAnnotations;

namespace ASK.Group.Api.DTOs;

public class UpdateUserRolesRequest
{
    [Required]
    public List<int> RoleIds { get; set; } = new();
}