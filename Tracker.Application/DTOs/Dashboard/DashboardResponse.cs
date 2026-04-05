namespace Tracker.Application.DTOs.Dashboard
{
    /// <summary>
    /// Resposta consolidada do Dashboard da aba Resumo
    /// Fornece uma visão holística do progresso do usuário
    /// </summary>
    public class DashboardResponse
    {
        /// <summary>
        /// Saudação personalizada com base na hora do dia
        /// Ex: "Bom dia!", "Boa tarde!", "Boa noite!"
        /// </summary>
        public string DailyGreeting { get; set; } = null!;

        /// <summary>
        /// Nível de humor registrado para o dia de hoje
        /// Null se o usuário ainda não registrou o humor hoje
        /// </summary>
        public int? MoodLevel { get; set; }

        /// <summary>
        /// Lista de resumos dos hábitos ativos do usuário
        /// Inclui streak, status de conclusão do dia e nome
        /// </summary>
        public IEnumerable<HabitSummaryResponse> HabitSummaries { get; set; } = new List<HabitSummaryResponse>();

        /// <summary>
        /// Lista de desafios ativos do usuário
        /// Inclui streak, dias restantes e título
        /// </summary>
        public IEnumerable<ActiveChallengeResponse> ActiveChallenges { get; set; } = new List<ActiveChallengeResponse>();

        /// <summary>
        /// Dados de contribuição para os últimos 365 dias
        /// Usado para renderizar o gráfico de calor estilo GitHub
        /// Lista cronológica de [data, contagem de atividades concluídas]
        /// </summary>
        public IEnumerable<ContributionDataResponse> ContributionData { get; set; } = new List<ContributionDataResponse>();
    }
}
