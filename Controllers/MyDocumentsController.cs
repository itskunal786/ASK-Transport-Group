using ASK.Group.Api.Authorization;
using ASK.Group.Api.Data;
using ASK.Group.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace ASK.Group.Api.Controllers;

[ApiController]
[Route("api/my/documents")]
public class MyDocumentsController
    : ControllerBase
{
    private readonly AskTransportDbContext _db;
    private readonly OwnershipService _ownershipService;

    public MyDocumentsController(
        AskTransportDbContext db,
        OwnershipService ownershipService)
    {
        _db = db;
        _ownershipService =
            ownershipService;
    }

    [HttpGet("booking/{bookingId:int}")]
    [HasPermission(
        Permissions.Documents.View)]
    public async Task<IActionResult> GetForBooking(
        int bookingId)
    {
        var userId =
            GetCurrentUserId();

        if (userId == null)
        {
            return Unauthorized();
        }

        var allowed =
            await _ownershipService
                .CanAccessBookingAsync(
                    userId.Value,
                    bookingId);

        if (!allowed)
        {
            return Forbid();
        }

        var documents =
            await _db.BookingDocuments
                .AsNoTracking()
                .Where(x =>
                    x.BookingId ==
                    bookingId)
                .OrderByDescending(x =>
                    x.CreatedAt)
                .ToListAsync();

        return Ok(documents);
    }

    [HttpGet("{documentId:int}")]
    [HasPermission(
        Permissions.Documents.View)]
    public async Task<IActionResult> Get(
        int documentId)
    {
        var userId =
            GetCurrentUserId();

        if (userId == null)
        {
            return Unauthorized();
        }

        var allowed =
            await _ownershipService
                .CanAccessDocumentAsync(
                    userId.Value,
                    documentId);

        if (!allowed)
        {
            return Forbid();
        }

        var document =
            await _db.BookingDocuments
                .AsNoTracking()
                .FirstOrDefaultAsync(x =>
                    x.Id ==
                    documentId);

        if (document == null)
        {
            return NotFound(new
            {
                message =
                    "Document not found"
            });
        }

        return Ok(document);
    }

    private int? GetCurrentUserId()
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