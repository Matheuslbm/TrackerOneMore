namespace Tracker.Application.DTOs.Analytics
{
    /// <summary>
    /// Representa a performance de um hábito específico durante um período
    /// Inclui taxa de conclusão e dados diários para correlação com humor
    /// </summary>
    public class HabitPerformanceResponse
    {
        /// <summary>
        /// ID do hábito
        /// </summary>
        public Guid HabitId { get; set; }

        /// <summary>
        /// Nome do hábito
        /// </summary>
        public string HabitName { get; set; } = null!;

        /// <summary>
        /// Tipo do hábito (Daily ou WeeklyTarget)
        /// </summary>
        public string HabitType { get; set; } = null!;

        /// <summary>
        /// Taxa de conclusão total (0-100%)
        /// Calculada como: (total completado / dias esperados) * 100
        /// </summary>
        public double CompletionRate { get; set; }

        /// <summary>
        /// Streak atual do hábito
        /// </summary>
        public int CurrentStreak { get; set; }

        /// <summary>
        /// Dados diários: status de cada dia do período
        /// </summary>
        public IEnumerable<DailyHabitLogResponse> DailyLogs { get; set; } = new List<DailyHabitLogResponse>();

        /// <summary>
        /// Hábitos completados durante o período
        /// </summary>
        public int TotalCompleted { get; set; }

        /// <summary>
        /// Dias com o hábito registrado (completado, missed, ou grace day)
        /// </summary>
        public int DaysWithLogs { get; set; }

        /// <summary>
        /// Dias esperados para o período baseado em TargetDaysPerWeek
        /// Se TargetDaysPerWeek = 3 e período tem 2 semanas, serão 6 dias esperados
        /// </summary>
        public int ExpectedDays { get; set; }

        /// <summary>
        /// Representa o registro de um dia específico do hábito
        /// </summary>
        public class DailyHabitLogResponse
        {
            /// <summary>
            /// Data do registro
            /// </summary>
            public DateOnly Date { get; set; }

            /// <summary>
            /// Status: "Completed", "Missed", "GraceDay", ou null se não registrado
            /// </summary>
            public string? Status { get; set; }

            /// <summary>
            /// Nível de humor naquele dia (1-5, null se não registrado)
            /// </summary>
            public int? MoodLevel { get; set; }

            /// <summary>
            /// Dia da semana para referência (1=seg, 7=dom)
            /// </summary>
            public int DayOfWeek { get; set; }
        }
    }
}
