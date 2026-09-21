using System.ComponentModel.DataAnnotations;

namespace ASK.Group.Api.DTOs;

public class UserPermissionRequest
{
    [Range(1, int.MaxValue)]
    public int PermissionId { get; set; }

    public bool IsGranted { get; set; }
}