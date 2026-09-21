using Microsoft.EntityFrameworkCore;
using System.Net;
using System.Text.Json;

namespace ASK.Group.Api.Middleware;

public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;
    private readonly IWebHostEnvironment _environment;

    public GlobalExceptionMiddleware(
        RequestDelegate next,
        ILogger<GlobalExceptionMiddleware> logger,
        IWebHostEnvironment environment)
    {
        _next = next;
        _logger = logger;
        _environment = environment;
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
            await WriteErrorAsync(
                context,
                ex,
                HttpStatusCode.Conflict,
                "CONCURRENCY_CONFLICT",
                "This record was modified by another user. Refresh the data and try again.");
        }
        catch (DbUpdateException ex)
        {
            await WriteErrorAsync(
                context,
                ex,
                HttpStatusCode.Conflict,
                "DATABASE_CONFLICT",
                "The request conflicts with existing database data.");
        }
        catch (UnauthorizedAccessException ex)
        {
            await WriteErrorAsync(
                context,
                ex,
                HttpStatusCode.Unauthorized,
                "UNAUTHORIZED",
                "You are not authorized to perform this action.");
        }
        catch (KeyNotFoundException ex)
        {
            await WriteErrorAsync(
                context,
                ex,
                HttpStatusCode.NotFound,
                "NOT_FOUND",
                ex.Message);
        }
        catch (ArgumentException ex)
        {
            await WriteErrorAsync(
                context,
                ex,
                HttpStatusCode.BadRequest,
                "INVALID_ARGUMENT",
                ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            await WriteErrorAsync(
                context,
                ex,
                HttpStatusCode.BadRequest,
                "INVALID_OPERATION",
                ex.Message);
        }
        catch (Exception ex)
        {
            await WriteErrorAsync(
                context,
                ex,
                HttpStatusCode.InternalServerError,
                "INTERNAL_SERVER_ERROR",
                "An unexpected server error occurred.");
        }
    }

    private async Task WriteErrorAsync(
        HttpContext context,
        Exception exception,
        HttpStatusCode statusCode,
        string code,
        string message)
    {
        var correlationId =
            context.TraceIdentifier;

        if ((int)statusCode >= 500)
        {
            _logger.LogError(
                exception,
                "Server error. CorrelationId: {CorrelationId}",
                correlationId);
        }
        else
        {
            _logger.LogWarning(
                exception,
                "Request failed. CorrelationId: {CorrelationId}",
                correlationId);
        }

        if (context.Response.HasStarted)
        {
            throw exception;
        }

        context.Response.Clear();

        context.Response.StatusCode =
            (int)statusCode;

        context.Response.ContentType =
            "application/json";

        var response =
            new
            {
                success = false,

                message,

                code,

                statusCode =
                    (int)statusCode,

                correlationId,

                timestamp =
                    DateTime.UtcNow,

                detail =
                    _environment.IsDevelopment()
                        ? exception.Message
                        : null
            };

        var json =
            JsonSerializer.Serialize(
                response,
                new JsonSerializerOptions
                {
                    PropertyNamingPolicy =
                        JsonNamingPolicy.CamelCase
                });

        await context.Response
            .WriteAsync(json);
    }
}