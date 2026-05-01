import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { scheduleApi, type ScheduleStatsQuery } from '@/api/scheduleApi';
import type { ScheduleFilters, Schedule } from '@/types/schedule';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { AxiosError } from 'axios';

export const SCHEDULE_QUERY_KEYS = {
    all: ['schedules'] as const,
    lists: () => [...SCHEDULE_QUERY_KEYS.all, 'list'] as const,
    list: (filters: ScheduleFilters) => [...SCHEDULE_QUERY_KEYS.lists(), { filters }] as const,
    stats: (params?: ScheduleStatsQuery) => [...SCHEDULE_QUERY_KEYS.all, 'stats', params ?? {}] as const,
    details: () => [...SCHEDULE_QUERY_KEYS.all, 'detail'] as const,
    detail: (id: string | number) => [...SCHEDULE_QUERY_KEYS.details(), id] as const,
};

export const useSchedules = (filters: ScheduleFilters) => {
    return useQuery({
        queryKey: SCHEDULE_QUERY_KEYS.list(filters),
        queryFn: () => scheduleApi.getSchedules(filters),
        placeholderData: (previousData) => previousData,
    });
};

export const useSchedule = (id: string | number | undefined) => {
    return useQuery({
        queryKey: SCHEDULE_QUERY_KEYS.detail(id || ''),
        queryFn: () => scheduleApi.getSchedule(id!),
        enabled: !!id,
    });
};

export const useScheduleStats = (params?: ScheduleStatsQuery) => {
    return useQuery({
        queryKey: SCHEDULE_QUERY_KEYS.stats(params),
        queryFn: () => scheduleApi.getScheduleStats(params),
    });
};

export const useCreateSchedule = () => {
    const queryClient = useQueryClient();
    const { t } = useTranslation();

    return useMutation({
        mutationFn: ({ tourId, data }: { tourId: string | number; data: Partial<Schedule> }) =>
            scheduleApi.createSchedule(tourId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: SCHEDULE_QUERY_KEYS.lists() });
            queryClient.invalidateQueries({ queryKey: SCHEDULE_QUERY_KEYS.all });
            queryClient.invalidateQueries({ queryKey: ['tour-edit-schedules'] });
            queryClient.invalidateQueries({ queryKey: ['tour-detail-schedules'] });
            toast.success(t('common:success.create'));
        },
        onError: () => {
            toast.error(t('common:error.create'));
        },
    });
};

export const useUpdateSchedule = () => {
    const queryClient = useQueryClient();
    const { t } = useTranslation();

    return useMutation({
        mutationFn: ({ id, data }: { id: string | number; data: Partial<Schedule> }) =>
            scheduleApi.updateSchedule(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: SCHEDULE_QUERY_KEYS.lists() });
            queryClient.invalidateQueries({ queryKey: SCHEDULE_QUERY_KEYS.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: ['tour-edit-schedules'] });
            queryClient.invalidateQueries({ queryKey: ['tour-detail-schedules'] });
            toast.success(t('common:success.update'));
        },
        onError: () => {
            toast.error(t('common:error.update'));
        },
    });
};

function extractErrorMessage(err: unknown): string | undefined {
    if (err instanceof AxiosError) {
        const data = err.response?.data as { message?: string } | undefined;
        return data?.message;
    }
    if (err instanceof Error) {
        return err.message;
    }
    return undefined;
}

export const useDeleteSchedule = () => {
    const queryClient = useQueryClient();
    const { t } = useTranslation();

    return useMutation({
        mutationFn: (id: string | number) => scheduleApi.deleteSchedule(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: SCHEDULE_QUERY_KEYS.lists() });
            queryClient.invalidateQueries({ queryKey: SCHEDULE_QUERY_KEYS.all });
            queryClient.invalidateQueries({ queryKey: ['tour-edit-schedules'] });
            queryClient.invalidateQueries({ queryKey: ['tour-detail-schedules'] });
            toast.success(t('common:success.delete'));
        },
        onError: (err: unknown) => {
            toast.error(extractErrorMessage(err) || t('common:error.delete'));
        },
    });
};

export const useUpdateScheduleStatus = () => {
    const queryClient = useQueryClient();
    const { t } = useTranslation();

    return useMutation({
        mutationFn: ({ id, status }: { id: string | number; status: string }) =>
            scheduleApi.updateScheduleStatus(id, status),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: SCHEDULE_QUERY_KEYS.lists() });
            queryClient.invalidateQueries({ queryKey: SCHEDULE_QUERY_KEYS.all });
            queryClient.invalidateQueries({ queryKey: SCHEDULE_QUERY_KEYS.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: ['tour-edit-schedules'] });
            queryClient.invalidateQueries({ queryKey: ['tour-detail-schedules'] });
            toast.success(t('common:success.update'));
        },
        onError: (err: unknown) => {
            toast.error(extractErrorMessage(err) || t('common:error.update'));
        },
    });
};

export const useBulkUpdateScheduleStatus = () => {
    const queryClient = useQueryClient();
    const { t } = useTranslation();

    return useMutation({
        mutationFn: ({ ids, status }: { ids: (string | number)[]; status: string }) =>
            scheduleApi.bulkUpdateStatus(ids, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: SCHEDULE_QUERY_KEYS.lists() });
            queryClient.invalidateQueries({ queryKey: SCHEDULE_QUERY_KEYS.all });
            queryClient.invalidateQueries({ queryKey: ['tour-edit-schedules'] });
            queryClient.invalidateQueries({ queryKey: ['tour-detail-schedules'] });
            toast.success(t('common:success.update_bulk'));
        },
        onError: (err: unknown) => {
            toast.error(extractErrorMessage(err) || t('common:error.update_bulk'));
        },
    });
};

/** Limit for schedule preview in tour list modal (invalidation key `tour-detail-schedules`). */
export const TOUR_DETAIL_MODAL_SCHEDULE_LIMIT = 5;

/** Limit for departure list block on tour edit page. */
export const TOUR_EDIT_DEPARTURE_SCHEDULE_LIMIT = 25;

/**
 * Schedules preview for `TourDetailModal` — data flow: hook → `scheduleApi` (PROJECT_RULES §4).
 */
export function useTourDetailModalSchedules(tourId: string | number | null | undefined, isOpen: boolean) {
    const scheduleFilters = useMemo(
        (): ScheduleFilters => ({
            tour_id: tourId != null && String(tourId) !== '' ? String(tourId) : undefined,
            page: 1,
            limit: TOUR_DETAIL_MODAL_SCHEDULE_LIMIT,
            sort: 'start_date',
            order: 'asc',
        }),
        [tourId],
    );

    return useQuery({
        queryKey: ['tour-detail-schedules', scheduleFilters],
        queryFn: () => {
            if (!scheduleFilters.tour_id) {
                return Promise.reject(new Error('Missing tour id'));
            }
            return scheduleApi.getSchedules(scheduleFilters);
        },
        enabled: isOpen && tourId != null && String(tourId) !== '',
    });
}

/**
 * Departure schedules on tour edit page.
 */
export function useTourEditDepartureSchedules(tourId: string | undefined) {
    const scheduleFilters = useMemo(
        (): ScheduleFilters => ({
            tour_id: tourId ? String(tourId) : undefined,
            page: 1,
            limit: TOUR_EDIT_DEPARTURE_SCHEDULE_LIMIT,
            sort: 'start_date',
            order: 'asc',
        }),
        [tourId],
    );

    return useQuery({
        queryKey: ['tour-edit-schedules', tourId],
        queryFn: () => {
            if (!tourId) {
                return Promise.reject(new Error('Missing tour id'));
            }
            return scheduleApi.getSchedules(scheduleFilters);
        },
        enabled: Boolean(tourId),
    });
}
