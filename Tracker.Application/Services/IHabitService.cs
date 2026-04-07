using Tracker.Application.DTOs;

namespace Tracker.Application.Services;

public interface IHabitService
{
    Task<HabitResponse> CreateHabitAsync(Guid userId, CreateHabitRequest request, CancellationToken cancellationToken = default);
    Task<HabitResponse> UpdateHabitAsync(Guid habitId, Guid userId, UpdateHabitRequest request, CancellationToken cancellationToken = default);
    Task DeleteHabitAsync(Guid habitId, Guid userId, CancellationToken cancellationToken = default);
    Task<HabitResponse> LogHabitAsync(Guid habitId, Guid userId, LogHabitRequest request, CancellationToken cancellationToken = default);
    Task DeleteHabitLogAsync(Guid habitId, Guid userId, DateOnly date, CancellationToken cancellationToken = default);
    Task<PagedResponse<HabitResponse>> GetUserHabitsAsync(Guid userId, int pageNumber = 1, int pageSize = 20, CancellationToken cancellationToken = default);
    Task<int> CalculateCurrentStreakAsync(Guid habitId, CancellationToken cancellationToken = default);
    Task<string?> GetHabitLogByDateAsync(Guid habitId, Guid userId, DateOnly date, CancellationToken cancellationToken = default);
    Task<WeeklyHabitLogsResponse> GetWeeklyHabitLogsAsync(Guid userId, DateOnly startDate, DateOnly endDate, CancellationToken cancellationToken = default);
}