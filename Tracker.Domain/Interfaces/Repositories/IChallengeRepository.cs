using Tracker.Domain.Entities;

namespace Tracker.Domain.Interfaces.Repositories;

public interface IChallengeRepository
{
    Task AddAsync(Challenge challenge, CancellationToken cancellationToken = default);
    Task<Challenge?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<Challenge>> GetActiveChallengesByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<IEnumerable<Challenge>> GetAllChallengesByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
    Task UpdateAsync(Challenge challenge, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}