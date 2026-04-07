import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/api';
import { MoodResponse, LogMoodRequest, PagedResponse } from '@/shared/types';

const MOOD_QUERY_KEY = 'moods';

// Get moods for date range
export function useMoods(startDate?: string, endDate?: string) {
    return useQuery({
        queryKey: [MOOD_QUERY_KEY, startDate, endDate],
        queryFn: async () => {
            const params: Record<string, string> = {};
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;

            const { data } = await api.get<MoodResponse[]>('/moods/range', { params });
            return data;
        },
    });
}

// Get mood for today
export function useTodayMood() {
    return useQuery({
        queryKey: [MOOD_QUERY_KEY, 'today'],
        queryFn: async () => {
            const { data } = await api.get<MoodResponse | null>('/moods/today');
            return data;
        },
    });
}

// Get mood for specific date
export function useMoodForDate(date: string) {
    return useQuery({
        queryKey: [MOOD_QUERY_KEY, date],
        queryFn: async () => {
            const { data } = await api.get<MoodResponse | null>(
                `/moods/${date}`
            );
            return data;
        },
        enabled: !!date,
    });
}

// Get moods with pagination
export function useMoodsPaged(page = 1, pageSize = 30) {
    return useQuery({
        queryKey: [MOOD_QUERY_KEY, 'paged', page, pageSize],
        queryFn: async () => {
            const { data } = await api.get<PagedResponse<MoodResponse>>(
                '/moods/paged',
                { params: { page, pageSize } }
            );
            return data;
        },
    });
}

// Log mood
export function useLogMood() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (logData: LogMoodRequest) => {
            const { data } = await api.post<MoodResponse>('/moods', logData);
            return data;
        },
        onSuccess: (data) => {
            // Invalidar e refetch todas as queries de mood
            queryClient.invalidateQueries({ queryKey: [MOOD_QUERY_KEY] });
            // Garanta que o refetch aconteça imediatamente
            queryClient.refetchQueries({ queryKey: [MOOD_QUERY_KEY] });
        },
    });
}

// Delete mood
export function useDeleteMood(date: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            await api.delete(`/moods/${date}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [MOOD_QUERY_KEY] });
        },
    });
}
