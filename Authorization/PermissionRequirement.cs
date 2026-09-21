using Microsoft.AspNetCore.Authorization;

namespace ASK.Group.Api.Authorization;

public class PermissionRequirement
    : IAuthorizationRequirement
{
    public string Permission { get; }

    public PermissionRequirement(
        string permission)
    {
        Permission = permission;
    }
}