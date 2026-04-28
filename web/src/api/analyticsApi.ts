import { useQuery } from '@tanstack/react-query';
import api from '@/api/api';
import AnalyticsLogger from '@/shared/logger';

const ANALYTICS_QUERY_KEY = 'analytics';

// Tipos que correspondem aos DTOs do backend
export interface DailyHabitLog {
  date: string;
  status: 'Completed' | 'Missed' | 'GraceDay' | null;
  moodLevel: number | null;
  dayOfWeek: number;
}

export interface HabitPerformance {
  habitId: string;
  habitName: string;
  habitType: string;
  completionRate: number;
  currentStreak: number;
  dailyLogs: DailyHabitLog[];
  totalCompleted: number;
  daysWithLogs: number;
  expectedDays: number;
}

export interface HabitsPerformancePeriodResponse {
  period: {
    startDate: string;
    endDate: string;
    totalDays: number;
    totalWeeks: number;
  };
  habitPerformances: HabitPerformance[];
  averageCompletionRate: number;
  averageMoodLevel: number | null;
  totalHabits: number;
  habitsWithActivity: number;
}

/**
 * Hook para buscar performance anual de hábitos (últimas 52 semanas)
 * Usado para o componente CommitGraph (Annual Consistency)
 */
export function useHabitsAnnualPerformance(weeksBack: number = 52) {
  return useQuery({
    queryKey: [ANALYTICS_QUERY_KEY, 'habits-performance', weeksBack],
    queryFn: async () => {
      AnalyticsLogger.info('Analytics API', `📡 Fetching annual performance (${weeksBack} weeks)`);
      
      try {
        const startTime = performance.now();
        const { data } = await api.get<HabitsPerformancePeriodResponse>(
          '/analytics/habits-performance',
          {
            params: { weeksBack }
          }
        );
        const duration = performance.now() - startTime;
        
        AnalyticsLogger.info('Analytics API', `✅ Data loaded successfully (${duration.toFixed(0)}ms)`, {
          weeksBack,
          totalHabits: data.totalHabits,
          habitsWithActivity: data.habitsWithActivity,
          averageCompletionRate: `${data.averageCompletionRate.toFixed(1)}%`,
          period: data.period,
          totalDataPoints: data.habitPerformances.reduce((acc, h) => acc + h.dailyLogs.length, 0)
        });
        
        return data;
      } catch (err: any) {
        const errorMsg = err?.response?.data?.error || err?.message || 'Unknown error';
        AnalyticsLogger.error('Analytics API', `❌ Failed to fetch performance data`, {
          weeksBack,
          status: err?.response?.status,
          error: errorMsg
        });
        throw err;
      }
    },
    staleTime: 1000 * 60 * 60, // 1 hora
    retry: 2,
  });
}

/**
 * Hook para buscar performance de hábitos em um período específico
 */
export function useHabitsPerformanceByDateRange(
  startDate: string | null,
  endDate: string | null
) {
  return useQuery({
    queryKey: [ANALYTICS_QUERY_KEY, 'habits-performance', startDate, endDate],
    queryFn: async () => {
      AnalyticsLogger.info('Analytics API', `📡 Fetching performance by date range`, {
        startDate,
        endDate
      });
      
      try {
        const { data } = await api.get<HabitsPerformancePeriodResponse>(
          '/analytics/habits-performance',
          {
            params: { startDate, endDate }
          }
        );
        
        AnalyticsLogger.info('Analytics API', `✅ Date range data loaded`, {
          startDate,
          endDate,
          habitsCount: data.habitPerformances.length
        });
        
        return data;
      } catch (err: any) {
        AnalyticsLogger.error('Analytics API', `❌ Failed to fetch date range data`, {
          startDate,
          endDate,
          error: err?.message
        });
        throw err;
      }
    },
    enabled: !!startDate && !!endDate,
    staleTime: 1000 * 60 * 60,
    retry: 2,
  });
}

export function useHabitsPerformanceByMonth(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  const startDate = firstDay.toISOString().split('T')[0];
  const endDate = lastDay.toISOString().split('T')[0];
  
  return useQuery({
    queryKey: [ANALYTICS_QUERY_KEY, 'habits-performance-month', year, month],
    queryFn: async () => {
      AnalyticsLogger.info('Analytics API', `📡 Fetching monthly performance`, {
        month: month + 1,
        year,
        startDate,
        endDate
      });
      
      try {
        const { data } = await api.get<HabitsPerformancePeriodResponse>(
          '/analytics/habits-performance',
          {
            params: { startDate, endDate }
          }
        );
        
        AnalyticsLogger.info('Analytics API', `✅ Monthly data loaded`, {
          month: month + 1,
          year,
          habitsCount: data.habitPerformances.length
        });
        
        return data;
      } catch (err: any) {
        AnalyticsLogger.error('Analytics API', `❌ Failed to fetch monthly data`, {
          month: month + 1,
          year,
          error: err?.message
        });
        throw err;
      }
    },
    staleTime: 1000 * 60 * 60,
    retry: 2,
  });
}
