import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/api';
import {
    ChallengeResponse,
    CreateChallengeRequest,
    UpdateChallengeRequest,
    LogChallengeRequest,
    PagedResponse,
} from '@/shared/types';

const CHALLENGES_QUERY_KEY = 'challenges';

// Get all challenges
export function useChallenges(page = 1, pageSize = 10) {
    return useQuery({
        queryKey: [CHALLENGES_QUERY_KEY, page, pageSize],
        queryFn: async () => {
            const { data } = await api.get<PagedResponse<ChallengeResponse>>(
                '/challenges',
                { params: { page, pageSize } }
            );
            return data;
        },
    });
}

// Get active challenges
export function useActiveChallenges() {
    return useQuery({
        queryKey: [CHALLENGES_QUERY_KEY, 'active'],
        queryFn: async () => {
            const { data } = await api.get<ChallengeResponse[]>(
                '/challenges/active'
            );
            return data;
        },
    });
}

// Get single challenge
export function useChallenge(challengeId: string) {
    return useQuery({
        queryKey: [CHALLENGES_QUERY_KEY, challengeId],
        queryFn: async () => {
            const { data } = await api.get<ChallengeResponse>(
                `/challenges/${challengeId}`
            );
            return data;
        },
        enabled: !!challengeId,
    });
}

// Create challenge
export function useCreateChallenge() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (createData: CreateChallengeRequest) => {
            const { data } = await api.post<ChallengeResponse>(
                '/challenges',
                createData
            );
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [CHALLENGES_QUERY_KEY] });
        },
    });
}

// Update challenge
export function useUpdateChallenge(challengeId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (updateData: UpdateChallengeRequest) => {
            const { data } = await api.put<ChallengeResponse>(
                `/challenges/${challengeId}`,
                updateData
            );
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [CHALLENGES_QUERY_KEY] });
        },
    });
}

// Delete challenge
export function useDeleteChallenge() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (challengeId: string) => {
            await api.delete(`/challenges/${challengeId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [CHALLENGES_QUERY_KEY] });
        },
    });
}

// Log challenge
export function useLogChallenge() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (logData: LogChallengeRequest & { challengeId: string }) => {
            const { data } = await api.post(
                `/challenges/${logData.challengeId}/log`,
                {
                    date: logData.date,
                    difficulty: logData.difficulty,
                    survived: logData.survived,
                }
            );
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [CHALLENGES_QUERY_KEY] });
        },
    });
}
