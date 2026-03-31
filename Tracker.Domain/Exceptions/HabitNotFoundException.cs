namespace Tracker.Domain.Exceptions;

public class HabitNotFoundException : Exception
{
    public Guid HabitId { get; }

    public HabitNotFoundException(Guid habitId)
        : base($"Hábito com ID {habitId} não encontrado.")
    {
        HabitId = habitId;
    }
}
