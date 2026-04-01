using Tracker.Domain.Entities;

namespace Tracker.Domain.Interfaces.Repositories;

/// <summary>
/// Repository para registros diários de progresso de Challenge
/// </summary>
public interface IChallengeDailyLogRepository
{
    /// <summary>
    /// Adicionar novo registro de progresso diário
    /// </summary>
    Task AddAsync(ChallengeDailyLog log, CancellationToken cancellationToken = default);

    /// <summary>
    /// Obter logs de progresso de um desafio específico
    /// </summary>
    Task<IEnumerable<ChallengeDailyLog>> GetByChallengeIdAsync(
        Guid challengeId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Obter progresso de uma data específica
    /// </summary>
    Task<ChallengeDailyLog?> GetByDateAsync(
        Guid challengeId,
        DateOnly date,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletar registro
    /// </summary>
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
