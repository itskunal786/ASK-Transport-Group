using System.ComponentModel.DataAnnotations;

namespace ASK.Group.Api.DTOs;

public class SetUserPermissionRequest
{
    [Required]
    public int PermissionId { get; set; }

    public bool IsGranted { get; set; }
}