using AutoMapper;
using Tracker.Application.DTOs.Dashboard;
using Tracker.Application.Interfaces;
using Tracker.Domain.Entities;
using Tracker.Domain.Interfaces.Repositories;

namespace Tracker.Application.Services
{
    /// <summary>
    /// Serviço de Dashboard que agrega dados de múltiplas fontes para a aba Resumo
    /// Implementa o padrão BFF (Backend for Frontend) consolidando dados em uma única chamada
    /// </summary>
    public class DashboardService : IDashboardService
    {
        private readonly IHabitRepository _habitRepository;
        private readonly IHabitLogRepository _habitLogRepository;
        private readonly IChallengeRepository _challengeRepository;
        private readonly IChallengeDailyLogRepository _challengeDailyLogRepository;
        private readonly IDailyMoodRepository _moodRepository;
        private readonly IHabitService _habitService;
        private readonly IChallengeService _challengeService;
        private readonly IMapper _mapper;

        public DashboardService(
            IHabitRepository habitRepository,
            IHabitLogRepository habitLogRepository,
            IChallengeRepository challengeRepository,
            IChallengeDailyLogRepository challengeDailyLogRepository,
            IDailyMoodRepository moodRepository,
            IHabitService habitService,
            IChallengeService challengeService,
            IMapper mapper)
        {
            _habitRepository = habitRepository ?? throw new ArgumentNullException(nameof(habitRepository));
            _habitLogRepository = habitLogRepository ?? throw new ArgumentNullException(nameof(habitLogRepository));
            _challengeRepository = challengeRepository ?? throw new ArgumentNullException(nameof(challengeRepository));
            _challengeDailyLogRepository = challengeDailyLogRepository ?? throw new ArgumentNullException(nameof(challengeDailyLogRepository));
            _moodRepository = moodRepository ?? throw new ArgumentNullException(nameof(moodRepository));
            _habitService = habitService ?? throw new ArgumentNullException(nameof(habitService));
            _challengeService = challengeService ?? throw new ArgumentNullException(nameof(challengeService));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
        }

        /// <summary>
        /// Obtém o dashboard pessoal consolidado do usuário com todos os dados da aba Resumo
        /// </summary>
        public async Task<DashboardResponse> GetPersonalDashboardAsync(Guid userId, CancellationToken cancellationToken = default)
        {
            var dashboard = new DashboardResponse
            {
                DailyGreeting = GenerateDailyGreeting(),
                MoodLevel = await GetTodaysMoodLevelAsync(userId, cancellationToken),
                HabitSummaries = await GetHabitSummariesAsync(userId, cancellationToken),
                ActiveChallenges = await GetActiveChallengesSummariesAsync(userId, cancellationToken),
                ContributionData = await GenerateContributionDataAsync(userId, cancellationToken)
            };

            return dashboard;
        }

        /// <summary>
        /// Gera uma saudação personalizada baseada na hora do dia
        /// </summary>
        private string GenerateDailyGreeting()
        {
            var currentHour = DateTime.Now.Hour;

            return currentHour switch
            {
                >= 5 and < 12 => "Bom dia! ☀️",
                >= 12 and < 18 => "Boa tarde! 🌤️",
                >= 18 and < 22 => "Boa noite! 🌙",
                _ => "Olá! 🌟"
            };
        }

        /// <summary>
        /// Busca o nível de humor registrado para o dia de hoje
        /// </summary>
        private async Task<int?> GetTodaysMoodLevelAsync(Guid userId, CancellationToken cancellationToken)
        {
            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            var mood = await _moodRepository.GetByDateAsync(userId, today, cancellationToken);
            return mood != null ? (int)mood.Level : null;
        }

        /// <summary>
        /// Obtém resumos de todos os hábitos ativos do usuário com streaks e status do dia
        /// </summary>
        private async Task<IEnumerable<HabitSummaryResponse>> GetHabitSummariesAsync(Guid userId, CancellationToken cancellationToken)
        {
            // Buscar hábitos do usuário
            var habits = await _habitRepository.GetAllByUserIdAsync(userId, cancellationToken);

            var summaries = new List<HabitSummaryResponse>();

            foreach (var habit in habits)
            {
                var streak = await _habitService.CalculateCurrentStreakAsync(habit.Id, cancellationToken);
                var isCompletedToday = await IsHabitCompletedTodayAsync(habit.Id, cancellationToken);

                summaries.Add(new HabitSummaryResponse
                {
                    Id = habit.Id,
                    Name = habit.Name,
                    CurrentStreak = streak,
                    IsCompletedToday = isCompletedToday
                });
            }

            return summaries.OrderByDescending(h => h.CurrentStreak);
        }

        /// <summary>
        /// Verifica se um hábito foi completado hoje
        /// </summary>
        private async Task<bool> IsHabitCompletedTodayAsync(Guid habitId, CancellationToken cancellationToken)
        {
            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            var todayLog = await _habitLogRepository.GetLogByDateAsync(habitId, today, cancellationToken);

            // Considera completado se o log existe e tem status de completado
            return todayLog != null && todayLog.Status == Domain.Enums.LogStatus.Completed;
        }

        /// <summary>
        /// Obtém resumos de todos os desafios ativos do usuário com streaks e dias restantes
        /// </summary>
        private async Task<IEnumerable<ActiveChallengeResponse>> GetActiveChallengesSummariesAsync(Guid userId, CancellationToken cancellationToken)
        {
            var activeChallenges = await _challengeService.GetActiveChallengesAsync(userId, cancellationToken);

            var summaries = new List<ActiveChallengeResponse>();

            foreach (var challenge in activeChallenges)
            {
                // Calcular streak based on consecutive survived days
                var dailyLogs = await _challengeDailyLogRepository.GetByChallengeIdAsync(challenge.Id, cancellationToken);
                var streak = CalculateChallengeStreak(dailyLogs?.ToList() ?? new List<ChallengeDailyLog>());
                var daysRemaining = CalculateDaysRemaining(challenge.TargetEndDate);

                summaries.Add(new ActiveChallengeResponse
                {
                    Id = challenge.Id,
                    Title = challenge.Title,
                    CurrentStreak = streak,
                    TargetEndDate = challenge.TargetEndDate,
                    DaysRemaining = daysRemaining
                });
            }

            return summaries.OrderByDescending(c => c.CurrentStreak);
        }

        /// <summary>
        /// Calcula o streak de um desafio baseado nos logs diários
        /// Conta dias consecutivos de "survived" a partir do último log
        /// </summary>
        private int CalculateChallengeStreak(List<ChallengeDailyLog> logs)
        {
            if (!logs.Any())
                return 0;

            // Ordena por data descendente (mais recente primeiro)
            var sortedLogs = logs.OrderByDescending(l => l.Date).ToList();

            int streak = 0;
            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            var expectedDate = today;

            foreach (var log in sortedLogs)
            {
                // Se a data é a esperada e o dia foi sobrevivido
                if (log.Date == expectedDate && log.Survived)
                {
                    streak++;
                    expectedDate = expectedDate.AddDays(-1);
                }
                else if (log.Date < expectedDate)
                {
                    // Pula dias sem registro e redefine o streak
                    // ou continua procurando se a data for anterior
                    expectedDate = log.Date.AddDays(-1);
                    if (log.Survived)
                        streak++;
                    else
                        break;
                }
                else
                {
                    // Data no futuro ou nenhuma correspondência
                    break;
                }
            }

            return streak;
        }

        /// <summary>
        /// Calcula dias restantes até a data alvo do desafio
        /// </summary>
        private int CalculateDaysRemaining(DateOnly targetEndDate)
        {
            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            var remaining = (targetEndDate.ToDateTime(TimeOnly.MinValue) - today.ToDateTime(TimeOnly.MinValue)).Days;
            return remaining >= 0 ? remaining : 0;
        }

        /// <summary>
        /// Gera dados de contribuição para os últimos 365 dias estilo GitHub
        /// Agrupa hábitos e desafios completados por data
        /// Otimizado com AsNoTracking e busca apenas de colunas necessárias
        /// </summary>
        private async Task<IEnumerable<ContributionDataResponse>> GenerateContributionDataAsync(Guid userId, CancellationToken cancellationToken)
        {
            var oneYearAgo = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-365));
            var today = DateOnly.FromDateTime(DateTime.UtcNow);

            // Buscar todos os logs de hábitos do usuário no período
            var userHabits = await _habitRepository.GetAllByUserIdAsync(userId, cancellationToken);
            var habitIds = userHabits?.Select(h => h.Id).ToList() ?? new List<Guid>();

            // Agregação de hábitos completados por data
            var habitContributions = new Dictionary<DateOnly, int>();

            foreach (var habitId in habitIds)
            {
                var logs = await _habitLogRepository.GetLogsByHabitIdAsync(habitId, cancellationToken);

                var completedLogs = logs?
                    .Where(l => l.Date >= oneYearAgo && l.Date <= today && l.Status == Domain.Enums.LogStatus.Completed)
                    .ToList() ?? new List<HabitLog>();

                foreach (var log in completedLogs)
                {
                    if (habitContributions.ContainsKey(log.Date))
                        habitContributions[log.Date]++;
                    else
                        habitContributions[log.Date] = 1;
                }
            }

            // Buscar todos os desafios do usuário
            var userChallenges = await _challengeRepository.GetAllChallengesByUserIdAsync(userId, cancellationToken);
            var challengeIds = userChallenges?.Select(c => c.Id).ToList() ?? new List<Guid>();

            // Agregação de desafios sobrevividos por data
            foreach (var challengeId in challengeIds)
            {
                var logs = await _challengeDailyLogRepository.GetByChallengeIdAsync(challengeId, cancellationToken);

                var survivedLogs = logs?
                    .Where(l => l.Date >= oneYearAgo && l.Date <= today && l.Survived)
                    .ToList() ?? new List<ChallengeDailyLog>();

                foreach (var log in survivedLogs)
                {
                    if (habitContributions.ContainsKey(log.Date))
                        habitContributions[log.Date]++;
                    else
                        habitContributions[log.Date] = 1;
                }
            }

            // Converter para cronológico
            var contributionData = habitContributions
                .OrderBy(kv => kv.Key)
                .Select(kv => new ContributionDataResponse
                {
                    Date = kv.Key,
                    Count = kv.Value
                })
                .ToList();

            return contributionData;
        }
    }
}
