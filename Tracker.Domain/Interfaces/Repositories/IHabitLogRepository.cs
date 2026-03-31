using Tracker.Domain.Entities;

namespace Tracker.Domain.Interfaces.Repositories;

public interface IHabitLogRepository
{
    // adiciona um novo registro de log do hábito.
    Task AddAsync(HabitLog habitLog, CancellationToken cancellationToken = default);

    Task UpdateAsync(HabitLog habitLog, CancellationToken cancellationToken = default);

    //obtem todos os logs de um hábito específico ordenador por dat descendente
    Task<IEnumerable<HabitLog>> GetLogsByHabitIdAsync(Guid habitId, CancellationToken cancellationToken = default);

    // obtem o log de um hábito para uma data epecifica.
    Task<HabitLog?> GetLogByDateAsync(Guid habitId, DateOnly date, CancellationToken cancellationToken = default);

    // salva todas as alterações no banco de dados
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}