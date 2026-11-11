using System.ComponentModel.DataAnnotations;

namespace ASK.Group.Api.Models;

public class WebhookDeliveryLog
{
	public int Id { get; set; }

	public int PartnerWebhookId { get; set; }

	public PartnerWebhook? PartnerWebhook
	{
		get;
		set;
	}

	[Required]
	[MaxLength(100)]
	public string EventName { get; set; } =
		string.Empty;

	[Required]
	[MaxLength(200)]
	public string ReferenceId { get; set; } =
		string.Empty;

	[Required]
	public string Payload { get; set; } =
		string.Empty;

	public int AttemptNumber { get; set; }

	public DateTime AttemptedAt { get; set; } =
		DateTime.UtcNow;

	public bool IsSuccess { get; set; }

	public int? HttpStatusCode { get; set; }

	[MaxLength(2000)]
	public string? ResponseBody { get; set; }

	[MaxLength(2000)]
	public string? ErrorMessage { get; set; }

	public DateTime CreatedAt { get; set; } =
		DateTime.UtcNow;
}