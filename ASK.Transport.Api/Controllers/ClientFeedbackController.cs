using ASK.Group.Api.DTOs;
using ASK.Group.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ASK.Group.Api.Controllers;

[ApiController]
[Route("api/client/feedback")]
[Authorize]
public sealed class ClientFeedbackController : ControllerBase
{
    private readonly DeliveryFeedbackService _service;

    public ClientFeedbackController(
        DeliveryFeedbackService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetMyFeedback(
        CancellationToken cancellationToken)
    {
        var userId = GetUserId();

        if (userId == null)
            return Unauthorized();

        var data = await _service.GetMyFeedbackAsync(
            userId.Value,
            cancellationToken);

        return Ok(new
        {
            success = true,
            data
        });
    }

    [HttpPost("{bookingNumber}")]
    public async Task<IActionResult> Create(
        string bookingNumber,
        CreateDeliveryFeedbackRequest request,
        CancellationToken cancellationToken)
    {
        var userId = GetUserId();

        if (userId == null)
            return Unauthorized();

        try
        {
            var data = await _service.CreateAsync(
                userId.Value,
                bookingNumber,
                request,
                cancellationToken);

            return Ok(new
            {
                success = true,
                message = "Feedback submitted successfully.",
                data
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new
            {
                success = false,
                message = ex.Message
            });
        }
    }

    private int? GetUserId()
    {
        var value = User.FindFirstValue(
            ClaimTypes.NameIdentifier);

        return int.TryParse(value, out var userId)
            ? userId
            : null;
    }
}
