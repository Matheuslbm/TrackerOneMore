using Tracker.Domain.Enums;

namespace Tracker.Domain.Entities;
public class ChallengeDailyLog : BaseEntity
{
    public Guid ChallengeId { get; private set; }
    public DateOnly Date { get; private set; }
    public ChallengeDifficulty Difficulty { get; private set; }
    public bool Survived { get; private set; }


    public ChallengeDailyLog(Guid challengeId, DateOnly date, ChallengeDifficulty difficulty, bool survived)
    {
        ChallengeId = challengeId;
        Date = date;
        Difficulty = difficulty;
        Survived = survived;
    }
}