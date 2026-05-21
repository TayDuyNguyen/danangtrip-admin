import { API_ENDPOINTS } from '@/constants';
import axiosClient from './axiosClient';
import i18next from 'i18next';
import type { ScheduleListData, ScheduleStats, RawSchedule } from '@/dataHelper/schedule.dataHelper';
import { scheduleMapper } from '@/dataHelper/schedule.mapper';
import type { Schedule, ScheduleFilters } from '@/types/schedule';
import { toNumberSafe } from '@/utils/safeConverters';
import { AxiosError } from 'axios';

export type ScheduleStatsQuery = Pick<ScheduleFilters, 'tour_id' | 'start_date' | 'end_date' | 'q'>;

function apiStatusFromUi(status: string): string {
    const normalized = String(status).trim().toLowerCase();
    if (normalized === 'available' || normalized === 'full' || normalized === 'cancelled') {
        return normalized;
    }
    if (normalized === 'active' || normalized === 'open') {
        return 'available';
    }
    if (normalized === 'inactive' || normalized === 'closed' || normalized === 'sold_out') {
        return 'full';
    }
    return normalized;
}

function unwrapApiData<T>(payload: unknown): T {
    const obj = (payload ?? {}) as Record<string, unknown>;
    const data = obj.data;
    if (data && typeof data === 'object') {
        return data as T;
    }
    return obj as T;
}

/**
 * API Service for Schedule module
 */
export const scheduleApi = {
    getSchedules: async (filters: ScheduleFilters): Promise<ScheduleListData> => {
        const params: Record<string, unknown> = {
            page: filters.page || 1,
            per_page: filters.limit || 10,
        };

        if (filters.q?.trim()) {
            params.q = filters.q.trim();
        }
        if (filters.tour_id !== undefined && filters.tour_id !== '' && filters.tour_id !== 'all') {
            params.tour_id = toNumberSafe(filters.tour_id);
        }
        if (filters.status && filters.status !== 'all') {
            params.status = apiStatusFromUi(filters.status);
        }
        if (filters.start_date) {
            params.from = filters.start_date;
        }
        if (filters.end_date) {
            params.to = filters.end_date;
        }
        if (filters.sort) {
            params.sort = filters.sort;
        }
        if (filters.order) {
            params.order = filters.order;
        }

        const response = await axiosClient.get(API_ENDPOINTS.SCHEDULES.LIST, { params });
        const rawData = unwrapApiData<Record<string, unknown>>(response);
        const items = Array.isArray(rawData.data) ? rawData.data : [];

        return {
            data: items.map((item: RawSchedule) => scheduleMapper.mapFromRaw(item)),
            total: toNumberSafe(rawData.total, 0),
            current_page: toNumberSafe(rawData.current_page, 1),
            per_page: toNumberSafe(rawData.per_page, 10),
            last_page: toNumberSafe(rawData.last_page, 1),
        };
    },

    getSchedule: async (id: string | number): Promise<Schedule> => {
        const response = await axiosClient.get(API_ENDPOINTS.SCHEDULES.DETAIL(id));
        const rawData = unwrapApiData<RawSchedule>(response);
        return scheduleMapper.mapFromRaw(rawData);
    },

    getScheduleStats: async (query?: ScheduleStatsQuery): Promise<ScheduleStats> => {
        const params: Record<string, unknown> = {};
        if (query?.q?.trim()) {
            params.q = query.q.trim();
        }
        if (query?.tour_id !== undefined && query?.tour_id !== '' && query?.tour_id !== 'all') {
            params.tour_id = toNumberSafe(query.tour_id);
        }
        if (query?.start_date) {
            params.from = query.start_date;
        }
        if (query?.end_date) {
            params.to = query.end_date;
        }

        const response = await axiosClient.get(API_ENDPOINTS.SCHEDULES.STATUS_COUNTS, { params });
        const data = unwrapApiData<Record<string, unknown>>(response);

        return {
            total_schedules: toNumberSafe(data.total_schedules, 0),
            available_schedules: toNumberSafe(data.available_schedules, 0),
            full_schedules: toNumberSafe(data.full_schedules, 0),
            cancelled_schedules: toNumberSafe(data.cancelled_schedules, 0),
        };
    },

    createSchedule: async (tourId: string | number, data: Partial<Schedule>): Promise<Schedule> => {
        const payload = {
            ...scheduleMapper.mapToRaw(data),
            tour_id: toNumberSafe(tourId),
        };
        const response = await axiosClient.post(API_ENDPOINTS.SCHEDULES.CREATE(tourId), payload);
        const rawResult = unwrapApiData<RawSchedule>(response);
        return scheduleMapper.mapFromRaw(rawResult as RawSchedule);
    },

    updateSchedule: async (id: string | number, data: Partial<Schedule>): Promise<Schedule> => {
        const payload = scheduleMapper.mapToRaw(data);
        const response = await axiosClient.put(API_ENDPOINTS.SCHEDULES.UPDATE(id), payload);
        const rawResult = unwrapApiData<RawSchedule>(response);
        return scheduleMapper.mapFromRaw(rawResult as RawSchedule);
    },

    updateScheduleStatus: async (id: string | number, status: string): Promise<boolean> => {
        await axiosClient.patch(API_ENDPOINTS.SCHEDULES.PATCH_STATUS(id), {
            status: apiStatusFromUi(status),
        });
        return true;
    },

    bulkUpdateStatus: async (ids: (string | number)[], status: string): Promise<void> => {
        const apiSt = apiStatusFromUi(status);
        const results = await Promise.allSettled(
            ids.map((id) =>
                axiosClient.patch(API_ENDPOINTS.SCHEDULES.PATCH_STATUS(id), { status: apiSt }),
            ),
        );
        const failed = results.filter((r) => r.status === 'rejected');
        if (failed.length > 0) {
            const first = failed[0];
            const reason = first.status === 'rejected' ? first.reason : null;
            const msg =
                reason instanceof AxiosError
                    ? (reason.response?.data as { message?: string })?.message
                    : undefined;
            throw new Error(
                msg || i18next.t('schedules:errors.bulk_status_update_failed'),
            );
        }
    },

    deleteSchedule: async (id: string | number): Promise<boolean> => {
        await axiosClient.delete(API_ENDPOINTS.SCHEDULES.DELETE(id));
        return true;
    },
};
