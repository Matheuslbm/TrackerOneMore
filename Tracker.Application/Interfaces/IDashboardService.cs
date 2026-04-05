using Tracker.Application.DTOs.Dashboard;

namespace Tracker.Application.Interfaces
{
    /// <summary>
    /// Interface para o serviço de Dashboard que agrega dados para a aba Resumo
    /// </summary>
    public interface IDashboardService
    {
        /// <summary>
        /// Obtém o dashboard pessoal consolidado do usuário
        /// Inclui saudação, humor do dia, resumo de hábitos, desafios ativos e dados de contribuição
        /// </summary>
        /// <param name="userId">ID do usuário autenticado</param>
        /// <param name="cancellationToken">Token de cancelamento</param>
        /// <returns>Dashboard consolidado com todos os dados para a aba Resumo</returns>
        Task<DashboardResponse> GetPersonalDashboardAsync(Guid userId, CancellationToken cancellationToken = default);
    }
}
