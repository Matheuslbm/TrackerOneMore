using Tracker.Domain.Enums;

namespace Tracker.Domain.Entities;

public class HabitLog : BaseEntity
{
    public Guid HabitId { get; private set; }
    public DateOnly Date { get; private set; }
    public LogStatus Status { get; private set; }

    public HabitLog(Guid habitId, DateOnly date, LogStatus status)
    {
        HabitId = habitId;
        Date = date;
        Status = status;
    }

    // metodo para permitir a mudança caso vc clique duas vezes para o quadrado roxo
    public void ChangeStatus(LogStatus newStatus)
    {
        Status = newStatus;
    }
}