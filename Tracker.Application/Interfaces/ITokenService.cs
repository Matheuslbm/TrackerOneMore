using Tracker.Application.DTOs;
using Tracker.Domain.Entities;

namespace Tracker.Application.Interfaces;

public interface ITokenService
{
    (string accessToken, string refreshToken, DateTime expiresAt) GenerateToken(User user);
}
