namespace Tracker.Application.DTOs;

public class WeeklyHabitLogsResponse
{
    public List<WeeklyHabitLogItem> Logs { get; set; } = [];
}

public class WeeklyHabitLogItem
{
    public Guid HabitId { get; set; }
    public DateOnly Date { get; set; }
    public string Status { get; set; } = null!;
}
