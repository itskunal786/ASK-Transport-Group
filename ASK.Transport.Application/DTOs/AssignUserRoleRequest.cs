using System.ComponentModel.DataAnnotations;

namespace ASK.Group.Api.DTOs;

public class AssignUserRoleRequest
{
    [Required]
    public int RoleId { get; set; }
}