import { useQuery } from '@tanstack/react-query';
import api from '@/api/api';
import { DashboardResponse, DashboardSummaryResponse, AnalyticsResponse } from '@/shared/types';

const DASHBOARD_QUERY_KEY = 'dashboard';
const ANALYTICS_QUERY_KEY = 'analytics';

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

// Get analytics
export function useAnalytics(startDate?: string, endDate?: string) {
    return useQuery({
        queryKey: [ANALYTICS_QUERY_KEY, startDate, endDate],
        queryFn: async () => {
            const params: Record<string, string> = {};
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;

            const { data } = await api.get<AnalyticsResponse>('/analytics', { params });
            return data;
        },
    });
}
