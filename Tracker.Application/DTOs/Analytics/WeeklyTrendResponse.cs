namespace Tracker.Application.DTOs.Analytics
{
    /// <summary>
    /// Representa os dados agregados de uma semana para análise de tendência
    /// </summary>
    public class WeeklyTrendResponse
    {
        /// <summary>
        /// Número da semana (1-52)
        /// </summary>
        public int WeekNumber { get; set; }

        /// <summary>
        /// Primeiro dia da semana
        /// </summary>
        public DateOnly StartDate { get; set; }

        /// <summary>
        /// Último dia da semana
        /// </summary>
        public DateOnly EndDate { get; set; }

        /// <summary>
        /// Nível de humor médio da semana (1-5, null se sem registros)
        /// </summary>
        public double? AverageMood { get; set; }

        /// <summary>
        /// Total de hábitos completados nesta semana
        /// </summary>
        public int TotalHabitsCompleted { get; set; }

        /// <summary>
        /// Streak médio dos hábitos durante a semana
        /// </summary>
        public double AverageStreak { get; set; }

        /// <summary>
        /// Taxa de conclusão de hábitos (percentual de dias com hábitos completados)
        /// Exemplo: 5 de 7 dias = 71.4%
        /// </summary>
        public double HabitCompletionRate { get; set; }

        /// <summary>
        /// Número de dias da semana que tiveram pelo menos um hábito completado
        /// </summary>
        public int DaysWithCompletedHabits { get; set; }
    }
}
