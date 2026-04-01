using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Tracker.API.Extensions;
using Tracker.Application.DTOs;
using Tracker.Application.Interfaces;
using Tracker.Application.Services;
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

    [HttpPost("{habitId:guid}/log")]
    public async Task<IActionResult> LogHabit(
        Guid habitId,
        LogHabitRequest request,
        CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();

        try
        {
            var response = await _habitService.LogHabitAsync(habitId, userId, request, cancellationToken);
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
        catch (ArgumentException ex)
        {
            _logger.LogWarning("Validação falhou ao criar log: {Message}", ex.Message);
            return BadRequest(new { error = ex.Message });
        }
    }
}
