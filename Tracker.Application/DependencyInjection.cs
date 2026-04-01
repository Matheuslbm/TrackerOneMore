using Microsoft.Extensions.DependencyInjection;
using Tracker.Application.Interfaces;
using Tracker.Application.Mappings;
using Tracker.Application.Services;

namespace Tracker.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        services.AddAutoMapper(typeof(MappingProfile));
        services.AddScoped<IHabitService, HabitService>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IChallengeService, ChallengeService>();
        services.AddScoped<IMoodService, MoodService>();
        return services;
    }
}