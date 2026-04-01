namespace Tracker.Application.DTOs;

public class PagedResponse<T>
{
    public IEnumerable<T> Items { get; set; } = [];
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
    public int TotalItems { get; set; }
    public int TotalPages => (TotalItems + PageSize - 1) / PageSize;
    public bool HasNextPage => PageNumber < TotalPages;
    public bool HasPreviousPage => PageNumber > 1;
}
