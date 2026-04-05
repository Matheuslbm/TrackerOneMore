using Tracker.Application.DTOs.Analytics;

namespace Tracker.Application.Interfaces
{
    /// <summary>
    /// Interface para o serviço de Analytics que fornece análises de tendência
    /// </summary>
    public interface IAnalyticsService
    {
        /// <summary>
        /// Obtém análise de correlação entre humor e hábitos com agregação semanal
        /// Fornece tendências semanais para visualizar padrões de produtividade e bem-estar
        /// </summary>
        /// <param name="userId">ID do usuário autenticado</param>
        /// <param name="startDate">Data inicial do período (inclusive)</param>
        /// <param name="endDate">Data final do período (inclusive)</param>
        /// <param name="cancellationToken">Token de cancelamento</param>
        /// <returns>Análise semanal com estatísticas gerais e tendências</returns>
        Task<MoodHabitWeeklyCorrelationResponse> GetWeeklyMoodHabitCorrelationAsync(
            Guid userId,
            DateOnly startDate,
            DateOnly endDate,
            CancellationToken cancellationToken = default);

        /// <summary>
        /// Convenience overload: obtém análise dos últimos N weeks
        /// </summary>
        /// <param name="userId">ID do usuário autenticado</param>
        /// <param name="weeksBack">Número de semanas para retroceder (1-52)</param>
        /// <param name="cancellationToken">Token de cancelamento</param>
        /// <returns>Análise semanal dos últimos N weeks</returns>
        Task<MoodHabitWeeklyCorrelationResponse> GetWeeklyMoodHabitCorrelationAsync(
            Guid userId,
            int weeksBack,
            CancellationToken cancellationToken = default);
    }
}
