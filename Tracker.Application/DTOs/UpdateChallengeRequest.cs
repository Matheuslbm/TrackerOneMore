using System.ComponentModel.DataAnnotations;

namespace Tracker.Application.DTOs;

public class UpdateChallengeRequest
{
    [Required(ErrorMessage = "O título do desafio é obrigatório")]
    [StringLength(200, MinimumLength = 3, ErrorMessage = "Título deve ter entre 3 e 200 caracteres")]
    public required string Title { get; set; }
}
