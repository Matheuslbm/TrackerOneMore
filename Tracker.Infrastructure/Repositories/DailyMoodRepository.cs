using Microsoft.EntityFrameworkCore;
using Tracker.Domain.Entities;
using Tracker.Domain.Interfaces.Repositories;
using Tracker.Infrastructure.Data;

namespace Tracker.Infrastructure.Repositories;

public class DailyMoodRepository : IDailyMoodRepository
{
    private readonly ApplicationDbContext _context;

    public DailyMoodRepository(ApplicationDbContext context)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
    }

    public async Task AddAsync(DailyMood mood, CancellationToken cancellationToken = default)
    {
        if (mood == null)
            throw new ArgumentNullException(nameof(mood));

        _context.DailyMoods.Add(mood);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task AddOrUpdateAsync(DailyMood mood, CancellationToken cancellationToken = default)
    {
        if (mood == null)
            throw new ArgumentNullException(nameof(mood));

        // Procurar por registro existente
        var existingMood = await _context.DailyMoods
            .FirstOrDefaultAsync(
                m => m.UserId == mood.UserId && m.Date == mood.Date,
                cancellationToken);

        // Se existe, remover
        if (existingMood != null)
        {
            _context.DailyMoods.Remove(existingMood);
            await _context.SaveChangesAsync(cancellationToken);
        }

        // Adicionar novo
        _context.DailyMoods.Add(mood);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<DailyMood?> GetByDateAsync(Guid userId, DateOnly date, CancellationToken cancellationToken = default)
    {
        return await _context.DailyMoods
            .AsNoTracking()
            .FirstOrDefaultAsync(m => m.UserId == userId && m.Date == date, cancellationToken);
    }

    public async Task<IEnumerable<DailyMood>> GetMoodsByDateRangeAsync(Guid userId, DateOnly startDate, DateOnly endDate, CancellationToken cancellationToken = default)
    {
        return await _context.DailyMoods
            .AsNoTracking()
            .Where(m => m.UserId == userId && m.Date >= startDate && m.Date <= endDate)
            .OrderBy(m => m.Date)
            .ToListAsync(cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var mood = await _context.DailyMoods.FindAsync(new object[] { id }, cancellationToken);
        if (mood != null)
        {
            _context.DailyMoods.Remove(mood);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}