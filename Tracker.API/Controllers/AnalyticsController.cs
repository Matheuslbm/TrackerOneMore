using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Tracker.API.Extensions;
using Tracker.Application.Interfaces;

namespace Tracker.API.Controllers;

/// <summary>
/// Controller que fornece análises e insights sobre tendências de humor e hábitos
/// </summary>
[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class AnalyticsController : ControllerBase
{
    private readonly IAnalyticsService _analyticsService;
    private readonly ILogger<AnalyticsController> _logger;

    /// <summary>
    /// Inicializa o controller de Analytics
    /// </summary>
    public AnalyticsController(IAnalyticsService analyticsService, ILogger<AnalyticsController> logger)
    {
        _analyticsService = analyticsService ?? throw new ArgumentNullException(nameof(analyticsService));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    /// <summary>
    /// GET /api/v1/analytics/mood-habit-trend
    /// Obtém análise de tendência semanal correlacionando humor e hábitos
    /// </summary>
    /// <param name="startDate">Data inicial (YYYY-MM-DD). Se não fornecida, retrocede 4 semanas</param>
    /// <param name="endDate">Data final (YYYY-MM-DD). Padrão: hoje</param>
    /// <param name="weeksBack">Alternativa: retroceder N semanas (1-52). Ignora startDate/endDate</param>
    /// <param name="cancellationToken">Token de cancelamento</param>
    /// <returns>Análise semanal com estatísticas e tendências</returns>
    /// <response code="200">Análise obtida com sucesso</response>
    /// <response code="400">Parâmetros inválidos</response>
    /// <response code="401">Usuário não autenticado</response>
    /// <response code="500">Erro interno do servidor</response>
    [HttpGet("mood-habit-trend")]
    public async Task<IActionResult> GetMoodHabitWeeklyTrend(
        [FromQuery] DateOnly? startDate,
        [FromQuery] DateOnly? endDate,
        [FromQuery] int? weeksBack,
        CancellationToken cancellationToken)
    {
        try
        {
            var userId = User.GetUserId();

            _logger.LogInformation(
                "Buscando análise de trending para usuário {UserId}. StartDate={StartDate}, EndDate={EndDate}, WeeksBack={WeeksBack}",
                userId, startDate, endDate, weeksBack);

            var result = weeksBack.HasValue
                ? await _analyticsService.GetWeeklyMoodHabitCorrelationAsync(userId, weeksBack.Value, cancellationToken)
                : await GetAnalyticsWithDates(userId, startDate, endDate, cancellationToken);

            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning("Parâmetros inválidos: {Message}", ex.Message);
            return BadRequest(new { error = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning("Acesso não autorizado: {Message}", ex.Message);
            return Unauthorized(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao buscar análise de trending");
            return StatusCode(
                StatusCodes.Status500InternalServerError,
                new { error = "Erro ao buscar análise de tendência" });
        }
    }

    /// <summary>
    /// Helper para construir as datas padrão (4 semanas se não especificado)
    /// </summary>
    private async Task<Application.DTOs.Analytics.MoodHabitWeeklyCorrelationResponse> GetAnalyticsWithDates(
        Guid userId,
        DateOnly? startDate,
        DateOnly? endDate,
        CancellationToken cancellationToken)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var finalEndDate = endDate ?? today;
        var finalStartDate = startDate ?? today.AddDays(-28); // 4 semanas padrão

        return await _analyticsService.GetWeeklyMoodHabitCorrelationAsync(
            userId,
            finalStartDate,
            finalEndDate,
            cancellationToken);
    }
}
