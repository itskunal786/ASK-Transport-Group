namespace ASK.Group.Api.Middleware;

public class SecurityHeadersMiddleware
{
    private readonly RequestDelegate _next;

    public SecurityHeadersMiddleware(
        RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(
        HttpContext context)
    {
        context.Response.OnStarting(() =>
        {
            var headers =
                context.Response.Headers;

            headers[
                "X-Content-Type-Options"] =
                "nosniff";

            headers[
                "X-Frame-Options"] =
                "DENY";

            headers[
                "Referrer-Policy"] =
                "no-referrer";

            headers[
                "Permissions-Policy"] =
                "camera=(), microphone=(), geolocation=()";

            headers[
                "X-Permitted-Cross-Domain-Policies"] =
                "none";

            if (context.Request.IsHttps)
            {
                headers[
                    "Strict-Transport-Security"] =
                    "max-age=31536000; includeSubDomains";
            }

            return Task.CompletedTask;
        });

        await _next(context);
    }
}