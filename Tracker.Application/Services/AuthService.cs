using AutoMapper;
using BCrypt.Net;
using Microsoft.Extensions.Logging;
using Tracker.Application.DTOs;
using Tracker.Application.Interfaces;
using Tracker.Domain.Entities;
using Tracker.Domain.Interfaces.Repositories;

namespace Tracker.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly ITokenService _tokenService;
    private readonly IMapper _mapper;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        IUserRepository userRepository,
        ITokenService tokenService,
        IMapper mapper,
        ILogger<AuthService> logger)
    {
        _userRepository = userRepository ?? throw new ArgumentNullException(nameof(userRepository));
        _tokenService = tokenService ?? throw new ArgumentNullException(nameof(tokenService));
        _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task<AuthResponse> RegisterAsync(RegisterUserRequest request, CancellationToken cancellationToken = default)
    {
        ValidateRegisterRequest(request);

        var existingUser = await _userRepository.GetByEmailAsync(request.Email, cancellationToken);
        if (existingUser != null)
        {
            _logger.LogWarning("Tentativa de registro com email duplicado: {Email}", request.Email);
            throw new InvalidOperationException($"Um usuário com o email '{request.Email}' já existe.");
        }

        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(request.Password);
        var user = new User(request.Name, request.Email, hashedPassword);

        await _userRepository.AddAsync(user, cancellationToken);

        var (accessToken, refreshToken, expiresAt) = _tokenService.GenerateToken(user);

        _logger.LogInformation("Usuário registrado com sucesso: {UserId}", user.Id);

        var response = _mapper.Map<AuthResponse>(user);
        response.AccessToken = accessToken;
        response.RefreshToken = refreshToken;
        response.ExpiresAt = expiresAt;

        return response;
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default)
    {
        if (request == null)
            throw new ArgumentNullException(nameof(request));

        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            throw new InvalidOperationException("Email e senha são obrigatórios.");

        var user = await _userRepository.GetByEmailAsync(request.Email, cancellationToken)
            ?? throw new UnauthorizedAccessException("Email ou senha incorretos.");

        var isPasswordValid = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
        if (!isPasswordValid)
        {
            _logger.LogWarning("Falha de autenticação para email: {Email}", request.Email);
            throw new UnauthorizedAccessException("Email ou senha incorretos.");
        }

        var (accessToken, refreshToken, expiresAt) = _tokenService.GenerateToken(user);

        _logger.LogInformation("Login bem-sucedido para usuário: {UserId}", user.Id);

        var response = _mapper.Map<AuthResponse>(user);
        response.AccessToken = accessToken;
        response.RefreshToken = refreshToken;
        response.ExpiresAt = expiresAt;

        return response;
    }

    private static void ValidateRegisterRequest(RegisterUserRequest request)
    {
        if (request == null)
            throw new ArgumentNullException(nameof(request));

        if (string.IsNullOrWhiteSpace(request.Name))
            throw new InvalidOperationException("Nome é obrigatório.");

        if (string.IsNullOrWhiteSpace(request.Email))
            throw new InvalidOperationException("Email é obrigatório.");

        if (string.IsNullOrWhiteSpace(request.Password))
            throw new InvalidOperationException("Senha é obrigatória.");
    }
}
