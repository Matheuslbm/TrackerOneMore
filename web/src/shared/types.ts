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
    Productive = "Productive",
    Reducing = "Reducing"
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
    Terrible = 1,
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
export interface DashboardResponse {
    userId: string;
    userName: string;
    userEmail: string;
    todayMood: MoodResponse | null;
    activeHabits: HabitResponse[];
    activeChallenges: ChallengeResponse[];
    totalStreaks: number;
    consistency: number; // percentage 0-100
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
