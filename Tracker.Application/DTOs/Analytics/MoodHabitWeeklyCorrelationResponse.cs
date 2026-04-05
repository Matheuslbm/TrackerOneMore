namespace Tracker.Application.DTOs.Analytics
{
    /// <summary>
    /// Resposta consolidada com análise de correlação entre humor e hábitos por período semanal
    /// Oferece insights sobre tendências semanais de produtividade e bem-estar
    /// </summary>
    public class MoodHabitWeeklyCorrelationResponse
    {
        /// <summary>
        /// Informações do período analisado
        /// </summary>
        public PeriodInfoResponse Period { get; set; } = new();

        /// <summary>
        /// Estatísticas gerais do período
        /// </summary>
        public OverallAnalyticsStatsResponse OverallStats { get; set; } = new();

        /// <summary>
        /// Dados agregados por semana, ordenado cronologicamente
        /// Cada item representa uma semana completa com humor e hábitos agregados
        /// </summary>
        public IEnumerable<WeeklyTrendResponse> WeeklyTrends { get; set; } = new List<WeeklyTrendResponse>();

        /// <summary>
        /// Representa as informações do período analisado
        /// </summary>
        public class PeriodInfoResponse
        {
            /// <summary>
            /// Data de início do período analisado
            /// </summary>
            public DateOnly StartDate { get; set; }

            /// <summary>
            /// Data de fim do período analisado
            /// </summary>
            public DateOnly EndDate { get; set; }

            /// <summary>
            /// Número de dias totais no período
            /// </summary>
            public int TotalDays { get; set; }

            /// <summary>
            /// Número de semanas completas no período (arredondado)
            /// </summary>
            public int TotalWeeks { get; set; }
        }
    }
}
