using AutoMapper;
using Tracker.Application.DTOs;
using Tracker.Application.Interfaces;
using Tracker.Domain.Entities;
using Tracker.Domain.Interfaces.Repositories;

namespace Tracker.Application.Services;

public class ChallengeService : IChallengeService
{
    private readonly IChallengeRepository _challengeRepository;
    private readonly IChallengeDailyLogRepository _dailyLogRepository;
    private readonly IMapper _mapper;

    public ChallengeService(
        IChallengeRepository challengeRepository,
        IChallengeDailyLogRepository dailyLogRepository,
        IMapper mapper)
    {
        _challengeRepository = challengeRepository ?? throw new ArgumentNullException(nameof(challengeRepository));
        _dailyLogRepository = dailyLogRepository ?? throw new ArgumentNullException(nameof(dailyLogRepository));
        _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
    }

    public async Task<ChallengeResponse> StartChallengeAsync(Guid userId, CreateChallengeRequest request, CancellationToken cancellationToken = default)
    {
        ValidateCreateChallengeRequest(request);

        var challenge = new Challenge(userId, request.Title, request.InitialDaysDuration);

        await _challengeRepository.AddAsync(challenge, cancellationToken);

        var currentStreak = await CalculateCurrentStreakAsync(challenge.Id, cancellationToken);
        return MapChallengeToResponse(challenge, currentStreak);
    }

    public async Task LogDailyChallengeAsync(Guid userId, Guid challengeId, LogChallengeRequest request, CancellationToken cancellationToken = default)
    {
        var challenge = await _challengeRepository.GetByIdAsync(challengeId, cancellationToken);

        if (challenge == null)
            throw new InvalidOperationException("Desafio não encontrado.");
        if (challenge.UserId != userId)
            throw new UnauthorizedAccessException("Você não tem permissão para acessar este desafio.");
        if (!challenge.IsActive)
            throw new InvalidOperationException("Este desafio já foi concluído ou expirou.");

        var dailyLog = new ChallengeDailyLog(challengeId, request.Date, request.Difficulty, request.Survived);
        await _dailyLogRepository.AddAsync(dailyLog, cancellationToken);
    }

    public async Task ExtendChallengeAsync(
        Guid userId,
        Guid challengeId,
        int extraDays,
        CancellationToken cancellationToken = default)
    {
        if (extraDays <= 0)
            throw new ArgumentException("Dias extras devem ser maior que 0");

        var challenge = await _challengeRepository.GetByIdAsync(challengeId, cancellationToken);

        if (challenge == null)
            throw new InvalidOperationException("Desafio não encontrado");

        if (challenge.UserId != userId)
            throw new UnauthorizedAccessException("Este desafio não pertence a você");

        challenge.ExtendChallenge(extraDays);

        await _challengeRepository.UpdateAsync(challenge, cancellationToken);
    }

    public async Task CompleteChallengeAsync(
        Guid userId,
        Guid challengeId,
        CancellationToken cancellationToken = default)
    {
        var challenge = await _challengeRepository.GetByIdAsync(challengeId, cancellationToken);

        if (challenge == null)
            throw new InvalidOperationException("Desafio não encontrado");

        if (challenge.UserId != userId)
            throw new UnauthorizedAccessException("Este desafio não pertence a você");

        challenge.CompleteChallenge();

        await _challengeRepository.UpdateAsync(challenge, cancellationToken);
    }

    public async Task<IEnumerable<ChallengeResponse>> GetActiveChallengesAsync(
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        var challenges = await _challengeRepository.GetActiveChallengesByUserIdAsync(userId, cancellationToken);

        var response = new List<ChallengeResponse>();
        foreach (var challenge in challenges)
        {
            var currentStreak = await CalculateCurrentStreakAsync(challenge.Id, cancellationToken);
            response.Add(MapChallengeToResponse(challenge, currentStreak));
        }

        return response;
    }

    public async Task<ChallengeResponse?> GetChallengeAsync(
        Guid challengeId,
        CancellationToken cancellationToken = default)
    {
        var challenge = await _challengeRepository.GetByIdAsync(challengeId, cancellationToken);
        if (challenge == null)
            return null;

        var currentStreak = await CalculateCurrentStreakAsync(challengeId, cancellationToken);
        return MapChallengeToResponse(challenge, currentStreak);
    }

    public async Task<ChallengeResponse> UpdateChallengeAsync(
        Guid challengeId,
        Guid userId,
        UpdateChallengeRequest request,
        CancellationToken cancellationToken = default)
    {
        ValidateUpdateChallengeRequest(request);

        var challenge = await _challengeRepository.GetByIdAsync(challengeId, cancellationToken)
            ?? throw new InvalidOperationException("Desafio não encontrado.");

        if (challenge.UserId != userId)
            throw new UnauthorizedAccessException("Você não tem permissão para acessar este desafio.");

        challenge.Update(request.Title);
        await _challengeRepository.UpdateAsync(challenge, cancellationToken);

        var currentStreak = await CalculateCurrentStreakAsync(challengeId, cancellationToken);
        return MapChallengeToResponse(challenge, currentStreak);
    }

    public async Task DeleteChallengeAsync(
        Guid challengeId,
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        var challenge = await _challengeRepository.GetByIdAsync(challengeId, cancellationToken)
            ?? throw new InvalidOperationException("Desafio não encontrado.");

        if (challenge.UserId != userId)
            throw new UnauthorizedAccessException("Você não tem permissão para acessar este desafio.");

        await _challengeRepository.DeleteAsync(challengeId, cancellationToken);
    }

    private static void ValidateCreateChallengeRequest(CreateChallengeRequest request)
    {
        if (request == null)
            throw new ArgumentNullException(nameof(request));

        if (string.IsNullOrWhiteSpace(request.Title))
            throw new ArgumentException("Título é obrigatório", nameof(request.Title));

        if (request.InitialDaysDuration <= 0 || request.InitialDaysDuration > 365)
            throw new ArgumentException("Duração deve estar entre 1 e 365 dias", nameof(request.InitialDaysDuration));
    }

    private static void ValidateUpdateChallengeRequest(UpdateChallengeRequest request)
    {
        if (request == null)
            throw new ArgumentNullException(nameof(request));

        if (string.IsNullOrWhiteSpace(request.Title))
            throw new ArgumentException("Título é obrigatório", nameof(request.Title));
    }

    public async Task<int> CalculateCurrentStreakAsync(
        Guid challengeId,
        CancellationToken cancellationToken = default)
    {
        var logs = await _dailyLogRepository.GetByChallengeIdAsync(challengeId, cancellationToken);

        if (!logs.Any())
        {
            return 0;
        }

        // Ordenar logs por data em ordem decrescente (mais recentes primeiro)
        var sortedLogs = logs.OrderByDescending(l => l.Date).ToList();

        int streak = 0;
        var expectedDate = sortedLogs.First().Date; // Começar pela data mais recente

        // Contar dias consecutivos de trás para frente
        foreach (var log in sortedLogs)
        {
            // Se o log não é do dia esperado, a sequência quebra
            if (log.Date != expectedDate)
            {
                break;
            }

            // Só contar se sobreviveu ao dia
            if (log.Survived)
            {
                streak++;
                expectedDate = expectedDate.AddDays(-1);
            }
            else
            {
                // Se não sobreviveu, a sequência quebra
                break;
            }
        }

        return streak;
    }

    private ChallengeResponse MapChallengeToResponse(Challenge challenge, int currentStreak)
    {
        var response = _mapper.Map<ChallengeResponse>(challenge);
        response.CurrentStreak = currentStreak;
        return response;
    }
}