using AutoMapper;
using Tracker.Application.DTOs;
using Tracker.Domain.Entities;

namespace Tracker.Application.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<Habit, HabitResponse>();
        CreateMap<User, AuthResponse>();
    }
}
