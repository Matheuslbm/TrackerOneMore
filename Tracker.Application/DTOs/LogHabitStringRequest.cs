namespace Tracker.Application.DTOs;

/// <summary>
/// Request para log de hábito que aceita strings do frontend
/// e mapeia para LogStatus enum
/// </summary>
public class LogHabitStringRequest
{
    public DateOnly Date { get; set; }
    public required string Status { get; set; }
}
