using Tracker.Application.DTOs;

namespace Tracker.Application.Interfaces;

public interface IChallengeService
{
    Task<ChallengeResponse> StartChallengeAsync(Guid userId, CreateChallengeRequest request, CancellationToken cancellationToken = default);
    Task<ChallengeResponse> UpdateChallengeAsync(Guid challengeId, Guid userId, UpdateChallengeRequest request, CancellationToken cancellationToken = default);
    Task DeleteChallengeAsync(Guid challengeId, Guid userId, CancellationToken cancellationToken = default);
    Task LogDailyChallengeAsync(Guid userId, Guid challengeId, LogChallengeRequest request, CancellationToken cancellationToken = default);
    Task ExtendChallengeAsync(Guid userId, Guid challengeId, int extraDays, CancellationToken cancellationToken = default);
    Task CompleteChallengeAsync(Guid userId, Guid challengeId, CancellationToken cancellationToken = default);
    Task<IEnumerable<ChallengeResponse>> GetActiveChallengesAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<ChallengeResponse?> GetChallengeAsync(Guid challengeId, CancellationToken cancellationToken = default);
}