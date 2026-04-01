using Tracker.Application.DTOs;

namespace Tracker.Application.Interfaces;

public interface IMoodService
{
    Task<MoodResponse> LogMoodAsync( Guid userId, LogMoodRequest request, CancellationToken cancellationToken = default);
    Task<MoodResponse?> GetMoodByDateAsync(Guid userId, DateOnly date, CancellationToken cancellationToken = default);
    Task<IEnumerable<MoodResponse>> GetMoodsByDateRangeAsync(Guid userId, DateOnly startDate, DateOnly endDate, CancellationToken cancellationToken = default);
}