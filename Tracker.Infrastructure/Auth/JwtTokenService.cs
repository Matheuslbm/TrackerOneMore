using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Tracker.Application.Interfaces;
using Tracker.Domain.Entities;

namespace Tracker.Infrastructure.Auth;

public class JwtTokenService : ITokenService
{
    private readonly JwtSettings _jwtSettings;

    public JwtTokenService(IOptions<JwtSettings> jwtSettings)
    {
        _jwtSettings = jwtSettings?.Value ?? throw new ArgumentNullException(nameof(jwtSettings));
    }

    public (string accessToken, string refreshToken, DateTime expiresAt) GenerateToken(User user)
    {
        if (user == null)
            throw new ArgumentNullException(nameof(user));

        var expiresAt = DateTime.UtcNow.AddHours(_jwtSettings.ExpirationInHours);
        var accessToken = GenerateAccessToken(user, expiresAt);
        var refreshToken = GenerateRefreshToken();

        return (accessToken, refreshToken, expiresAt);
    }

    private string GenerateAccessToken(User user, DateTime expiresAt)
    {
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Name),
            new Claim(ClaimTypes.Email, user.Email)
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.Secret));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _jwtSettings.Issuer,
            audience: _jwtSettings.Audience,
            claims: claims,
            expires: expiresAt,
            signingCredentials: credentials
        );

        var tokenHandler = new JwtSecurityTokenHandler();
        return tokenHandler.WriteToken(token);
    }

    private static string GenerateRefreshToken()
    {
        var randomNumber = new byte[64];
        using (var rng = RandomNumberGenerator.Create())
        {
            rng.GetBytes(randomNumber);
        }
        return Convert.ToBase64String(randomNumber);
    }
}
