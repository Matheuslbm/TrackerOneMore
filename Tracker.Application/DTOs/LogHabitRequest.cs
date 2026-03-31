using Tracker.Domain.Enums;

namespace Tracker.Application.DTOs;

public class LogHabitRequest
{
    public DateOnly Date { get; set; }
    public LogStatus Status { get; set; }
}