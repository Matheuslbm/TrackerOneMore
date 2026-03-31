using Tracker.Application.DTOs;

namespace Tracker.Application.Services;

public interface IHabitService
{
    Task<HabitResponse> CreateHabitAsync(Guid userId, CreateHabitRequest request, CancellationToken cancellationToken = default);
    Task<HabitResponse> LogHabitAsync(Guid habitId, LogHabitRequest request, CancellationToken cancellationToken = default);
    Task<int> CalculateCurrentStreakAsync(Guid habitId, CancellationToken cancellationToken = default);
}