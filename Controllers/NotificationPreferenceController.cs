using ASK.Group.Api.DTOs;
using ASK.Group.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ASK.Group.Api.Controllers;

[ApiController]
[Route("api/client/notification-preferences")]
[Authorize]
public sealed class NotificationPreferenceController
    : ControllerBase
{
    private readonly NotificationPreferenceService
        _service;

    public NotificationPreferenceController(
        NotificationPreferenceService service)
    {
        _service = service;
    }


    [HttpGet]
    public async Task<IActionResult> Get(
        CancellationToken cancellationToken)
    {
        var userId = GetUserId();

        if (userId == null)
        {
            return Unauthorized(new
            {
                success = false,
                message = "Invalid user."
            });
        }


        var data =
            await _service.GetAsync(
                userId.Value,
                cancellationToken);


        return Ok(new
        {
            success = true,
            message =
                "Notification preferences loaded successfully.",
            data
        });
    }


    [HttpPut]
    public async Task<IActionResult> Update(
        UpdateNotificationPreferenceRequest request,
        CancellationToken cancellationToken)
    {
        var userId = GetUserId();

        if (userId == null)
        {
            return Unauthorized(new
            {
                success = false,
                message = "Invalid user."
            });
        }


        var data =
            await _service.UpdateAsync(
                userId.Value,
                request,
                cancellationToken);


        return Ok(new
        {
            success = true,
            message =
                "Notification preferences updated successfully.",
            data
        });
    }


    private int? GetUserId()
    {
        var value =
            User.FindFirstValue(
                ClaimTypes.NameIdentifier);

        return int.TryParse(
            value,
            out var userId)
                ? userId
                : null;
    }
}