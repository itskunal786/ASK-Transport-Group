using ASK.Group.Api.DTOs;
using ASK.Group.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ASK.Group.Api.Controllers;

[ApiController]
[Route("api/client/support")]
[Authorize]
public sealed class ClientSupportTicketController : ControllerBase
{
    private readonly ClientSupportTicketService _service;

    public ClientSupportTicketController(
        ClientSupportTicketService service)
    {
        _service = service;
    }


    [HttpGet]
    public async Task<IActionResult> GetMyTickets(
        int page = 1,
        int pageSize = 10,
        string? status = null,
        CancellationToken cancellationToken = default)
    {
        var userId = GetUserId();

        if (userId == null)
        {
            return InvalidUser();
        }


        var data =
            await _service.GetMyTicketsAsync(
                userId.Value,
                page,
                pageSize,
                status,
                cancellationToken);


        return Ok(new
        {
            success = true,
            message = "Support tickets loaded successfully.",
            data
        });
    }


    [HttpGet("{ticketNumber}")]
    public async Task<IActionResult> GetTicket(
        string ticketNumber,
        CancellationToken cancellationToken)
    {
        var userId = GetUserId();

        if (userId == null)
        {
            return InvalidUser();
        }


        var data =
            await _service.GetTicketAsync(
                userId.Value,
                ticketNumber,
                cancellationToken);


        if (data == null)
        {
            return NotFound(new
            {
                success = false,
                message = "Support ticket not found."
            });
        }


        return Ok(new
        {
            success = true,
            message = "Support ticket loaded successfully.",
            data
        });
    }


    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] CreateSupportTicketRequest request,
        CancellationToken cancellationToken)
    {
        var userId = GetUserId();

        if (userId == null)
        {
            return InvalidUser();
        }


        var data =
            await _service.CreateAsync(
                userId.Value,
                request,
                cancellationToken);


        return Ok(new
        {
            success = true,
            message = "Support ticket created successfully.",
            data
        });
    }


    [HttpPost("{ticketNumber}/reply")]
    public async Task<IActionResult> Reply(
        string ticketNumber,
        [FromBody] AddSupportTicketReplyRequest request,
        CancellationToken cancellationToken)
    {
        var userId = GetUserId();

        if (userId == null)
        {
            return InvalidUser();
        }


        var success =
            await _service.AddReplyAsync(
                userId.Value,
                ticketNumber,
                request.Message,
                cancellationToken);


        if (!success)
        {
            return BadRequest(new
            {
                success = false,
                message =
                    "Ticket not found or ticket is closed."
            });
        }


        return Ok(new
        {
            success = true,
            message = "Reply added successfully."
        });
    }


    [HttpPut("{ticketNumber}/close")]
    public async Task<IActionResult> Close(
        string ticketNumber,
        CancellationToken cancellationToken)
    {
        var userId = GetUserId();

        if (userId == null)
        {
            return InvalidUser();
        }


        var success =
            await _service.CloseAsync(
                userId.Value,
                ticketNumber,
                cancellationToken);


        if (!success)
        {
            return NotFound(new
            {
                success = false,
                message = "Support ticket not found."
            });
        }


        return Ok(new
        {
            success = true,
            message = "Support ticket closed successfully."
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