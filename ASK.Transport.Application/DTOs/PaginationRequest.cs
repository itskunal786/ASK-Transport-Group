namespace ASK.Group.Api.DTOs;

public class PaginationRequest
{
    private const int MaxPageSize = 100;

    private int _page = 1;
    private int _pageSize = 20;

    public int Page
    {
        get => _page;
        set => _page = value < 1
            ? 1
            : value;
    }

    public int PageSize
    {
        get => _pageSize;
        set
        {
            if (value < 1)
            {
                _pageSize = 20;
            }
            else if (value > MaxPageSize)
            {
                _pageSize = MaxPageSize;
            }
            else
            {
                _pageSize = value;
            }
        }
    }

    public string? Search { get; set; }

    public string? SortBy { get; set; }

    public string SortDirection { get; set; } =
        "desc";
}