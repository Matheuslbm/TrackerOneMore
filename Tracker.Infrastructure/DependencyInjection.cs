using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Tracker.Application.Interfaces;
using Tracker.Domain.Interfaces.Repositories;
using Tracker.Infrastructure.Auth;
using Tracker.Infrastructure.Repositories;

namespace Tracker.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddScoped<IHabitRepository, HabitRepository>();
        services.AddScoped<IHabitLogRepository, HabitLogRepository>();
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<ITokenService, JwtTokenService>();

        services.Configure<JwtSettings>(configuration.GetSection("JwtSettings"));

        return services;
    }
}