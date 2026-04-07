using Microsoft.EntityFrameworkCore;
using Tracker.Domain.Entities;
using Tracker.Domain.Interfaces.Repositories;
using Tracker.Infrastructure.Data;

namespace Tracker.Infrastructure.Repositories;

public class HabitLogRepository : IHabitLogRepository
{
    private readonly ApplicationDbContext _dbContext;

    public HabitLogRepository(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
    }

    public async Task AddAsync(HabitLog habitLog, CancellationToken cancellationToken = default)
    {
        if (habitLog == null)
            throw new ArgumentNullException(nameof(habitLog));

        await _dbContext.HabitLogs.AddAsync(habitLog, cancellationToken);
        await SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(HabitLog habitLog, CancellationToken cancellationToken = default)
    {
        if (habitLog == null)
            throw new ArgumentNullException(nameof(habitLog));

        _dbContext.HabitLogs.Update(habitLog);
        await SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteByDateAsync(Guid habitId, DateOnly date, CancellationToken cancellationToken = default)
    {
        var habitLog = await GetLogByDateAsync(habitId, date, cancellationToken);
        if (habitLog != null)
        {
            _dbContext.HabitLogs.Remove(habitLog);
            await SaveChangesAsync(cancellationToken);
        }
    }

    public async Task<IEnumerable<HabitLog>> GetLogsByHabitIdAsync(Guid habitId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.HabitLogs
            .AsNoTracking()
            .Where(log => log.HabitId == habitId)
            .OrderByDescending(log => log.Date)
            .ToListAsync(cancellationToken);
    }

    public async Task<HabitLog?> GetLogByDateAsync(Guid habitId, DateOnly date, CancellationToken cancellationToken = default)
    {
        return await _dbContext.HabitLogs
            .AsNoTracking()
            .FirstOrDefaultAsync(log => log.HabitId == habitId && log.Date == date, cancellationToken);
    }

    public async Task SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        await _dbContext.SaveChangesAsync(cancellationToken);
    }
}