using System.ComponentModel.DataAnnotations;

namespace ASK.Group.Api.DTOs;

public class UpdateSettingRequest
{
	[Required]
	[StringLength(150)]
	public string Key { get; set; } = string.Empty;

	[Required]
	[StringLength(2000)]
	public string Value { get; set; } = string.Empty;

	[StringLength(100)]
	public string Group { get; set; } = "General";

	[StringLength(500)]
	public string? Description { get; set; }

	public bool IsPublic { get; set; }
}