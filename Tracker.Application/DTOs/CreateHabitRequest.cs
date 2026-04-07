using System.ComponentModel.DataAnnotations;
using Tracker.Domain.Enums;

namespace Tracker.Application.DTOs;

/// <summary>
/// Requisição para criar um novo hábito.
/// O GraceDaysAllowed é calculado automaticamente pelo sistema:
/// - Para hábitos Diários: 1 GraceDay (bônus)
/// - Para hábitos com Meta Semanal: 7 - TargetDaysPerWeek
/// </summary>
public class CreateHabitRequest
{
    [Required(ErrorMessage = "O nome do hábito é obrigatório")]
    [StringLength(200, MinimumLength = 1, ErrorMessage = "O nome deve ter entre 1 e 200 caracteres")]
    public string Name { get; set; } = null!;

    public HabitType Type { get; set; }

    [Range(1, 7, ErrorMessage = "TargetDaysPerWeek deve estar entre 1 e 7")]
    public int? TargetDaysPerWeek { get; set; }
}