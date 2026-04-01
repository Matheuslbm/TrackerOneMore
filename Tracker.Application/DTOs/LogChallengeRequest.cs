using System.ComponentModel.DataAnnotations;
using Tracker.Domain.Enums;

namespace Tracker.Application.DTOs;

public class LogChallengeRequest
{
    [Required(ErrorMessage = "A data é obrigatória")]
    public required DateOnly Date { get; set; }

    [Required(ErrorMessage = "A dificuldade é obrigatória")]
    public required ChallengeDifficulty Difficulty { get; set; }

    [Required(ErrorMessage = "O status 'Survived' é obrigatório")]
    public required bool Survived { get; set; }

}