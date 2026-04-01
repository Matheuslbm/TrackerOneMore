using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Tracker.Application.Interfaces;
using Tracker.Domain.Interfaces.Repositories;
using Tracker.Infrastructure.Auth;
using Tracker.Infrastructure.Data;
using Tracker.Infrastructure.Repositories;

namespace Tracker.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
    {
        var jwtSettings = configuration.GetSection("JwtSettings").Get<JwtSettings>()
            ?? throw new InvalidOperationException("JwtSettings não configurado");

        var jwtSettingsInstance = new JwtSettings
        {
            Secret = Environment.GetEnvironmentVariable("JWTSETTINGS_SECRET") ?? jwtSettings.Secret,
            Issuer = jwtSettings.Issuer,
            Audience = jwtSettings.Audience,
            ExpirationInHours = jwtSettings.ExpirationInHours
        };

        services.AddSingleton(jwtSettingsInstance);
        services.AddScoped<ITokenService, JwtTokenService>();

        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("DefaultConnection")));

        services.AddScoped<IChallengeRepository, ChallengeRepository>();
        services.AddScoped<IDailyMoodRepository, DailyMoodRepository>();
        services.AddScoped<IChallengeDailyLogRepository, ChallengeDailyLogRepository>();
        services.AddScoped<IHabitRepository, HabitRepository>();
        services.AddScoped<IHabitLogRepository, HabitLogRepository>();
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<ITokenService, JwtTokenService>();

        services.Configure<JwtSettings>(configuration.GetSection("JwtSettings"));

        return services;
    }
}