using ASK.Group.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ASK.Group.Api.Controllers;

[ApiController]
[Route("api/client/documents")]
[Authorize]
public sealed class ClientDocumentController : ControllerBase
{
    private readonly ClientDocumentService _service;

    public ClientDocumentController(
        ClientDocumentService service)
    {
        _service = service;
    }


    [HttpGet]
    public async Task<IActionResult> GetAll(
        int page = 1,
        int pageSize = 10,
        string? bookingNumber = null,
        string? documentType = null,
        CancellationToken cancellationToken = default)
    {
        var userId = GetUserId();

        if (userId == null)
        {
            return InvalidUser();
        }


        var data =
            await _service.GetMyDocumentsAsync(
                userId.Value,
                page,
                pageSize,
                bookingNumber,
                documentType,
                cancellationToken);


        return Ok(new
        {
            success = true,
            message = "Documents loaded successfully.",
            data
        });
    }


    [HttpGet("{documentId:int}")]
    public async Task<IActionResult> GetById(
        int documentId,
        CancellationToken cancellationToken)
    {
        var userId = GetUserId();

        if (userId == null)
        {
            return InvalidUser();
        }


        var data =
            await _service.GetDocumentAsync(
                userId.Value,
                documentId,
                cancellationToken);


        if (data == null)
        {
            return NotFound(new
            {
                success = false,
                message = "Document not found."
            });
        }


        return Ok(new
        {
            success = true,
            message = "Document loaded successfully.",
            data
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