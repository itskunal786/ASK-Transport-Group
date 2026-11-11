namespace ASK.Group.Api.DTOs;

public sealed class ClientDocumentDto
{
	public int Id { get; set; }

	public string BookingNumber { get; set; } = string.Empty;

	public string FileName { get; set; } = string.Empty;

	public string DocumentType { get; set; } = string.Empty;

	public DateTime CreatedAt { get; set; }
}


public sealed class ClientDocumentListDto
{
	public int Page { get; set; }

	public int PageSize { get; set; }

	public int TotalRecords { get; set; }

	public int TotalPages { get; set; }

	public List<ClientDocumentDto> Data { get; set; } = new();
}