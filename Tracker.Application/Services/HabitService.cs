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
        Guid userId,
        LogHabitRequest request,
        CancellationToken cancellationToken = default)
    {
        var habit = await _habitRepository.GetByIdAsync(habitId, cancellationToken)
            ?? throw new HabitNotFoundException(habitId);

        // 🔐 SEGURANÇA: Validar que o hábito pertence ao usuário autenticado
        if (habit.UserId != userId)
            throw new UnauthorizedAccessException("Você não tem permissão para acessar este hábito.");

        // ✋ VALIDAÇÃO: Grace Day só pode ser usado 1x por semana
        if (request.Status == LogStatus.GraceDay)
        {
            // Calcular o início da semana (segunda-feira)
            var dateOfWeek = (int)request.Date.DayOfWeek;
            var dayOffsetFromMonday = dateOfWeek == 0 ? 6 : dateOfWeek - 1;
            var startOfWeek = request.Date.AddDays(-dayOffsetFromMonday);
            var endOfWeek = startOfWeek.AddDays(6);

            // Buscar se já existe um Grace Day nessa semana para esse hábito
            var allLogsThisWeek = await _habitLogRepository.GetLogsByHabitIdAsync(habitId, cancellationToken);
            var graceInWeek = allLogsThisWeek.FirstOrDefault(l => 
                l.Status == LogStatus.GraceDay && 
                l.Date >= startOfWeek && 
                l.Date <= endOfWeek &&
                l.Date != request.Date // Permitir atualizar o mesmo dia
            );

            if (graceInWeek != null)
            {
                throw new InvalidOperationException($"Você já usou seu Grace Day nesta semana ({graceInWeek.Date:dd/MM/yyyy}). Limite de 1 por semana.");
            }
        }

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

    public async Task<PagedResponse<HabitResponse>> GetUserHabitsAsync(Guid userId, int pageNumber = 1, int pageSize = 20, CancellationToken cancellationToken = default)
    {
        if (userId == Guid.Empty)
            throw new ArgumentException("UserId não pode ser vazio.", nameof(userId));

        if (pageNumber < 1)
            pageNumber = 1;

        if (pageSize < 1 || pageSize > 100)
            pageSize = 20;

        var habits = await _habitRepository.GetAllByUserIdAsync(userId, cancellationToken);
        var totalItems = habits.Count();

        var pagedHabits = habits
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToList();

        var response = new List<HabitResponse>();
        foreach (var habit in pagedHabits)
        {
            var currentStreak = await CalculateCurrentStreakAsync(habit.Id, cancellationToken);
            response.Add(MapHabitToResponse(habit, currentStreak));
        }

        return new PagedResponse<HabitResponse>
        {
            Items = response,
            PageNumber = pageNumber,
            PageSize = pageSize,
            TotalItems = totalItems
        };
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

    public async Task<HabitResponse> UpdateHabitAsync(
        Guid habitId,
        Guid userId,
        UpdateHabitRequest request,
        CancellationToken cancellationToken = default)
    {
        ValidateUpdateHabitRequest(request);

        var habit = await _habitRepository.GetByIdAsync(habitId, cancellationToken)
            ?? throw new HabitNotFoundException(habitId);

        // 🔐 SEGURANÇA: Validar que o hábito pertence ao usuário autenticado
        if (habit.UserId != userId)
            throw new UnauthorizedAccessException("Você não tem permissão para acessar este hábito.");

        habit.Update(request.Name, request.Type, request.TargetDaysPerWeek, request.GraceDaysAllowed);
        await _habitRepository.UpdateAsync(habit, cancellationToken);

        var currentStreak = await CalculateCurrentStreakAsync(habitId, cancellationToken);
        return MapHabitToResponse(habit, currentStreak);
    }

    public async Task DeleteHabitAsync(
        Guid habitId,
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        var habit = await _habitRepository.GetByIdAsync(habitId, cancellationToken)
            ?? throw new HabitNotFoundException(habitId);

        // 🔐 SEGURANÇA: Validar que o hábito pertence ao usuário autenticado
        if (habit.UserId != userId)
            throw new UnauthorizedAccessException("Você não tem permissão para acessar este hábito.");

        await _habitRepository.DeleteAsync(habitId, cancellationToken);
    }

    private static void ValidateUpdateHabitRequest(UpdateHabitRequest request)
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

    public async Task<string?> GetHabitLogByDateAsync(Guid habitId, Guid userId, DateOnly date, CancellationToken cancellationToken = default)
    {
        var habit = await _habitRepository.GetByIdAsync(habitId, cancellationToken)
            ?? throw new HabitNotFoundException(habitId);

        // 🔐 SEGURANÇA: Validar que o hábito pertence ao usuário autenticado
        if (habit.UserId != userId)
            throw new UnauthorizedAccessException("Você não tem permissão para acessar este hábito.");

        var log = await _habitLogRepository.GetLogByDateAsync(habitId, date, cancellationToken);

        if (log == null)
            return null;

        // Mapear enum para string que o frontend espera
        return log.Status switch
        {
            LogStatus.Completed => "Completed",
            LogStatus.GraceDay => "Grace",
            LogStatus.Missed => "Missed",
            _ => null
        };
    }

    public async Task DeleteHabitLogAsync(Guid habitId, Guid userId, DateOnly date, CancellationToken cancellationToken = default)
    {
        var habit = await _habitRepository.GetByIdAsync(habitId, cancellationToken)
            ?? throw new HabitNotFoundException(habitId);

        // 🔐 SEGURANÇA: Validar que o hábito pertence ao usuário autenticado
        if (habit.UserId != userId)
            throw new UnauthorizedAccessException("Você não tem permissão para acessar este hábito.");

        await _habitLogRepository.DeleteByDateAsync(habitId, date, cancellationToken);
    }

    public async Task<WeeklyHabitLogsResponse> GetWeeklyHabitLogsAsync(
        Guid userId,
        DateOnly startDate,
        DateOnly endDate,
        CancellationToken cancellationToken = default)
    {
        // Obter todos os hábitos do usuário
        var habits = await _habitRepository.GetAllByUserIdAsync(userId, cancellationToken);

        var logs = new List<WeeklyHabitLogItem>();

        // Para cada hábito, buscar os logs da semana
        foreach (var habit in habits)
        {
            var habitLogs = await _habitLogRepository.GetLogsByHabitIdAsync(habit.Id, cancellationToken);

            // Filtrar logs dentro do intervalo de datas
            var weekLogs = habitLogs
                .Where(l => l.Date >= startDate && l.Date <= endDate)
                .Select(l => new WeeklyHabitLogItem
                {
                    HabitId = l.HabitId,
                    Date = l.Date,
                    Status = l.Status switch
                    {
                        LogStatus.Completed => "Completed",
                        LogStatus.GraceDay => "Grace",
                        LogStatus.Missed => "Missed",
                        _ => ""
                    }
                });

            logs.AddRange(weekLogs);
        }

        return new WeeklyHabitLogsResponse { Logs = logs };
    }

}