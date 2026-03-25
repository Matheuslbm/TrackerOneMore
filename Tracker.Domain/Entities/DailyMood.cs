using Tracker.Domain.Enums;

namespace Tracker.Domain.Entities;

public class DailyMood : BaseEntity
{
    public Guid UserId { get; private set; }
    public DateOnly Date { get; private set; }
    public MoodLevel Level { get; private set; }

    public DailyMood(Guid userId, DateOnly date, MoodLevel level)
    {
        UserId = userId;
        Date = date;
        Level = level;
    }
}