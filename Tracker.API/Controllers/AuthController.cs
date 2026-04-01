using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Tracker.Application.DTOs;
using Tracker.Application.Interfaces;

namespace Tracker.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(IAuthService authService, ILogger<AuthController> logger)
    {
        _authService = authService ?? throw new ArgumentNullException(nameof(authService));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(
        RegisterUserRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var response = await _authService.RegisterAsync(request, cancellationToken);
            return Created(string.Empty, response);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Erro ao registrar usuário: {Message}", ex.Message);
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(
        LoginRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var response = await _authService.LoginAsync(request, cancellationToken);
            return Ok(response);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning("Tentativa de login não autorizado: {Message}", ex.Message);
            return Unauthorized(new { error = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Erro ao fazer login: {Message}", ex.Message);
            return BadRequest(new { error = ex.Message });
        }
    }
}
