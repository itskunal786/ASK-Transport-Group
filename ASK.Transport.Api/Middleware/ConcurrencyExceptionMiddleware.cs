using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace ASK.Group.Api.Middleware;

public class ConcurrencyExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ConcurrencyExceptionMiddleware> _logger;

    public ConcurrencyExceptionMiddleware(
        RequestDelegate next,
        ILogger<ConcurrencyExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(
        HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (DbUpdateConcurrencyException ex)
        {
            _logger.LogWarning(
                ex,
                "Concurrency conflict. TraceId: {TraceId}",
                context.TraceIdentifier);

            context.Response.StatusCode =
                StatusCodes.Status409Conflict;

            context.Response.ContentType =
                "application/json";

            var response = new
            {
                success = false,
                message =
                    "This record was modified by another user. Refresh the data and try again.",
                code =
                    "CONCURRENCY_CONFLICT",
                correlationId =
                    context.TraceIdentifier,
                timestamp =
                    DateTime.UtcNow
            };

            await context.Response.WriteAsync(
                JsonSerializer.Serialize(response));
        }
    }
}