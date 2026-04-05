namespace Tracker.Application.DTOs.Dashboard
{
    /// <summary>
    /// Representa um dia no gráfico de contribuição estilo GitHub
    /// </summary>
    public class ContributionDataResponse
    {
        /// <summary>
        /// Data do registro de contribuição
        /// </summary>
        public DateOnly Date { get; set; }

        /// <summary>
        /// Quantidade de atividades completadas neste dia (hábitos + desafios concluídos)
        /// </summary>
        public int Count { get; set; }
    }
}
