using AutoMapper;
using Tracker.Application.DTOs;
using Tracker.Domain.Entities;
using Tracker.Domain.Enums;
using Tracker.Domain.Exceptions;
using Tracker.Domain.Interfaces.Repositories;

namespace Tracker.Application.Services;

public class HabitService : IHabitService
{
    private readonly IHabitRepository _habitRepository;
    private readonly IHabitLogRepository _habitLogRepository;
    private readonly IMapper _mapper;

    public HabitService(IHabitRepository habitRepository, IHabitLogRepository habitLogRepository, IMapper mapper)
    {
        _habitRepository = habitRepository ?? throw new ArgumentNullException(nameof(habitRepository));
        _habitLogRepository = habitLogRepository ?? throw new ArgumentNullException(nameof(habitLogRepository));
        _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
    }

    public async Task<HabitResponse> CreateHabitAsync(
        Guid userId,
        CreateHabitRequest request,
        CancellationToken cancellationToken = default)
    {
        ValidateCreateHabitRequest(request);

        var habit = new Habit(
            userId: userId,
            name: request.Name,
            type: request.Type,
            targetDaysPerWeek: request.TargetDaysPerWeek,
            graceDaysAllowed: request.GraceDaysAllowed);

        await _habitRepository.AddAsync(habit, cancellationToken);

        return MapHabitToResponse(habit, currentStreak: 0);
    }

    public async Task<HabitResponse> LogHabitAsync(
        Guid habitId,
        LogHabitRequest request,
        CancellationToken cancellationToken = default)
    {
        var habit = await _habitRepository.GetByIdAsync(habitId, cancellationToken)
            ?? throw new HabitNotFoundException(habitId);

        var existingLog = await _habitLogRepository.GetLogByDateAsync(habitId, request.Date, cancellationToken);

        if (existingLog != null)
        {
            existingLog.ChangeStatus(request.Status);
            await _habitLogRepository.UpdateAsync(existingLog, cancellationToken);
        }
        else
        {
            var newLog = new HabitLog(habitId, request.Date, request.Status);
            await _habitLogRepository.AddAsync(newLog, cancellationToken);
        }

        var updatedStreak = await CalculateCurrentStreakAsync(habitId, cancellationToken);

        return MapHabitToResponse(habit, updatedStreak);
    }

    public async Task<int> CalculateCurrentStreakAsync(Guid habitId, CancellationToken cancellationToken = default)
    {
        var logs = await _habitLogRepository.GetLogsByHabitIdAsync(habitId, cancellationToken);

        if (!logs.Any())
        {
            return 0;
        }

        int streak = 0;

        foreach (var log in logs)
        {
            switch (log.Status)
            {
                case LogStatus.Completed:
                    streak++;
                    break;
                case LogStatus.GraceDay:
                    continue;
                case LogStatus.Missed:
                    return streak;
                default:
                    continue;
            }
        }

        return streak;
    }
    private static void ValidateCreateHabitRequest(CreateHabitRequest request)
    {
        if (request.Type == HabitType.WeeklyTarget)
        {
            if (request.TargetDaysPerWeek == null || request.TargetDaysPerWeek < 1 || request.TargetDaysPerWeek > 7)
                throw new ArgumentException("Para hábitos do tipo WeeklyTarget, TargetDaysPerWeek deve ser entre 1 e 7.", nameof(request.TargetDaysPerWeek));
        }
    }

    private HabitResponse MapHabitToResponse(Habit habit, int currentStreak)
    {
        var response = _mapper.Map<HabitResponse>(habit);
        response.CurrentStreak = currentStreak;
        return response;
    }


}