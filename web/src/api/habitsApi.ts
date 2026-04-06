import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/api';
import {
    HabitResponse,
    CreateHabitRequest,
    UpdateHabitRequest,
    LogHabitRequest,
    PagedResponse,
} from '@/shared/types';

const HABITS_QUERY_KEY = 'habits';

// Get all habits
export function useHabits(page = 1, pageSize = 10) {
    return useQuery({
        queryKey: [HABITS_QUERY_KEY, page, pageSize],
        queryFn: async () => {
            const { data } = await api.get<PagedResponse<HabitResponse>>('/habits', {
                params: { page, pageSize },
            });
            return data;
        },
    });
}

// Get single habit
export function useHabit(habitId: string) {
    return useQuery({
        queryKey: [HABITS_QUERY_KEY, habitId],
        queryFn: async () => {
            const { data } = await api.get<HabitResponse>(`/habits/${habitId}`);
            return data;
        },
        enabled: !!habitId,
    });
}

// Create habit
export function useCreateHabit() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (createData: CreateHabitRequest) => {
            const { data } = await api.post<HabitResponse>('/habits', createData);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [HABITS_QUERY_KEY] });
        },
    });
}

// Update habit
export function useUpdateHabit(habitId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (updateData: UpdateHabitRequest) => {
            const { data } = await api.put<HabitResponse>(
                `/habits/${habitId}`,
                updateData
            );
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [HABITS_QUERY_KEY] });
        },
    });
}

// Delete habit
export function useDeleteHabit(habitId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            await api.delete(`/habits/${habitId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [HABITS_QUERY_KEY] });
        },
    });
}

// Log habit
export function useLogHabit() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (logData: LogHabitRequest) => {
            const { data } = await api.post(`/habits/${logData.habitId}/log`, {
                date: logData.date,
                status: logData.status,
            });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [HABITS_QUERY_KEY] });
        },
    });
}
