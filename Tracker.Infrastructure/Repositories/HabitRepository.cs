using Microsoft.EntityFrameworkCore;
using Tracker.Domain.Entities;
using Tracker.Domain.Interfaces.Repositories;
using Tracker.Infrastructure.Data;

namespace Tracker.Infrastructure.Repositories;

public class HabitRepository : IHabitRepository
{
    private readonly ApplicationDbContext _dbContext;

    public HabitRepository(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
    }

    public async Task<Habit?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Habits
            .AsNoTracking()
            .FirstOrDefaultAsync(h => h.Id == id, cancellationToken);
    }

    public async Task<IEnumerable<Habit>> GetAllByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Habits
            .AsNoTracking()
            .Where(h => h.UserId == userId)
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(Habit habit, CancellationToken cancellationToken = default)
    {
        if (habit == null)
            throw new ArgumentNullException(nameof(habit));

        await _dbContext.Habits.AddAsync(habit, cancellationToken);
        await SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(Habit habit, CancellationToken cancellationToken = default)
    {
        if (habit == null)
            throw new ArgumentNullException(nameof(habit));

        _dbContext.Habits.Update(habit);
        await SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var habit = await _dbContext.Habits.FindAsync(new object[] { id }, cancellationToken);
        if (habit != null)
        {
            _dbContext.Habits.Remove(habit);
            await SaveChangesAsync(cancellationToken);
        }
    }

    public async Task SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        await _dbContext.SaveChangesAsync(cancellationToken);
    }
}