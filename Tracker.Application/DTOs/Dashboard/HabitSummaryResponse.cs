namespace Tracker.Application.DTOs.Dashboard
{
    /// <summary>
    /// Resumo de um hábito para o dashboard
    /// </summary>
    public class HabitSummaryResponse
    {
        /// <summary>
        /// ID do hábito
        /// </summary>
        public Guid Id { get; set; }

        /// <summary>
        /// Nome do hábito
        /// </summary>
        public string Name { get; set; } = null!;

        /// <summary>
        /// Streak atual (número de dias consecutivos)
        /// </summary>
        public int CurrentStreak { get; set; }

        /// <summary>
        /// Indica se o hábito foi completado hoje
        /// </summary>
        public bool IsCompletedToday { get; set; }
    }
}
