using ASK.Group.Api.DTOs;
using ASK.Group.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ASK.Group.Api.Controllers;

[ApiController]
[Route("api/client/contacts")]
[Authorize]
public sealed class ClientContactController :
    ControllerBase
{
    private readonly ClientContactService _service;

    public ClientContactController(
        ClientContactService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? type,
        [FromQuery] string? search,
        CancellationToken cancellationToken)
    {
        var userId = GetUserId();

        if (userId == null)
        {
            return Unauthorized();
        }

        var result =
            await _service.GetAllAsync(
                userId.Value,
                type,
                search,
                cancellationToken);

        return Ok(result);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(
        int id,
        CancellationToken cancellationToken)
    {
        var userId = GetUserId();

        if (userId == null)
        {
            return Unauthorized();
        }

        var result =
            await _service.GetAsync(
                userId.Value,
                id,
                cancellationToken);

        if (result == null)
        {
            return NotFound(new
            {
                message =
                    "Contact not found"
            });
        }

        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create(
        SaveContactRequest request,
        CancellationToken cancellationToken)
    {
        var userId = GetUserId();

        if (userId == null)
        {
            return Unauthorized();
        }

        try
        {
            var result =
                await _service.CreateAsync(
                    userId.Value,
                    request,
                    cancellationToken);

            return Ok(new
            {
                message =
                    "Contact saved successfully",

                contact = result
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(
        int id,
        SaveContactRequest request,
        CancellationToken cancellationToken)
    {
        var userId = GetUserId();

        if (userId == null)
        {
            return Unauthorized();
        }

        try
        {
            var result =
                await _service.UpdateAsync(
                    userId.Value,
                    id,
                    request,
                    cancellationToken);

            if (result == null)
            {
                return NotFound(new
                {
                    message =
                        "Contact not found"
                });
            }

            return Ok(new
            {
                message =
                    "Contact updated successfully",

                contact = result
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(
        int id,
        CancellationToken cancellationToken)
    {
        var userId = GetUserId();

        if (userId == null)
        {
            return Unauthorized();
        }

        var deleted =
            await _service.DeleteAsync(
                userId.Value,
                id,
                cancellationToken);

        if (!deleted)
        {
            return NotFound(new
            {
                message =
                    "Contact not found"
            });
        }

        return Ok(new
        {
            message =
                "Contact deleted successfully"
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