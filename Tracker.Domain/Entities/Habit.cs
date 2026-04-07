using Tracker.Domain.Enums;

namespace Tracker.Domain.Entities;

public class Habit : BaseEntity
{
    public Guid UserId { get; private set; }
    public string Name { get; private set; }
    public HabitType Type { get; private set; }

    // se for WeeklyTarget, quantas vezes na semana? (ex 3). Para Daily é sempre 7.
    public int? TargetDaysPerWeek { get; private set; }

    // Calculado automaticamente: 7 - TargetDaysPerWeek. Se TargetDaysPerWeek == 7, recebe 1 GraceDay de bônus.
    public int GraceDaysAllowed { get; private set; }

    // Navegação do EF Core
    public ICollection<HabitLog> Logs { get; private set; } = new List<HabitLog>();

    public Habit(Guid userId, string name, HabitType type, int? targetDaysPerWeek)
    {
        UserId = userId;
        Name = name;
        Type = type;
        TargetDaysPerWeek = targetDaysPerWeek;
        
        // Calcular GraceDaysAllowed automaticamente
        GraceDaysAllowed = CalculateGraceDaysAllowed(type, targetDaysPerWeek);
    }

    /// <summary>
    /// Atualiza os dados do hábito. O GraceDaysAllowed é recalculado automaticamente.
    /// </summary>
    public void Update(string name, HabitType type, int? targetDaysPerWeek)
    {
        Name = name;
        Type = type;
        TargetDaysPerWeek = targetDaysPerWeek;
        
        // Recalcular GraceDaysAllowed automaticamente
        GraceDaysAllowed = CalculateGraceDaysAllowed(type, targetDaysPerWeek);
    }

    /// <summary>
    /// Calcula a quantidade de Curingas (GraceDay) permitidos por semana.
    /// Fórmula: 7 - TargetDaysPerWeek
    /// Exceção: Se o hábito for Diário (7 dias/semana), o usuário ganha 1 GraceDay de bônus.
    /// </summary>
    private static int CalculateGraceDaysAllowed(HabitType type, int? targetDaysPerWeek)
    {
        // Se for Daily (Diário), o sistema assume 7 dias/semana + 1 bônus
        if (type == HabitType.Daily)
            return 1;

        // Se for WeeklyTarget, usar a fórmula: 7 - TargetDaysPerWeek
        if (targetDaysPerWeek.HasValue && targetDaysPerWeek.Value >= 1 && targetDaysPerWeek.Value <= 7)
        {
            return targetDaysPerWeek.Value == 7 ? 1 : 7 - targetDaysPerWeek.Value;
        }

        // Fallback: nenhum GraceDay
        return 0;
    }
}