using Tracker.Domain.Enums;

namespace Tracker.Domain.Entities;

public class Habit : BaseEntity
{
    public Guid UserId { get; private set; }
    public string Name { get; private set; }
    public HabitType Type { get; private set; }

    // se for WeeklyTarget, quantas vezes na semana? (ex 3)
    public int? TargetDaysPerWeek { get; private set; }

    // quantos quadrados roos ele tem direito
    public int GraceDaysAllowed { get; private set; }

    // Navegação do EF Core
    public ICollection<HabitLog> Logs { get; private set; } = new List<HabitLog>();

    public Habit(Guid userId, string name, HabitType type, int? targetDaysPerWeek, int graceDaysAllowed)
    {
        UserId = userId;
        Name = name;
        Type = type;
        TargetDaysPerWeek = targetDaysPerWeek;
        GraceDaysAllowed = graceDaysAllowed;
    }

    /// <summary>
    /// Atualiza os dados do hábito
    /// </summary>
    public void Update(string name, HabitType type, int? targetDaysPerWeek, int graceDaysAllowed)
    {
        Name = name;
        Type = type;
        TargetDaysPerWeek = targetDaysPerWeek;
        GraceDaysAllowed = graceDaysAllowed;
    }
}