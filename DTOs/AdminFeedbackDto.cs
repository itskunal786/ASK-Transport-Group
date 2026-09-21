namespace ASK.Group.Api.DTOs;

public sealed class AdminFeedbackDto
{
    public int Id { get; set; }

    public string BookingNumber { get; set; } = string.Empty;

    public string CustomerName { get; set; } = string.Empty;

    public string CustomerEmail { get; set; } = string.Empty;

    public int Rating { get; set; }

    public string? Comment { get; set; }

    public DateTime CreatedAt { get; set; }
}

public sealed class AdminFeedbackListDto
{
    public int Page { get; set; }

    public int PageSize { get; set; }

    public int TotalRecords { get; set; }

    public int TotalPages { get; set; }

    public List<AdminFeedbackDto> Data { get; set; } = new();
}

public sealed class FeedbackSummaryDto
{
    public int TotalFeedback { get; set; }

    public double AverageRating { get; set; }

    public int FiveStar { get; set; }

    public int FourStar { get; set; }

    public int ThreeStar { get; set; }

    public int TwoStar { get; set; }

    public int OneStar { get; set; }
}
