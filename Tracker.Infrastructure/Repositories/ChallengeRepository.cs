using Microsoft.EntityFrameworkCore;
using Tracker.Domain.Entities;
using Tracker.Domain.Interfaces.Repositories;
using Tracker.Infrastructure.Data;

namespace Tracker.Infrastructure.Repositories;

public class ChallengeRepository : IChallengeRepository
{
    private readonly ApplicationDbContext _context;

    public ChallengeRepository(ApplicationDbContext context)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
    }

    public async Task AddAsync(Challenge challenge, CancellationToken cancellationToken = default)
    {
        if (challenge == null)
            throw new ArgumentNullException(nameof(challenge));

        _context.Challenges.Add(challenge);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<Challenge?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Challenges
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
    }

    public async Task<IEnumerable<Challenge>> GetActiveChallengesByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await _context.Challenges
            .AsNoTracking()
            .Where(c => c.UserId == userId && c.IsActive)
            .OrderByDescending(c => c.StartDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Challenge>> GetAllChallengesByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await _context.Challenges
            .AsNoTracking()
            .Where(c => c.UserId == userId)
            .OrderByDescending(c => c.StartDate)
            .ToListAsync(cancellationToken);
    }

    public async Task UpdateAsync(Challenge challenge, CancellationToken cancellationToken = default)
    {
        if (challenge == null)
            throw new ArgumentNullException(nameof(challenge));

        _context.Challenges.Update(challenge);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var challenge = await _context.Challenges.FindAsync(new object[] { id }, cancellationToken);
        if (challenge != null)
        {
            _context.Challenges.Remove(challenge);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}