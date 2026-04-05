namespace Tracker.Application.DTOs.Analytics
{
    /// <summary>
    /// Estatísticas gerais de uma análise de período
    /// </summary>
    public class OverallAnalyticsStatsResponse
    {
        /// <summary>
        /// Nível de humor médio em todo o período analisado
        /// </summary>
        public double? AverageMoodAllPeriod { get; set; }

        /// <summary>
        /// Taxa média de conclusão de hábitos no período
        /// </summary>
        public double AverageCompletionRate { get; set; }

        /// <summary>
        /// Semana com melhor performance (maior conclusão de hábitos)
        /// </summary>
        public WeeklyTrendResponse? BestWeek { get; set; }

        /// <summary>
        /// Semana com pior performance (menor conclusão de hábitos)
        /// </summary>
        public WeeklyTrendResponse? WorstWeek { get; set; }

        /// <summary>
        /// Total de semanas completas analisadas
        /// </summary>
        public int TotalWeeks { get; set; }

        /// <summary>
        /// Total de hábitos completados em todo o período
        /// </summary>
        public int TotalHabitsCompletedAllPeriod { get; set; }
    }
}
