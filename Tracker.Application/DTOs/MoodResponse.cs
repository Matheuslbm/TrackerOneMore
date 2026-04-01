using Tracker.Domain.Enums;

namespace Tracker.Application.DTOs;

public class MoodResponse
{
    public required Guid Id { get; set; }
    public required DateOnly Date { get; set; }
    public required MoodLevel Level { get; set; }
}