using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Tracker.API.Extensions;
using Tracker.Application.DTOs;
using Tracker.Application.Interfaces;
using Tracker.Application.Services;
using Tracker.Domain.Enums;
using Tracker.Domain.Exceptions;

namespace Tracker.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class HabitsController : ControllerBase
{
    private readonly IHabitService _habitService;
    private readonly ILogger<HabitsController> _logger;

    public HabitsController(IHabitService habitService, ILogger<HabitsController> logger)
    {
        _habitService = habitService ?? throw new ArgumentNullException(nameof(habitService));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    [HttpPost]
    public async Task<IActionResult> CreateHabit(
        CreateHabitRequest request,
        CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();

        try
        {
            var response = await _habitService.CreateHabitAsync(userId, request, cancellationToken);
            _logger.LogInformation("Hábito criado para usuário {UserId}: {HabitId}", userId, response.Id);
            return Created(string.Empty, response);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning("Validação falhou ao criar hábito: {Message}", ex.Message);
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet]
    public async Task<IActionResult> GetUserHabits(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var userId = User.GetUserId();

        try
        {
            var habits = await _habitService.GetUserHabitsAsync(userId, pageNumber, pageSize, cancellationToken);
            _logger.LogInformation("Hábitos recuperados para usuário {UserId}: página {PageNumber}", userId, pageNumber);
            return Ok(habits);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning("Validação falhou ao listar hábitos: {Message}", ex.Message);
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("logs/week")]
    public async Task<IActionResult> GetWeeklyHabitLogs(
        [FromQuery] DateOnly startDate,
        [FromQuery] DateOnly endDate,
        CancellationToken cancellationToken = default)
    {
        var userId = User.GetUserId();

        try
        {
            var logs = await _habitService.GetWeeklyHabitLogsAsync(userId, startDate, endDate, cancellationToken);
            _logger.LogInformation("Logs da semana recuperados para usuário {UserId}: {StartDate} a {EndDate}", userId, startDate, endDate);
            return Ok(logs);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao buscar logs da semana");
            return StatusCode(500, new { error = "Erro ao buscar logs da semana" });
        }
    }

    [HttpGet("{habitId:guid}/log")]
    public async Task<IActionResult> GetHabitLogByDate(
        Guid habitId,
        [FromQuery] DateOnly date,
        CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();

        try
        {
            var logStatus = await _habitService.GetHabitLogByDateAsync(habitId, userId, date, cancellationToken);
            _logger.LogInformation("Log do hábito {HabitId} para {Date} recuperado", habitId, date);
            return Ok(new { status = logStatus });
        }
        catch (HabitNotFoundException ex)
        {
            _logger.LogWarning("Hábito não encontrado: {HabitId}", habitId);
            return NotFound(new { error = ex.Message });
        }
        catch (UnauthorizedAccessException)
        {
            _logger.LogWarning("Usuário {UserId} tentou acessar hábito de outro usuário: {HabitId}", userId, habitId);
            return Forbid();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao buscar log do hábito");
            return StatusCode(500, new { error = "Erro ao buscar log" });
        }
    }

    [HttpPost("{habitId:guid}/log")]
    public async Task<IActionResult> LogHabit(
        Guid habitId,
        [FromBody] LogHabitStringRequest request,
        CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();

        try
        {
            // Mapear string para LogStatus enum
            var logStatus = request.Status switch
            {
                "Completed" => LogStatus.Completed,
                "Grace" => LogStatus.GraceDay,
                "Missed" => LogStatus.Missed,
                _ => throw new ArgumentException($"Status inválido: {request.Status}")
            };

            var logRequest = new LogHabitRequest
            {
                Date = request.Date,
                Status = logStatus
            };

            var response = await _habitService.LogHabitAsync(habitId, userId, logRequest, cancellationToken);
            _logger.LogInformation("Log criado para hábito {HabitId} do usuário {UserId}", habitId, userId);
            return Ok(response);
        }
        catch (HabitNotFoundException ex)
        {
            _logger.LogWarning("Hábito não encontrado: {HabitId}", habitId);
            return NotFound(new { error = ex.Message });
        }
        catch (UnauthorizedAccessException)
        {
            _logger.LogWarning("Usuário {UserId} tentou acessar hábito de outro usuário: {HabitId}", userId, habitId);
            return Forbid();
        }
        catch (DomainException ex)
        {
            // ✋ Cota excedida: retorna 400 com mensagem, frontend não marca o dia
            _logger.LogWarning("Regra de negócio violada ao logar hábito: {Message}", ex.Message);
            return BadRequest(new { error = ex.Message });
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning("Validação falhou ao criar log: {Message}", ex.Message);
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro inesperado ao registrar log do hábito");
            return StatusCode(500, new { error = "Erro ao registrar log" });
        }
    }

    [HttpDelete("{habitId:guid}/log")]
    public async Task<IActionResult> DeleteHabitLog(
        Guid habitId,
        [FromQuery] DateOnly date,
        CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();

        try
        {
            await _habitService.DeleteHabitLogAsync(habitId, userId, date, cancellationToken);
            _logger.LogInformation("Log do hábito {HabitId} para {Date} deletado", habitId, date);
            return NoContent();
        }
        catch (HabitNotFoundException ex)
        {
            _logger.LogWarning("Hábito não encontrado: {HabitId}", habitId);
            return NotFound(new { error = ex.Message });
        }
        catch (UnauthorizedAccessException)
        {
            _logger.LogWarning("Usuário {UserId} tentou acessar hábito de outro usuário: {HabitId}", userId, habitId);
            return Forbid();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao deletar log do hábito");
            return StatusCode(500, new { error = "Erro ao deletar log" });
        }
    }

    [HttpPut("{habitId:guid}")]
    public async Task<IActionResult> UpdateHabit(
        Guid habitId,
        UpdateHabitRequest request,
        CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();

        try
        {
            var response = await _habitService.UpdateHabitAsync(habitId, userId, request, cancellationToken);
            _logger.LogInformation("Hábito {HabitId} atualizado para usuário {UserId}", habitId, userId);
            return Ok(response);
        }
        catch (HabitNotFoundException ex)
        {
            _logger.LogWarning("Hábito não encontrado: {HabitId}", habitId);
            return NotFound(new { error = ex.Message });
        }
        catch (UnauthorizedAccessException)
        {
            _logger.LogWarning("Usuário {UserId} tentou atualizar hábito de outro usuário: {HabitId}", userId, habitId);
            return Forbid();
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning("Validação falhou ao atualizar hábito: {Message}", ex.Message);
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpDelete("{habitId:guid}")]
    public async Task<IActionResult> DeleteHabit(
        Guid habitId,
        CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();

        try
        {
            await _habitService.DeleteHabitAsync(habitId, userId, cancellationToken);
            _logger.LogInformation("Hábito {HabitId} deletado para usuário {UserId}", habitId, userId);
            return NoContent();
        }
        catch (HabitNotFoundException ex)
        {
            _logger.LogWarning("Hábito não encontrado: {HabitId}", habitId);
            return NotFound(new { error = ex.Message });
        }
        catch (UnauthorizedAccessException)
        {
            _logger.LogWarning("Usuário {UserId} tentou deletar hábito de outro usuário: {HabitId}", userId, habitId);
            return Forbid();
        }
    }
}
