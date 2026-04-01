using System.ComponentModel.DataAnnotations;

namespace Tracker.Infrastructure.Auth;

public class JwtSettings
{
    [Required(ErrorMessage = "JWT Secret é obrigatório")]
    public string Secret { get; set; } = string.Empty;

    public string Issuer { get; set; } = JwtDefaults.DefaultIssuer;
    public string Audience { get; set; } = JwtDefaults.DefaultAudience;
    public int ExpirationInHours { get; set; } = JwtDefaults.DefaultExpirationHours;
    public int RefreshTokenExpirationInDays { get; set; } = JwtDefaults.DefaultRefreshTokenExpirationDays;
}
