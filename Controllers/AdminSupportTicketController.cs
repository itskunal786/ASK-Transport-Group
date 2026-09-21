using ASK.Group.Api.DTOs;
using ASK.Group.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ASK.Group.Api.Controllers;

[ApiController]
[Route("api/admin/support")]
[Authorize(Roles = "Admin")]
public sealed class AdminSupportTicketController
    : ControllerBase
{
    private readonly AdminSupportTicketService _service;

    public AdminSupportTicketController(
        AdminSupportTicketService service)
    {
        _service = service;
    }


    [HttpGet]
    public async Task<IActionResult> GetTickets(
        int page = 1,
        int pageSize = 10,
        string? status = null,
        string? priority = null,
        CancellationToken cancellationToken = default)
    {
        var data =
            await _service.GetTicketsAsync(
                page,
                pageSize,
                status,
                priority,
                cancellationToken);


        return Ok(new
        {
            success = true,

            message =
                "Support tickets loaded successfully.",

            data
        });
    }


    [HttpGet("{ticketNumber}")]
    public async Task<IActionResult> GetTicket(
        string ticketNumber,
        CancellationToken cancellationToken)
    {
        var data =
            await _service.GetTicketAsync(
                ticketNumber,
                cancellationToken);


        if (data == null)
        {
            return NotFound(new
            {
                success = false,

                message =
                    "Support ticket not found."
            });
        }


        return Ok(new
        {
            success = true,

            message =
                "Support ticket loaded successfully.",

            data
        });
    }


    [HttpPost("{ticketNumber}/reply")]
    public async Task<IActionResult> Reply(
        string ticketNumber,
        [FromBody] AdminSupportTicketReplyRequest request,
        CancellationToken cancellationToken)
    {
        var adminUserId =
            GetUserId();


        if (adminUserId == null)
        {
            return Unauthorized(new
            {
                success = false,

                message =
                    "Invalid admin user."
            });
        }


        var success =
            await _service.AddReplyAsync(
                adminUserId.Value,
                ticketNumber,
                request.Message,
                cancellationToken);


        if (!success)
        {
            return BadRequest(new
            {
                success = false,

                message =
                    "Ticket not found, closed, or reply is invalid."
            });
        }


        return Ok(new
        {
            success = true,

            message =
                "Admin reply added successfully."
        });
    }


    [HttpPut("{ticketNumber}/status")]
    public async Task<IActionResult> UpdateStatus(
        string ticketNumber,
        [FromBody] UpdateSupportTicketStatusRequest request,
        CancellationToken cancellationToken)
    {
        var success =
            await _service.UpdateStatusAsync(
                ticketNumber,
                request.Status,
                cancellationToken);


        if (!success)
        {
            return BadRequest(new
            {
                success = false,

                message =
                    "Ticket not found or status is invalid."
            });
        }


        return Ok(new
        {
            success = true,

            message =
                "Ticket status updated successfully."
        });
    }


    [HttpPut("{ticketNumber}/priority")]
    public async Task<IActionResult> UpdatePriority(
        string ticketNumber,
        [FromBody] UpdateSupportTicketPriorityRequest request,
        CancellationToken cancellationToken)
    {
        var success =
            await _service.UpdatePriorityAsync(
                ticketNumber,
                request.Priority,
                cancellationToken);


        if (!success)
        {
            return BadRequest(new
            {
                success = false,

                message =
                    "Ticket not found or priority is invalid."
            });
        }


        return Ok(new
        {
            success = true,

            message =
                "Ticket priority updated successfully."
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