using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Tracker.Application.DTOs;
using Tracker.Application.Interfaces;
using Tracker.API.Extensions;

namespace Tracker.API.Controllers;

/// <summary>
/// Controller para gerenciar registro diário de humor
/// Todos os endpoints requerem autenticação JWT
/// </summary>
[Authorize]
[ApiController]
[Route("api/v1/moods")]
public class MoodController : ControllerBase
{
    private readonly IMoodService _moodService;
    private readonly ILogger<MoodController> _logger;

    public MoodController(
        IMoodService moodService,
        ILogger<MoodController> logger)
    {
        _moodService = moodService ?? throw new ArgumentNullException(nameof(moodService));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    /// <summary>
    /// Registrar ou atualizar humor do dia
    /// Se já existe um registro para essa data, atualiza; se não, cria novo
    /// </summary>
    /// <remarks>
    /// 🔐 UserId é extraído automaticamente do JWT claim
    /// </remarks>
    [HttpPost]
    [ProducesResponseType(typeof(MoodResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<MoodResponse>> LogMood(
        [FromBody] LogMoodRequest request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            // 🔐 CRÍTICO: Extrair UserId do JWT Claim
            var userId = User.GetUserId();

            var response = await _moodService.LogMoodAsync(userId, request, cancellationToken);

            _logger.LogInformation(
                "Usuário {UserId} registrou humor: {Level} em {Date}",
                userId, request.Level, request.Date);

            var dateString = response.Date.ToString("yyyy-MM-dd");
            return CreatedAtAction(nameof(GetMoodByDate),
                new { date = dateString }, response);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning("Validação falhou ao registrar humor: {Message}", ex.Message);
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao registrar humor");
            return StatusCode(500, new { error = "Erro ao registrar humor" });
        }
    }

    /// <summary>
    /// Obter humor de uma data específica
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(MoodResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<MoodResponse>> GetMoodByDate(
        [FromQuery] DateOnly date,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var userId = User.GetUserId();

            var mood = await _moodService.GetMoodByDateAsync(userId, date, cancellationToken);

            if (mood == null)
                return NotFound(new { error = "Nenhum registro de humor para esta data" });

            return Ok(mood);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao obter humor da data {Date}", date);
            return StatusCode(500, new { error = "Erro ao obter humor" });
        }
    }

    /// <summary>
    /// Obter histórico de humores em intervalo de datas
    /// Útil para gráficos e análises no dashboard
    /// </summary>
    [HttpGet("range")]
    [ProducesResponseType(typeof(IEnumerable<MoodResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<IEnumerable<MoodResponse>>> GetMoodsByDateRange(
        [FromQuery] DateOnly startDate,
        [FromQuery] DateOnly endDate,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var userId = User.GetUserId();

            var moods = await _moodService.GetMoodsByDateRangeAsync(
                userId, startDate, endDate, cancellationToken);

            return Ok(moods);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao obter humores do intervalo");
            return StatusCode(500, new { error = "Erro ao obter humores" });
        }
    }
}