import { useQuery } from '@tanstack/react-query';
import api from '@/api/api';
import { DashboardResponse, DashboardSummaryResponse, AnalyticsResponse, MoodHabitWeeklyCorrelationResponse, HabitsPerformancePeriodResponse } from '@/shared/types';

const DASHBOARD_QUERY_KEY = 'dashboard';
const ANALYTICS_QUERY_KEY = 'analytics';
const HABITS_PERFORMANCE_QUERY_KEY = 'habits-performance';

// Get dashboard data (user + habits + challenges + mood today)
export function useDashboard() {
    return useQuery({
        queryKey: [DASHBOARD_QUERY_KEY],
        queryFn: async () => {
            const { data } = await api.get<DashboardResponse>('/dashboard');
            return data;
        },
    });
}

// Get dashboard summary
export function useDashboardSummary() {
    return useQuery({
        queryKey: [DASHBOARD_QUERY_KEY, 'summary'],
        queryFn: async () => {
            const { data } = await api.get<DashboardSummaryResponse>('/dashboard/summary');
            return data;
        },
    });
}

// Get analytics with mood-habit weekly correlation
export function useAnalytics(startDate?: string, endDate?: string, weeksBack?: number) {
    return useQuery({
        queryKey: [ANALYTICS_QUERY_KEY, startDate, endDate, weeksBack],
        queryFn: async () => {
            const params: Record<string, string | number> = {};
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;
            if (weeksBack) params.weeksBack = weeksBack;

            const { data } = await api.get<MoodHabitWeeklyCorrelationResponse>('/analytics/mood-habit-trend', { params });
            return data;
        },
    });
}

// Get habits performance (completion rate per habit with daily breakdown)
export function useHabitsPerformance(startDate?: string, endDate?: string, weeksBack?: number) {
    return useQuery({
        queryKey: [HABITS_PERFORMANCE_QUERY_KEY, startDate, endDate, weeksBack],
        queryFn: async () => {
            const params: Record<string, string | number> = {};
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;
            if (weeksBack) params.weeksBack = weeksBack;

            const { data } = await api.get<HabitsPerformancePeriodResponse>('/analytics/habits-performance', { params });
            return data;
        },
    });
}
