// Auth Types
export interface AuthResponse {
    id: string;
    name: string;
    email: string;
    accessToken: string;
    refreshToken: string;
    expiresAt: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
}

// Habit Types
export enum HabitType {
    Daily = "Daily",
    WeeklyTarget = "WeeklyTarget"
}

export interface HabitResponse {
    id: string;
    name: string;
    type: HabitType;
    currentStreak: number;
    targetDaysPerWeek: number | null;
    graceDaysAllowed: number;
    createdAt: string;
}

export interface CreateHabitRequest {
    name: string;
    type: HabitType;
    targetDaysPerWeek: number;
    graceDaysAllowed: number;
}

export interface UpdateHabitRequest {
    name: string;
    type: HabitType;
    targetDaysPerWeek: number;
    graceDaysAllowed: number;
}

export interface LogHabitRequest {
    habitId: string;
    date: string; // ISO date YYYY-MM-DD
    status: "Completed" | "Missed" | "Grace";
}

// Challenge Types
export interface ChallengeResponse {
    id: string;
    userId: string;
    title: string;
    startDate: string;
    targetEndDate: string;
    isActive: boolean;
    currentStreak: number;
    daysRemaining: number;
}

export interface CreateChallengeRequest {
    title: string;
    startDate: string;
    targetEndDate: string;
}

export interface UpdateChallengeRequest {
    title: string;
    targetEndDate: string;
}

export interface LogChallengeRequest {
    challengeId: string;
    date: string;
    difficulty: "Easy" | "Medium" | "Hard";
}

// Mood Types
export enum MoodLevel {
    Awful = 1,
    Bad = 2,
    Neutral = 3,
    Good = 4,
    Excellent = 5
}

export interface MoodResponse {
    id: string;
    date: string; // ISO date YYYY-MM-DD
    level: MoodLevel;
}

export interface LogMoodRequest {
    date: string; // ISO date YYYY-MM-DD
    level: MoodLevel;
}

// Dashboard Types
export interface HabitSummaryResponse {
    id: string;
    name: string;
    currentStreak: number;
    isCompletedToday: boolean;
}

export interface ActiveChallengeSummaryResponse {
    id: string;
    title: string;
    currentStreak: number;
    targetEndDate: string;
    daysRemaining: number;
}

export interface ContributionDataResponse {
    date: string;
    count: number;
}

export interface DashboardResponse {
    dailyGreeting: string;
    moodLevel: number | null;
    habitSummaries: HabitSummaryResponse[];
    activeChallenges: ActiveChallengeSummaryResponse[];
    contributionData: ContributionDataResponse[];
}

export interface DashboardSummaryResponse {
    totalHabits: number;
    totalChallenges: number;
    totalStreaks: number;
    averageConsistency: number;
}

// Paged Response
export interface PagedResponse<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

// Analytics Types
export interface WeeklyTrendResponse {
    weekNumber: number;
    startDate: string; // ISO date YYYY-MM-DD
    endDate: string; // ISO date YYYY-MM-DD
    averageMood: number | null;
    totalHabitsCompleted: number;
    averageStreak: number;
    habitCompletionRate: number; // percentage 0-100
    daysWithCompletedHabits: number;
}

export interface DailyHabitLogResponse {
    date: string; // ISO date YYYY-MM-DD
    status: string | null; // "Completed", "Missed", "GraceDay"
    moodLevel: number | null; // 1-5
    dayOfWeek: number; // 1=seg, 7=dom
}

export interface HabitPerformanceResponse {
    habitId: string;
    habitName: string;
    habitType: string; // "Daily" ou "WeeklyTarget"
    completionRate: number; // percentage 0-100
    currentStreak: number;
    dailyLogs: DailyHabitLogResponse[];
    totalCompleted: number;
    daysWithLogs: number;
    expectedDays: number;
}

export interface HabitsPerformancePeriodResponse {
    period: {
        startDate: string; // ISO date YYYY-MM-DD
        endDate: string; // ISO date YYYY-MM-DD
        totalDays: number;
        totalWeeks: number;
    };
    habitPerformances: HabitPerformanceResponse[];
    averageCompletionRate: number;
    averageMoodLevel: number | null;
    totalHabits: number;
    habitsWithActivity: number;
}

export interface OverallAnalyticsStatsResponse {
    averageMoodAllPeriod: number | null;
    averageCompletionRate: number;
    bestWeek: WeeklyTrendResponse | null;
    worstWeek: WeeklyTrendResponse | null;
    totalWeeks: number;
    totalHabitsCompletedAllPeriod: number;
}

export interface MoodHabitWeeklyCorrelationResponse {
    period: {
        startDate: string; // ISO date YYYY-MM-DD
        endDate: string; // ISO date YYYY-MM-DD
        totalDays: number;
        totalWeeks: number;
    };
    overallStats: OverallAnalyticsStatsResponse;
    weeklyTrends: WeeklyTrendResponse[];
}

export interface AnalyticsResponse {
    habitConsistency: {
        habitId: string;
        habitName: string;
        completionRate: number;
        streak: number;
    }[];
    moodTrend: {
        date: string;
        averageMood: number;
    }[];
    challengeProgress: {
        challengeId: string;
        title: string;
        progress: number;
        daysRemaining: number;
    }[];
}
