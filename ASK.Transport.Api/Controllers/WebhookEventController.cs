using ASK.Group.Api.Authorization;
using ASK.Group.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ASK.Group.Api.Controllers;

[ApiController]
[Route("api/webhook-events")]
[Authorize]
public class WebhookEventController : ControllerBase
{
    private readonly WebhookService _webhookService;

    public WebhookEventController(
        WebhookService webhookService)
    {
        _webhookService =
            webhookService;
    }

    [HttpPost("test")]
    [HasPermission(Permissions.Settings.Edit)]
    public async Task<IActionResult> TestWebhook(
        TestWebhookEventRequest request,
        CancellationToken cancellationToken)
    {
        await _webhookService
            .PublishEventAsync(
                request.EventName,
                request.ReferenceId,
                request.Data ??
                new
                {
                    message =
                        "ASK GROUP webhook test"
                },
                cancellationToken);

        return Ok(new
        {
            success = true,
            message =
                "Webhook event published"
        });
    }
}

public class TestWebhookEventRequest
{
    public string EventName { get; set; } =
        "test.event";

    public string ReferenceId { get; set; } =
        Guid.NewGuid().ToString();

    public object? Data { get; set; }
}