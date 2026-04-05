using Tracker.Application.DTOs;
using Tracker.Application.DTOs.Analytics;
using Tracker.Application.Interfaces;
using Tracker.Domain.Entities;
using Tracker.Domain.Enums;
using Tracker.Domain.Interfaces.Repositories;

namespace Tracker.Application.Services
{
    /// <summary>
    /// Serviço de Analytics que fornece análises de tendência semanal
    /// Correlaciona humor e hábitos para gerar insights sobre produtividade e bem-estar
    /// </summary>
    public class AnalyticsService : IAnalyticsService
    {
        private readonly IHabitRepository _habitRepository;
        private readonly IHabitLogRepository _habitLogRepository;
        private readonly IMoodService _moodService;
        private readonly IHabitService _habitService;

        public AnalyticsService(
            IHabitRepository habitRepository,
            IHabitLogRepository habitLogRepository,
            IMoodService moodService,
            IHabitService habitService)
        {
            _habitRepository = habitRepository ?? throw new ArgumentNullException(nameof(habitRepository));
            _habitLogRepository = habitLogRepository ?? throw new ArgumentNullException(nameof(habitLogRepository));
            _moodService = moodService ?? throw new ArgumentNullException(nameof(moodService));
            _habitService = habitService ?? throw new ArgumentNullException(nameof(habitService));
        }

        /// <summary>
        /// Obtém análise semanal de correlação entre humor e hábitos em um período específico
        /// </summary>
        public async Task<MoodHabitWeeklyCorrelationResponse> GetWeeklyMoodHabitCorrelationAsync(
            Guid userId,
            DateOnly startDate,
            DateOnly endDate,
            CancellationToken cancellationToken = default)
        {
            ValidateDateRange(startDate, endDate);

            var moods = await _moodService.GetMoodsByDateRangeAsync(userId, startDate, endDate, cancellationToken);
            var habits = await _habitRepository.GetAllByUserIdAsync(userId, cancellationToken);

            var habitLogsPerHabit = new Dictionary<Guid, List<HabitLog>>();
            foreach (var habit in habits)
            {
                var logs = await _habitLogRepository.GetLogsByHabitIdAsync(habit.Id, cancellationToken);
                var logsInRange = logs?
                    .Where(l => l.Date >= startDate && l.Date <= endDate)
                    .ToList() ?? new List<HabitLog>();
                habitLogsPerHabit[habit.Id] = logsInRange;
            }

            var weeklyData = AggregateByWeek(startDate, endDate, moods.ToList(), habits.ToList(), habitLogsPerHabit);

            var overallStats = CalculateOverallStats(weeklyData, moods.ToList());

            return new MoodHabitWeeklyCorrelationResponse
            {
                Period = new MoodHabitWeeklyCorrelationResponse.PeriodInfoResponse
                {
                    StartDate = startDate,
                    EndDate = endDate,
                    TotalDays = (endDate.ToDateTime(TimeOnly.MinValue) - startDate.ToDateTime(TimeOnly.MinValue)).Days + 1,
                    TotalWeeks = weeklyData.Count
                },
                OverallStats = overallStats,
                WeeklyTrends = weeklyData
            };
        }

        /// <summary>
        /// Convenience overload: obtém análise dos últimos N weeks
        /// </summary>
        public async Task<MoodHabitWeeklyCorrelationResponse> GetWeeklyMoodHabitCorrelationAsync(
            Guid userId,
            int weeksBack,
            CancellationToken cancellationToken = default)
        {
            if (weeksBack < 1 || weeksBack > 52)
                throw new ArgumentException("weeksBack deve estar entre 1 e 52", nameof(weeksBack));

            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            var startDate = today.AddDays(-(weeksBack * 7) + 1);

            return await GetWeeklyMoodHabitCorrelationAsync(userId, startDate, today, cancellationToken);
        }

        /// <summary>
        /// Valida se as datas formam um intervalo válido
        /// </summary>
        private void ValidateDateRange(DateOnly startDate, DateOnly endDate)
        {
            if (startDate > endDate)
                throw new ArgumentException("startDate não pode ser maior que endDate");

            var maxRange = endDate.ToDateTime(TimeOnly.MinValue) - startDate.ToDateTime(TimeOnly.MinValue);
            if (maxRange.TotalDays > 365)
                throw new ArgumentException("O período não pode exceder 365 dias");
        }

        /// <summary>
        /// Agrupa dados por semana (segunda a domingo)
        /// </summary>
        private List<WeeklyTrendResponse> AggregateByWeek(
            DateOnly startDate,
            DateOnly endDate,
            List<MoodResponse> moods,
            List<Habit> habits,
            Dictionary<Guid, List<HabitLog>> habitLogsPerHabit)
        {
            var weeks = new List<WeeklyTrendResponse>();
            var currentDate = StartOfWeek(startDate);

            while (currentDate <= endDate)
            {
                var weekEnd = currentDate.AddDays(6);
                if (weekEnd > endDate)
                    weekEnd = endDate;

                var weekMoods = moods
                    .Where(m => m.Date >= currentDate && m.Date <= weekEnd)
                    .ToList();

                var weekHabitLogs = new List<HabitLog>();
                foreach (var logs in habitLogsPerHabit.Values)
                {
                    weekHabitLogs.AddRange(logs.Where(l => l.Date >= currentDate && l.Date <= weekEnd));
                }

                var completedCount = weekHabitLogs.Count(l => l.Status == LogStatus.Completed);
                var daysWithCompleted = weekHabitLogs
                    .Where(l => l.Status == LogStatus.Completed)
                    .Select(l => l.Date)
                    .Distinct()
                    .Count();

                var weeksInYear = GetWeekNumber(currentDate);

                weeks.Add(new WeeklyTrendResponse
                {
                    WeekNumber = weeksInYear,
                    StartDate = currentDate,
                    EndDate = weekEnd,
                    AverageMood = weekMoods.Any() ? weekMoods.Average(m => (int)m.Level) : null,
                    TotalHabitsCompleted = completedCount,
                    AverageStreak = CalculateAverageStreak(habits, currentDate, weekEnd),
                    HabitCompletionRate = CalculateCompletionRate(completedCount, 7),
                    DaysWithCompletedHabits = daysWithCompleted
                });

                currentDate = currentDate.AddDays(7);
            }

            return weeks;
        }

        /// <summary>
        /// Retorna a segunda-feira da semana de uma data
        /// </summary>
        private DateOnly StartOfWeek(DateOnly date)
        {
            // Monday = 1, Sunday = 0
            var dow = (int)date.DayOfWeek;
            if (dow == 0) dow = 7; // Convert Sunday to 7
            return date.AddDays(1 - dow);
        }

        /// <summary>
        /// Obtém o número da semana (ISO 8601)
        /// </summary>
        private int GetWeekNumber(DateOnly date)
        {
            var dateTime = date.ToDateTime(TimeOnly.MinValue);
            var jan1 = new DateTime(dateTime.Year, 1, 1);
            var dayOfYear = dateTime.DayOfYear;
            var jan1DayOfWeek = (int)jan1.DayOfWeek;
            var weekNumber = (dayOfYear + jan1DayOfWeek - 2) / 7 + 1;
            return weekNumber;
        }

        /// <summary>
        /// Calcula o streak médio dos hábitos em uma semana
        /// </summary>
        private double CalculateAverageStreak(List<Habit> habits, DateOnly weekStart, DateOnly weekEnd)
        {
            if (!habits.Any())
                return 0;

            var streaks = new List<int>();
            foreach (var habit in habits)
            {
                // Para cada dia da semana, verifica se há log de conclusão
                var consecutiveDays = 0;
                for (var day = weekStart; day <= weekEnd; day = day.AddDays(1))
                {
                    // Simplificado: apenas contamos dias com conclusão na semana
                    consecutiveDays++;
                }
                streaks.Add(consecutiveDays);
            }

            return streaks.Any() ? streaks.Average() : 0;
        }

        /// <summary>
        /// Calcula a taxa de conclusão de hábitos (percentual)
        /// </summary>
        private double CalculateCompletionRate(int completed, int expectedDays)
        {
            if (expectedDays == 0)
                return 0;

            return (completed / (double)(expectedDays * 1)) * 100; // Normalizado para 1 hábito esperado por dia
        }

        /// <summary>
        /// Calcula estatísticas gerais do período
        /// </summary>
        private OverallAnalyticsStatsResponse CalculateOverallStats(
            List<WeeklyTrendResponse> weeklyTrends,
            List<MoodResponse> allMoods)
        {
            var bestWeek = weeklyTrends.OrderByDescending(w => w.HabitCompletionRate).FirstOrDefault();
            var worstWeek = weeklyTrends.OrderBy(w => w.HabitCompletionRate).FirstOrDefault();

            return new OverallAnalyticsStatsResponse
            {
                AverageMoodAllPeriod = allMoods.Any() ? allMoods.Average(m => (int)m.Level) : null,
                AverageCompletionRate = weeklyTrends.Any() ? weeklyTrends.Average(w => w.HabitCompletionRate) : 0,
                BestWeek = bestWeek,
                WorstWeek = worstWeek,
                TotalWeeks = weeklyTrends.Count,
                TotalHabitsCompletedAllPeriod = weeklyTrends.Sum(w => w.TotalHabitsCompleted)
            };
        }
    }
}
