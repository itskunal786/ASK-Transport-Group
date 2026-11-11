using ASK.Group.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ASK.Group.Api.Controllers;

[ApiController]
[Route("api/client/invoices")]
[Authorize]
public sealed class ClientInvoiceController : ControllerBase
{
    private readonly ClientInvoiceService _invoiceService;

    public ClientInvoiceController(
        ClientInvoiceService invoiceService)
    {
        _invoiceService = invoiceService;
    }


    [HttpGet]
    public async Task<IActionResult> GetMyInvoices(
        int page = 1,
        int pageSize = 10,
        string? status = null,
        CancellationToken cancellationToken = default)
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


        var result =
            await _invoiceService.GetMyInvoicesAsync(
                userId.Value,
                page,
                pageSize,
                status,
                cancellationToken);


        return Ok(new
        {
            success = true,
            message = "Invoices loaded successfully.",
            data = result
        });
    }


    [HttpGet("{invoiceId:int}")]
    public async Task<IActionResult> GetInvoice(
        int invoiceId,
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


        var invoice =
            await _invoiceService.GetInvoiceAsync(
                userId.Value,
                invoiceId,
                cancellationToken);


        if (invoice == null)
        {
            return NotFound(new
            {
                success = false,
                message = "Invoice not found."
            });
        }


        return Ok(new
        {
            success = true,
            message = "Invoice loaded successfully.",
            data = invoice
        });
    }


    private int? GetUserId()
    {
        var value =
            User.FindFirstValue(
                ClaimTypes.NameIdentifier);

        if (!int.TryParse(value, out var userId))
        {
            return null;
        }

        return userId;
    }
}