using System.Security.Claims;

namespace ASK.Group.Api.Services;

public class CurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(
        IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor =
            httpContextAccessor;
    }

    public int? GetUserId()
    {
        var value =
            _httpContextAccessor
                .HttpContext?
                .User
                .FindFirstValue(
                    ClaimTypes.NameIdentifier);

        return int.TryParse(
            value,
            out var userId)
            ? userId
            : null;
    }

    public bool IsAuthenticated()
    {
        return _httpContextAccessor
            .HttpContext?
            .User?
            .Identity?
            .IsAuthenticated
            ?? false;
    }
}