using System.ComponentModel.DataAnnotations;

namespace Tracker.Application.DTOs;

public class CreateChallengeRequest
{
    [Required(ErrorMessage = "O título do desafio é obrigatório")]
    [StringLength(200, MinimumLength = 3, ErrorMessage = "Título deve ter entre 3 e 200 caracteres")]
    public required string Title { get; set; }

    [Range(1, 365, ErrorMessage = "Duração deve estar entre 1 e 365 dias")]
    public required int InitialDaysDuration { get; set; }
}