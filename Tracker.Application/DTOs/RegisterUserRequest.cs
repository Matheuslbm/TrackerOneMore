using System.ComponentModel.DataAnnotations;

namespace Tracker.Application.DTOs;

public class RegisterUserRequest
{
    [Required(ErrorMessage = "O nome é obrigatório.")]
    [StringLength(200, MinimumLength = 1,
        ErrorMessage = "Nome deve ter entre 1 e 200 caracteres.")]
    public string Name { get; set; } = string.Empty;

    [Required(ErrorMessage = "O email é obrigatório.")]
    [EmailAddress(ErrorMessage = "Email inválido.")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "A senha é obrigatória.")]
    [StringLength(100, MinimumLength = 6,
        ErrorMessage = "Senha deve ter entre 6 e 100 caracteres.")]
    public string Password { get; set; } = string.Empty;
}
