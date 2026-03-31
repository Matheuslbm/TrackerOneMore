using System.ComponentModel.DataAnnotations;
using Tracker.Domain.Enums;

namespace Tracker.Application.DTOs;

public class HabitResponse
{
    public Guid Id { get; set; }

    public string Name { get; set; } = null!;

    public HabitType Type { get; set; }

    [Range(0, int.MaxValue)]
    public int CurrentStreak { get; set; }

    [Range(1, 7)]
    public int? TargetDaysPerWeek { get; set; }

    [Range(0, int.MaxValue)]
    public int GraceDaysAllowed { get; set; }

    public DateTime CreatedAt { get; set; }
}