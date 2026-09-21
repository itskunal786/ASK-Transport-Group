using Microsoft.AspNetCore.Authorization;

namespace ASK.Group.Api.Authorization;

public class HasPermissionAttribute : AuthorizeAttribute
{
    public const string PolicyPrefix = "Permission:";

    public HasPermissionAttribute(string permission)
    {
        Policy = $"{PolicyPrefix}{permission}";
    }
}