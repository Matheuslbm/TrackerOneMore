using System.Security.Claims;

namespace Tracker.API.Extensions;

public static class ClaimsPrincipalExtensions
{
    public static Guid GetUserId(this ClaimsPrincipal user)
    {
        var userIdClaim = user?.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? throw new UnauthorizedAccessException("ID do usuário não encontrado no token.");

        if (!Guid.TryParse(userIdClaim, out var userId))
            throw new UnauthorizedAccessException("ID do usuário inválido no token.");

        return userId;
    }
}
