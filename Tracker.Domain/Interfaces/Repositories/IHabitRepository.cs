using Tracker.Domain.Entities;

namespace Tracker.Domain.Interfaces.Repositories;

public interface IHabitRepository
{
    // obter um hábito pelo seu ID.
    Task<Habit?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    // obter todos os hábitos de um usuario específico.
    Task<IEnumerable<Habit>> GetAllByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);

    // adicionar um novo hábito.
    Task AddAsync(Habit habit, CancellationToken cancellationToken = default);

    // atualizar um hábito existente.
    Task UpdateAsync(Habit habit, CancellationToken cancellationToken = default);

    // deletar um hábito.
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);

    // salva toda alteações no banco de dados.
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}