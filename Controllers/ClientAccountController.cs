using ASK.Group.Api.DTOs;
using ASK.Group.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ASK.Group.Api.Controllers;

[ApiController]
[Route("api/client/account")]
[Authorize]
public sealed class ClientAccountController :
    ControllerBase
{
    private readonly ClientAccountService _service;
    private readonly AuditService _auditService;

    public ClientAccountController(
        ClientAccountService service,
        AuditService auditService)
    {
        _service = service;
        _auditService = auditService;
    }

    [HttpPost("deactivate")]
    public async Task<IActionResult> Deactivate(
        DeactivateAccountRequest request)
    {
        var userIdValue =
            User.FindFirstValue(
                ClaimTypes.NameIdentifier);

        if (!int.TryParse(
            userIdValue,
            out var userId))
        {
            return Unauthorized(new
            {
                message = "Invalid user"
            });
        }

        try
        {
            await _service.DeactivateAsync(
                userId,
                request);

            var email =
                User.FindFirstValue(
                    ClaimTypes.Email);

            await _auditService.LogAsync(
                "ACCOUNT_DEACTIVATED",
                "User deactivated account",
                userId,
                email);

            return Ok(new
            {
                message =
                    "Account deactivated successfully"
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
}