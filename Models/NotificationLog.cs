using System.ComponentModel.DataAnnotations;

namespace ASK.Group.Api.Models;

public class NotificationLog
{
	public int Id { get; set; }

	public int? UserId { get; set; }

	public AppUser? User { get; set; }

	[Required]
	[MaxLength(50)]
	public string Channel { get; set; } =
		string.Empty;

	[MaxLength(180)]
	public string? Recipient { get; set; }

	[MaxLength(300)]
	public string? Subject { get; set; }

	public string? Message { get; set; }

	[MaxLength(50)]
	public string Status { get; set; } =
		"Pending";

	[MaxLength(1000)]
	public string? ErrorMessage { get; set; }

	[MaxLength(100)]
	public string? TemplateCode { get; set; }

	public DateTime CreatedAt { get; set; } =
		DateTime.UtcNow;

	public DateTime? SentAt { get; set; }
}