using ASK.Group.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ASK.Group.Api.Controllers;

[ApiController]
[Route("api/client/notifications")]
[Authorize]
public sealed class ClientNotificationController : ControllerBase
{
    private readonly ClientNotificationService _service;

    public ClientNotificationController(
        ClientNotificationService service)
    {
        _service = service;
    }


    [HttpGet]
    public async Task<IActionResult> GetAll(
        int page = 1,
        int pageSize = 10,
        bool? isRead = null,
        CancellationToken cancellationToken = default)
    {
        var userId = GetUserId();

        if (userId == null)
        {
            return InvalidUser();
        }


        var data =
            await _service.GetMyNotificationsAsync(
                userId.Value,
                page,
                pageSize,
                isRead,
                cancellationToken);


        return Ok(new
        {
            success = true,
            message = "Notifications loaded successfully.",
            data
        });
    }


    [HttpGet("{notificationId:int}")]
    public async Task<IActionResult> GetById(
        int notificationId,
        CancellationToken cancellationToken)
    {
        var userId = GetUserId();

        if (userId == null)
        {
            return InvalidUser();
        }


        var data =
            await _service.GetNotificationAsync(
                userId.Value,
                notificationId,
                cancellationToken);


        if (data == null)
        {
            return NotFound(new
            {
                success = false,
                message = "Notification not found."
            });
        }


        return Ok(new
        {
            success = true,
            message = "Notification loaded successfully.",
            data
        });
    }


    [HttpPut("{notificationId:int}/read")]
    public async Task<IActionResult> MarkAsRead(
        int notificationId,
        CancellationToken cancellationToken)
    {
        var userId = GetUserId();

        if (userId == null)
        {
            return InvalidUser();
        }


        var success =
            await _service.MarkAsReadAsync(
                userId.Value,
                notificationId,
                cancellationToken);


        if (!success)
        {
            return NotFound(new
            {
                success = false,
                message = "Notification not found."
            });
        }


        return Ok(new
        {
            success = true,
            message = "Notification marked as read."
        });
    }


    [HttpPut("read-all")]
    public async Task<IActionResult> MarkAllAsRead(
        CancellationToken cancellationToken)
    {
        var userId = GetUserId();

        if (userId == null)
        {
            return InvalidUser();
        }


        var count =
            await _service.MarkAllAsReadAsync(
                userId.Value,
                cancellationToken);


        return Ok(new
        {
            success = true,
            message = "Notifications marked as read.",
            data = new
            {
                updatedCount = count
            }
        });
    }


    private int? GetUserId()
    {
        var value =
            User.FindFirstValue(
                ClaimTypes.NameIdentifier);

        return int.TryParse(value, out var userId)
            ? userId
            : null;
    }


    private IActionResult InvalidUser()
    {
        return Unauthorized(new
        {
            success = false,
            message = "Invalid user."
        });
    }
}