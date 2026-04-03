namespace Tracker.Domain.Exceptions;

public class ChallengeNotFoundException : Exception
{
    public Guid ChallengeId { get; }

    public ChallengeNotFoundException(Guid challengeId)
        : base($"Desafio com ID {challengeId} não encontrado.")
    {
        ChallengeId = challengeId;
    }
}
