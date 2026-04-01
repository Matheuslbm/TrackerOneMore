using Tracker.Domain.Entities;

namespace Tracker.Domain.Interfaces.Repositories;

public interface IDailyMoodRepository
{
    Task AddAsync(DailyMood mood, CancellationToken cancellationToken = default);
    Task AddOrUpdateAsync(DailyMood mood, CancellationToken cancellationToken = default);
    Task<DailyMood?> GetByDateAsync(Guid userId, DateOnly date, CancellationToken cancellationToken = default);
    Task<IEnumerable<DailyMood>> GetMoodsByDateRangeAsync(Guid userId, DateOnly startDate, DateOnly endDate, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}