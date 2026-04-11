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
const ANALYTICS_QUERY_KEY = 'analytics';

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
            queryClient.invalidateQueries({ queryKey: ['habitWeeklyLogs'] });
            queryClient.invalidateQueries({ queryKey: [ANALYTICS_QUERY_KEY] });
        },
    });
}

// Get habit log for specific date
export function useHabitLogByDate(habitId: string | null, date: string | null) {
    return useQuery({
        queryKey: ['habitLog', habitId, date],
        queryFn: async () => {
            if (!habitId || !date) return null;
            const { data } = await api.get<{ status: string | null }>(`/habits/${habitId}/log`, {
                params: { date }
            });
            return data.status;
        },
        enabled: !!habitId && !!date,
    });
}

// Get all logs for current week
export function useWeeklyHabitLogs() {
    return useQuery({
        queryKey: ['habitWeeklyLogs'],
        queryFn: async () => {
            // CRÍTICO: Usar a MESMA lógica de cálculo de semana do HabitGrid
            const today = new Date();
            const dayOfWeek = today.getDay();
            const startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
            startOfWeek.setHours(0, 0, 0, 0);

            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);

            // Converter para formato YYYY-MM-DD usando data LOCAL (não UTC)
            const getLocalDateStr = (date: Date) => {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            };

            const startDateStr = getLocalDateStr(startOfWeek);
            const endDateStr = getLocalDateStr(endOfWeek);

            // Fazer uma única requisição para toda a semana
            const { data } = await api.get<{
                logs: Array<{ habitId: string; date: string; status: string }>
            }>('/habits/logs/week', {
                params: { startDate: startDateStr, endDate: endDateStr }
            });

            return {
                logs: data.logs,
                dates: (() => {
                    const dates: string[] = [];
                    for (let i = 0; i < 7; i++) {
                        const date = new Date(startOfWeek);
                        date.setDate(startOfWeek.getDate() + i);
                        dates.push(getLocalDateStr(date));
                    }
                    return dates;
                })()
            };
        },
        // Refetch apenas uma vez por dia (não a cada minuto)
        staleTime: 1000 * 60 * 60 * 24, // 24 horas
        // Não refetch ao ganhar foco ou no mount (não sobrescreve state local durante debounce)
        refetchOnWindowFocus: false,
        refetchOnMount: false,
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
            // ✅ CORREÇÃO: Invalidar TODAS as queries afetadas pelo novo log
            // Isso força refetch de dados atualizados do servidor
            queryClient.invalidateQueries({ queryKey: [HABITS_QUERY_KEY] });
            queryClient.invalidateQueries({ queryKey: ['habitWeeklyLogs'] });
            queryClient.invalidateQueries({ queryKey: [ANALYTICS_QUERY_KEY] });
            queryClient.invalidateQueries({ queryKey: ['habits-performance'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
    });
}

// Delete habit log for specific date
export function useDeleteHabitLog() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ habitId, date }: { habitId: string; date: string }) => {
            await api.delete(`/habits/${habitId}/log`, {
                params: { date }
            });
        },
        onSuccess: () => {
            // ✅ CORREÇÃO: Invalidar TODAS as queries afetadas pela remoção do log
            queryClient.invalidateQueries({ queryKey: [HABITS_QUERY_KEY] });
            queryClient.invalidateQueries({ queryKey: ['habitWeeklyLogs'] });
            queryClient.invalidateQueries({ queryKey: [ANALYTICS_QUERY_KEY] });
            queryClient.invalidateQueries({ queryKey: ['habits-performance'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
    });
}
