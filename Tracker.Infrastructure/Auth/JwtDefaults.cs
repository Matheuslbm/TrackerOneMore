namespace Tracker.Infrastructure.Auth;

public static class JwtDefaults
{
    public const string DefaultIssuer = "TrackerAPI";
    public const string DefaultAudience = "TrackerFrontend";
    public const int DefaultExpirationHours = 24;
    public const int DefaultRefreshTokenExpirationDays = 7;
}
