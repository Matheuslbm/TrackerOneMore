using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Tracker.Application.DTOs;
using Tracker.Application.Interfaces;
using Tracker.API.Extensions;

namespace Tracker.API.Controllers;

/// <summary>
/// Controller para gerenciar desafios (limpeza de vícios)
/// Todos os endpoints requerem autenticação JWT
/// </summary>
[Authorize]
[ApiController]
[Route("api/v1/challenges")]
public class ChallengesController : ControllerBase
{
    private readonly IChallengeService _challengeService;
    private readonly ILogger<ChallengesController> _logger;

    public ChallengesController(
        IChallengeService challengeService,
        ILogger<ChallengesController> logger)
    {
        _challengeService = challengeService ?? throw new ArgumentNullException(nameof(challengeService));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    /// <summary>
    /// Criar novo desafio para o usuário autenticado
    /// </summary>
    /// <remarks>
    /// 🔐 UserId é extraído automaticamente do JWT claim
    /// </remarks>
    [HttpPost]
    [ProducesResponseType(typeof(ChallengeResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<ChallengeResponse>> CreateChallenge(
        [FromBody] CreateChallengeRequest request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            // 🔐 CRÍTICO: Extrair UserId do JWT Claim, NUNCA do payload da requisição
            var userId = User.GetUserId();

            var response = await _challengeService.StartChallengeAsync(userId, request, cancellationToken);

            _logger.LogInformation(
                "Challenge created successfully. UserId={UserId}, ChallengeId={ChallengeId}, Title={Title}, Duration={Days}, TargetEndDate={TargetDate}",
                userId, response.Id, request.Title, request.InitialDaysDuration, response.TargetEndDate);

            return CreatedAtAction(nameof(GetChallenge), new { id = response.Id }, response);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning("Validação falhou ao criar desafio: {Message}", ex.Message);
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao criar desafio");
            return StatusCode(500, new { error = "Erro ao criar desafio" });
        }
    }

    /// <summary>
    /// Obter desafios ativos do usuário
    /// </summary>
    [HttpGet("active")]
    [ProducesResponseType(typeof(IEnumerable<ChallengeResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<IEnumerable<ChallengeResponse>>> GetActiveChallenges(
        CancellationToken cancellationToken = default)
    {
        try
        {
            var userId = User.GetUserId();

            var challenges = await _challengeService.GetActiveChallengesAsync(userId, cancellationToken);

            return Ok(challenges);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao obter desafios ativos");
            return StatusCode(500, new { error = "Erro ao obter desafios" });
        }
    }

    /// <summary>
    /// Obter um desafio específico
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ChallengeResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<ChallengeResponse>> GetChallenge(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var userId = User.GetUserId();
            var challenge = await _challengeService.GetChallengeAsync(id, cancellationToken);

            if (challenge == null)
                return NotFound(new { error = "Desafio não encontrado" });

            if (challenge.UserId != userId)
                return Forbid();

            return Ok(challenge);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao obter desafio {ChallengeId}", id);
            return StatusCode(500, new { error = "Erro ao obter desafio" });
        }
    }

    /// <summary>
    /// Registrar progresso diário de um desafio
    /// </summary>
    [HttpPost("{id}/log")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> LogDailyChallenge(
        Guid id,
        [FromBody] LogChallengeRequest request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var userId = User.GetUserId();

            await _challengeService.LogDailyChallengeAsync(userId, id, request, cancellationToken);

            _logger.LogInformation(
                "Usuário {UserId} registrou progresso no desafio {ChallengeId}",
                userId, id);

            return NoContent();
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning("Acesso negado: {Message}", ex.Message);
            return Forbid();
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Operação inválida: {Message}", ex.Message);
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao registrar progresso do desafio");
            return StatusCode(500, new { error = "Erro ao registrar progresso" });
        }
    }

    /// <summary>
    /// Estender desafio por X dias adicionais
    /// </summary>
    [HttpPut("{id}/extend")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ExtendChallenge(
        Guid id,
        [FromBody] ExtendChallengeRequest request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var userId = User.GetUserId();

            await _challengeService.ExtendChallengeAsync(userId, id, request.ExtraDays, cancellationToken);

            _logger.LogInformation(
                "Usuário {UserId} estendeu desafio {ChallengeId} por {Days} dias",
                userId, id, request.ExtraDays);

            return NoContent();
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao estender desafio");
            return StatusCode(500, new { error = "Erro ao estender desafio" });
        }
    }

    /// <summary>
    /// Completar desafio (marcar como inativo)
    /// </summary>
    [HttpPut("{id}/complete")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> CompleteChallenge(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var userId = User.GetUserId();

            await _challengeService.CompleteChallengeAsync(userId, id, cancellationToken);

            _logger.LogInformation("Usuário {UserId} completou desafio {ChallengeId}", userId, id);

            return NoContent();
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao completar desafio");
            return StatusCode(500, new { error = "Erro ao completar desafio" });
        }
    }
}

public class ExtendChallengeRequest
{
    public int ExtraDays { get; set; }
}