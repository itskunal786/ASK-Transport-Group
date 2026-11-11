using System.ComponentModel.DataAnnotations;

namespace ASK.Group.Api.DTOs;

public class HubRequest
{
	[Required, StringLength(30)]
	public string Code { get; set; } = string.Empty;

	[Required, StringLength(150)]
	public string Name { get; set; } = string.Empty;

	[Range(1, int.MaxValue)]
	public int BranchId { get; set; }

	[EmailAddress, StringLength(180)]
	public string? Email { get; set; }

	[StringLength(20)]
	public string? Phone { get; set; }

	[StringLength(300)]
	public string? Address { get; set; }

	[Range(1, int.MaxValue)]
	public int StateId { get; set; }

	[Range(1, int.MaxValue)]
	public int CityId { get; set; }

	[StringLength(10)]
	public string? PinCode { get; set; }

	public int? ManagerUserId { get; set; }

	public bool IsActive { get; set; } = true;
}