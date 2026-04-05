using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Tracker.API.Extensions;
using Tracker.Application.Interfaces;

namespace Tracker.API.Controllers;

/// <summary>
/// Controller que fornece o Dashboard da aba Resumo (Leitura Pesada - BFF)
/// Agrega dados de múltiplas fontes em uma única chamada
/// </summary>
[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;
    private readonly ILogger<DashboardController> _logger;

    /// <summary>
    /// Inicializa o controller do Dashboard
    /// </summary>
    public DashboardController(IDashboardService dashboardService, ILogger<DashboardController> logger)
    {
        _dashboardService = dashboardService ?? throw new ArgumentNullException(nameof(dashboardService));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    /// <summary>
    /// GET /api/v1/dashboard
    /// Obtém o dashboard pessoal consolidado do usuário autenticado
    /// Retorna: saudação do dia, humor, resumo de hábitos, desafios ativos e dados de contribuição
    /// </summary>
    /// <param name="cancellationToken">Token de cancelamento</param>
    /// <returns>Dashboard completo com todos os dados para a aba Resumo</returns>
    /// <response code="200">Dashboard recuperado com sucesso</response>
    /// <response code="401">Usuário não autenticado</response>
    /// <response code="500">Erro interno do servidor</response>
    [HttpGet]
    public async Task<IActionResult> GetDashboard(CancellationToken cancellationToken)
    {
        try
        {
            var userId = User.GetUserId();

            _logger.LogInformation("Buscando dashboard para usuário {UserId}", userId);

            var dashboard = await _dashboardService.GetPersonalDashboardAsync(userId, cancellationToken);

            return Ok(dashboard);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning("Acesso não autorizado ao dashboard: {Message}", ex.Message);
            return Unauthorized(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao buscar dashboard");
            return StatusCode(
                StatusCodes.Status500InternalServerError,
                new { error = "Erro ao buscar o dashboard" });
        }
    }
}
