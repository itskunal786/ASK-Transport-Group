using System.ComponentModel.DataAnnotations;

namespace ASK.Group.Api.Models;

public class BookingDocument
{
    public int Id { get; set; }

    public int BookingId { get; set; }

    public Booking? Booking { get; set; }

    [Required]
    [MaxLength(50)]
    public string DocumentType { get; set; } = string.Empty;

    [Required]
    [MaxLength(255)]
    public string OriginalFileName { get; set; } = string.Empty;

    [Required]
    [MaxLength(255)]
    public string StoredFileName { get; set; } = string.Empty;

    [Required]
    [MaxLength(150)]
    public string ContentType { get; set; } = string.Empty;

    public long FileSize { get; set; }

    public int? UploadedByUserId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}