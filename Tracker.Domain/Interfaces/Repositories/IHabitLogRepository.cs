using Tracker.Domain.Entities;
using Tracker.Domain.Enums;

namespace Tracker.Domain.Interfaces.Repositories;

public interface IHabitLogRepository
{
    // adiciona um novo registro de log do hábito.
    Task AddAsync(HabitLog habitLog, CancellationToken cancellationToken = default);

    Task UpdateAsync(HabitLog habitLog, CancellationToken cancellationToken = default);

    Task DeleteByDateAsync(Guid habitId, DateOnly date, CancellationToken cancellationToken = default);

    //obtem todos os logs de um hábito específico ordenador por dat descendente
    Task<IEnumerable<HabitLog>> GetLogsByHabitIdAsync(Guid habitId, CancellationToken cancellationToken = default);

    // obtem o log de um hábito para uma data epecifica.
    Task<HabitLog?> GetLogByDateAsync(Guid habitId, DateOnly date, CancellationToken cancellationToken = default);

    /// <summary>
    /// Conta quantos logs com um status específico existem em um período de datas.
    /// Utilizado para validar a cota de GraceDays permitida por semana.
    /// </summary>
    Task<int> CountLogsByStatusInPeriodAsync(
        Guid habitId,
        LogStatus status,
        DateOnly startDate,
        DateOnly endDate,
        CancellationToken cancellationToken = default);

    // salva todas as alterações no banco de dados
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}