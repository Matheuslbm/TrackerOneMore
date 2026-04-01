using Microsoft.EntityFrameworkCore;
using Tracker.Domain.Entities;
using Tracker.Domain.Interfaces.Repositories;
using Tracker.Infrastructure.Data;

namespace Tracker.Infrastructure.Repositories;

/// <summary>
/// Implementação do repository para ChallengeDailyLog
/// </summary>
public class ChallengeDailyLogRepository : IChallengeDailyLogRepository
{
    private readonly ApplicationDbContext _context;

    public ChallengeDailyLogRepository(ApplicationDbContext context)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
    }

    public async Task AddAsync(ChallengeDailyLog log, CancellationToken cancellationToken = default)
    {
        if (log == null)
            throw new ArgumentNullException(nameof(log));

        _context.ChallengeDailyLogs.Add(log);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<IEnumerable<ChallengeDailyLog>> GetByChallengeIdAsync(
        Guid challengeId,
        CancellationToken cancellationToken = default)
    {
        return await _context.ChallengeDailyLogs
            .AsNoTracking()
            .Where(log => log.ChallengeId == challengeId)
            .OrderBy(log => log.Date)
            .ToListAsync(cancellationToken);
    }

    public async Task<ChallengeDailyLog?> GetByDateAsync(
        Guid challengeId,
        DateOnly date,
        CancellationToken cancellationToken = default)
    {
        return await _context.ChallengeDailyLogs
            .AsNoTracking()
            .FirstOrDefaultAsync(
                log => log.ChallengeId == challengeId && log.Date == date,
                cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var log = await _context.ChallengeDailyLogs.FindAsync(new object[] { id }, cancellationToken);

        if (log != null)
        {
            _context.ChallengeDailyLogs.Remove(log);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}
