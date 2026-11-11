using ASK.Group.Api.Data;
using ASK.Group.Api.Models;
using ASK.Group.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using ASK.Group.Api.DTOs;

namespace ASK.Group.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BookingDocumentController : ControllerBase
{
    private readonly AskTransportDbContext _db;
    private readonly DocumentStorageService _storageService;
    private readonly AuditService _auditService;

    public BookingDocumentController(
        AskTransportDbContext db,
        DocumentStorageService storageService,
        AuditService auditService)
    {
        _db = db;
        _storageService = storageService;
        _auditService = auditService;
    }

    [HttpPost("{bookingNumber}/upload")]
    [Consumes("multipart/form-data")]
    [RequestSizeLimit(5 * 1024 * 1024)]
    public async Task<IActionResult> Upload(
    string bookingNumber,
    [FromForm] UploadBookingDocumentRequest request)
    {
        var userId = GetUserId();

        if (userId == null)
        {
            return Unauthorized();
        }

        var booking = await _db.Bookings
            .FirstOrDefaultAsync(x =>
                x.BookingNumber == bookingNumber);

        if (booking == null)
        {
            return NotFound(new
            {
                message = "Booking not found"
            });
        }

        var isAdmin =
            User.IsInRole("Admin");

        if (!isAdmin &&
            booking.UserId != userId.Value)
        {
            return Forbid();
        }

        if (request.File == null ||
            request.File.Length == 0)
        {
            return BadRequest(new
            {
                message = "File is required"
            });
        }

        if (string.IsNullOrWhiteSpace(
            request.DocumentType))
        {
            return BadRequest(new
            {
                message = "Document type is required"
            });
        }

        var allowedDocumentTypes =
            new[]
            {
            "Booking Document",
            "Invoice",
            "Identity Proof",
            "Goods Document",
            "POD",
            "Other"
            };

        var normalizedType =
            allowedDocumentTypes
                .FirstOrDefault(x =>
                    x.Equals(
                        request.DocumentType.Trim(),
                        StringComparison.OrdinalIgnoreCase));

        if (normalizedType == null)
        {
            return BadRequest(new
            {
                message = "Invalid document type",
                allowedDocumentTypes
            });
        }

        if (normalizedType == "POD" &&
            !isAdmin)
        {
            return Forbid();
        }

        try
        {
            var file =
                request.File;

            var result =
                await _storageService
                    .SaveAsync(file);

            var document =
                new BookingDocument
                {
                    BookingId =
                        booking.Id,

                    DocumentType =
                        normalizedType,

                    OriginalFileName =
                        Path.GetFileName(
                            file.FileName),

                    StoredFileName =
                        result.StoredFileName,

                    ContentType =
                        string.IsNullOrWhiteSpace(
                            file.ContentType)
                            ? "application/octet-stream"
                            : file.ContentType,

                    FileSize =
                        result.FileSize,

                    UploadedByUserId =
                        userId.Value,

                    CreatedAt =
                        DateTime.UtcNow
                };

            _db.BookingDocuments.Add(
                document);

            await _db.SaveChangesAsync();

            await _auditService.LogAsync(
                "DOCUMENT_UPLOAD",
                $"{normalizedType} uploaded for booking {booking.BookingNumber}",
                userId.Value,
                User.FindFirstValue(
                    ClaimTypes.Email));

            return Ok(new
            {
                message =
                    "Document uploaded successfully",

                document = new
                {
                    document.Id,
                    document.DocumentType,
                    document.OriginalFileName,
                    document.ContentType,
                    document.FileSize,
                    document.CreatedAt
                }
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

    [HttpGet("{bookingNumber}")]
    public async Task<IActionResult> GetDocuments(
        string bookingNumber)
    {
        var userId = GetUserId();

        if (userId == null)
        {
            return Unauthorized();
        }

        var booking = await _db.Bookings
            .FirstOrDefaultAsync(x =>
                x.BookingNumber == bookingNumber);

        if (booking == null)
        {
            return NotFound(new
            {
                message = "Booking not found"
            });
        }

        if (!User.IsInRole("Admin") &&
            booking.UserId != userId.Value)
        {
            return Forbid();
        }

        var documents =
            await _db.BookingDocuments
                .Where(x =>
                    x.BookingId == booking.Id)
                .OrderByDescending(x =>
                    x.CreatedAt)
                .Select(x => new
                {
                    x.Id,
                    x.DocumentType,
                    x.OriginalFileName,
                    x.ContentType,
                    x.FileSize,
                    x.UploadedByUserId,
                    x.CreatedAt
                })
                .ToListAsync();

        return Ok(documents);
    }

    [HttpGet("download/{id:int}")]
    public async Task<IActionResult> Download(
        int id)
    {
        var userId = GetUserId();

        if (userId == null)
        {
            return Unauthorized();
        }

        var document =
            await _db.BookingDocuments
                .Include(x => x.Booking)
                .FirstOrDefaultAsync(x =>
                    x.Id == id);

        if (document == null ||
            document.Booking == null)
        {
            return NotFound(new
            {
                message = "Document not found"
            });
        }

        if (!User.IsInRole("Admin") &&
            document.Booking.UserId != userId.Value)
        {
            return Forbid();
        }

        var fullPath =
            _storageService.GetFullPath(
                document.StoredFileName);

        if (!System.IO.File.Exists(fullPath))
        {
            return NotFound(new
            {
                message =
                    "File is missing from storage"
            });
        }

        var bytes =
            await System.IO.File
                .ReadAllBytesAsync(fullPath);

        return File(
            bytes,
            document.ContentType,
            document.OriginalFileName);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(
        int id)
    {
        var userId = GetUserId();

        if (userId == null)
        {
            return Unauthorized();
        }

        var document =
            await _db.BookingDocuments
                .Include(x => x.Booking)
                .FirstOrDefaultAsync(x =>
                    x.Id == id);

        if (document == null ||
            document.Booking == null)
        {
            return NotFound(new
            {
                message = "Document not found"
            });
        }

        var isAdmin =
            User.IsInRole("Admin");

        var uploadedBySameUser =
            document.UploadedByUserId ==
            userId.Value;

        if (!isAdmin &&
            (!uploadedBySameUser ||
             document.Booking.UserId !=
             userId.Value))
        {
            return Forbid();
        }

        if (document.DocumentType == "POD" &&
            !isAdmin)
        {
            return Forbid();
        }

        _storageService.Delete(
            document.StoredFileName);

        _db.BookingDocuments.Remove(
            document);

        await _db.SaveChangesAsync();

        await _auditService.LogAsync(
            "DOCUMENT_DELETE",
            $"Document {document.Id} deleted from booking {document.Booking.BookingNumber}",
            userId.Value,
            User.FindFirstValue(
                ClaimTypes.Email));

        return Ok(new
        {
            message =
                "Document deleted successfully"
        });
    }

    private int? GetUserId()
    {
        var value =
            User.FindFirstValue(
                ClaimTypes.NameIdentifier);

        if (!int.TryParse(
            value,
            out var userId))
        {
            return null;
        }

        return userId;
    }
}
