using System.ComponentModel.DataAnnotations;
using Tracker.Domain.Enums;

namespace Tracker.Application.DTOs;

public class LogMoodRequest
{
    [Required(ErrorMessage = "A data é obrigatória")]
    public required DateOnly Date { get; set; }

    [Required(ErrorMessage = "O nível de humor é obrigatório")]
    public required MoodLevel Level { get; set; }
}