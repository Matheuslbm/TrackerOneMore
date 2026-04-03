namespace Tracker.Domain.Entities;

public class Challenge : BaseEntity
{
    public Guid UserId { get; private set; }
    public string Title { get; private set; } = null!;
    public DateOnly StartDate { get; private set; }
    public DateOnly TargetEndDate { get; private set; }
    public bool IsActive { get; private set; }

    public Challenge() { }
    public Challenge(Guid userId, string title, int initialDaysDuration)
    {
        UserId = userId;
        Title = title;
        StartDate = DateOnly.FromDateTime(DateTime.UtcNow);
        TargetEndDate = StartDate.AddDays(initialDaysDuration);
        IsActive = true;
    }

    public void ExtendChallenge(int extraDays)
    {
        TargetEndDate = TargetEndDate.AddDays(extraDays);
    }

    public void CompleteChallenge()
    {
        IsActive = false;
        // aqui pode disparar evento de dominio para conceder emblema
    }

    /// <summary>
    /// Atualiza o título do desafio
    /// </summary>
    public void Update(string title)
    {
        Title = title;
    }
}