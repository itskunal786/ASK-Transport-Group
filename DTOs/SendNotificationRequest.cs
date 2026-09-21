using System.ComponentModel.DataAnnotations;

namespace ASK.Group.Api.DTOs;

public class SendNotificationRequest
{
	public int? UserId { get; set; }

	[Required]
	public string TemplateCode { get; set; } =
		string.Empty;

	public Dictionary<string, string> Values
	{
		get;
		set;
	} = new();
}