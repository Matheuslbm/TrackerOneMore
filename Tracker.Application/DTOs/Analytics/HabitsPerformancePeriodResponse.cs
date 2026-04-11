namespace Tracker.Application.DTOs.Analytics
{
    /// <summary>
    /// Resposta agregando performance de todos os hábitos para um período
    /// Otimizada para renderizar gráficos de desempenho por hábito e correlação humor-hábito
    /// </summary>
    public class HabitsPerformancePeriodResponse
    {
        /// <summary>
        /// Informações do período analisado
        /// </summary>
        public PeriodInfoResponse Period { get; set; } = new();

        /// <summary>
        /// Performance de cada hábito durante o período
        /// Ordenados por completion rate decrescente
        /// </summary>
        public IEnumerable<HabitPerformanceResponse> HabitPerformances { get; set; } = new List<HabitPerformanceResponse>();

        /// <summary>
        /// Taxa média de conclusão de todos os hábitos
        /// </summary>
        public double AverageCompletionRate { get; set; }

        /// <summary>
        /// Mood médio do período
        /// </summary>
        public double? AverageMoodLevel { get; set; }

        /// <summary>
        /// Total de hábitos rastreados
        /// </summary>
        public int TotalHabits { get; set; }

        /// <summary>
        /// Total de hábitos com pelo menos 1 conclusão no período
        /// </summary>
        public int HabitsWithActivity { get; set; }

        /// <summary>
        /// Informações do período analisado
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
            /// Número de semanas completas ou parciais no período
            /// </summary>
            public int TotalWeeks { get; set; }
        }
    }
}
