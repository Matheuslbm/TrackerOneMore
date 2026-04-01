namespace Tracker.Application.DTOs;

public class ChallengeResponse
{
    public required Guid Id { get; set; }
    public required Guid UserId { get; set; }
    public required string Title { get; set; }
    public required DateOnly StartDate { get; set; }
    public required DateOnly TargetEndDate { get; set; }
    public required bool IsActive { get; set; }
    public int DaysRemaining
    {
        get
        {
            var today = DateOnly.FromDateTime(DateTime.Today);
            return Math.Max(0, (TargetEndDate.ToDateTime(TimeOnly.MinValue) - today.ToDateTime(TimeOnly.MinValue)).Days);
        }
    }
}