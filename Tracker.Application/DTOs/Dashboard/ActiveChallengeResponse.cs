namespace Tracker.Application.DTOs.Dashboard
{
    /// <summary>
    /// Resumo de um desafio ativo para o dashboard
    /// </summary>
    public class ActiveChallengeResponse
    {
        /// <summary>
        /// ID do desafio
        /// </summary>
        public Guid Id { get; set; }

        /// <summary>
        /// Título do desafio
        /// </summary>
        public string Title { get; set; } = null!;

        /// <summary>
        /// Streak atual (número de dias consecutivos completados)
        /// </summary>
        public int CurrentStreak { get; set; }

        /// <summary>
        /// Data de término alvo do desafio
        /// </summary>
        public DateOnly TargetEndDate { get; set; }

        /// <summary>
        /// Dias restantes até a data alvo
        /// </summary>
        public int DaysRemaining { get; set; }
    }
}
