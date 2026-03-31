using Microsoft.Extensions.DependencyInjection;
using Tracker.Domain.Interfaces.Repositories;
using Tracker.Infrastructure.Repositories;

namespace Tracker.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services)
    {
        services.AddScoped<IHabitRepository, HabitRepository>();
        services.AddScoped<IHabitLogRepository, HabitLogRepository>();

        return services;
    }
}