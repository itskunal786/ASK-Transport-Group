using Microsoft.AspNetCore.Http;

namespace ASK.Group.Api.DTOs;

public sealed class UploadBookingDocumentRequest
{
    public IFormFile File { get; set; } = null!;

    public string DocumentType { get; set; } = string.Empty;
}