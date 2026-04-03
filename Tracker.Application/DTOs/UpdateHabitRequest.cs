using System.ComponentModel.DataAnnotations;
using Tracker.Domain.Enums;

namespace Tracker.Application.DTOs;

public class UpdateHabitRequest
{
    [Required(ErrorMessage = "O nome do hábito é obrigatório")]
    [StringLength(200, MinimumLength = 1, ErrorMessage = "O nome deve ter entre 1 e 200 caracteres")]
    public string Name { get; set; } = null!;

    public HabitType Type { get; set; }

    [Range(1, 7, ErrorMessage = "TargetDaysPerWeek deve estar entre 1 e 7")]
    public int? TargetDaysPerWeek { get; set; }

    [Range(0, int.MaxValue, ErrorMessage = "GraceDaysAllowed não pode ser negativo")]
    public int GraceDaysAllowed { get; set; }
}
