using AutoMapper;
using Tracker.Application.DTOs;
using Tracker.Application.Interfaces;
using Tracker.Domain.Entities;
using Tracker.Domain.Interfaces.Repositories;

namespace Tracker.Application.Services;

public class MoodService : IMoodService
{
    private readonly IDailyMoodRepository _moodRepository;
    private readonly IMapper _mapper;

    public MoodService(
        IDailyMoodRepository moodRepository,
        IMapper mapper)
    {
        _moodRepository = moodRepository ?? throw new ArgumentNullException(nameof(moodRepository));
        _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
    }

    public async Task<MoodResponse> LogMoodAsync(
        Guid userId,
        LogMoodRequest request,
        CancellationToken cancellationToken = default)
    {
        ValidateLogMoodRequest(request);

        var mood = new DailyMood(userId, request.Date, request.Level);

        await _moodRepository.AddOrUpdateAsync(mood, cancellationToken);

        return _mapper.Map<MoodResponse>(mood);
    }

    public async Task<MoodResponse?> GetMoodByDateAsync(
        Guid userId,
        DateOnly date,
        CancellationToken cancellationToken = default)
    {
        var mood = await _moodRepository.GetByDateAsync(userId, date, cancellationToken);
        return mood == null ? null : _mapper.Map<MoodResponse>(mood);
    }

    public async Task<IEnumerable<MoodResponse>> GetMoodsByDateRangeAsync(
        Guid userId,
        DateOnly startDate,
        DateOnly endDate,
        CancellationToken cancellationToken = default)
    {
        if (startDate > endDate)
            throw new ArgumentException("Data de início não pode ser maior que data de fim");

        var moods = await _moodRepository.GetMoodsByDateRangeAsync(userId, startDate, endDate, cancellationToken);
        return _mapper.Map<IEnumerable<MoodResponse>>(moods);
    }
    private static void ValidateLogMoodRequest(LogMoodRequest request)
    {
        if (request == null)
            throw new ArgumentNullException(nameof(request));

        if (request.Date == default)
            throw new ArgumentException("Data é obrigatória", nameof(request.Date));

        if (!Enum.IsDefined(typeof(Domain.Enums.MoodLevel), request.Level))
            throw new ArgumentException("Nível de humor inválido", nameof(request.Level));
    }
}