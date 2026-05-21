import { API_ENDPOINTS } from '@/constants';
import axiosClient from './axiosClient';
import type { TourListData, TourFilters, TourStats, TourCategory } from '@/dataHelper/tour.dataHelper';
import { tourMapper, type RawTour, type TourViewModel } from '@/dataHelper/tour.mapper';
import { toNumberSafe } from '@/utils/safeConverters';

export interface ImageUploadResponse {
    url: string;
    public_id: string;
    asset_id: string;
}

function asRecord(payload: unknown): Record<string, unknown> {
    return (payload && typeof payload === 'object')
        ? (payload as Record<string, unknown>)
        : {};
}

function unwrapApiData<T>(payload: unknown): T {
    const obj = asRecord(payload);
    if ('data' in obj && obj.data !== undefined) {
        return obj.data as T;
    }
    return obj as T;
}

export const tourApi = {
    getTours: async (filters: TourFilters, page: number = 1, limit: number = 10): Promise<TourListData> => {
        const safeLimit = Math.min(Math.max(limit, 1), 100);

        const params: Record<string, unknown> = {
            page,
            per_page: safeLimit,
        };

        if (filters.q) params.search = filters.q;
        if (filters.tour_category_id && filters.tour_category_id !== 'all') {
            params.tour_category_id = toNumberSafe(filters.tour_category_id);
        }
        if (filters.status && filters.status !== 'all') {
            params.status = filters.status;
        }

        if (filters.booking_availability && filters.booking_availability !== 'all') {
            params.booking_availability = filters.booking_availability;
        }

        if (filters.type === 'featured') params.is_featured = 1;
        else if (filters.type === 'hot') params.is_hot = 1;
        else if (filters.type === 'normal') {
            params.is_featured = 0;
            params.is_hot = 0;
        }

        if (filters.sort) params.sort_by = filters.sort;
        if (filters.order) params.sort_order = filters.order;

        const response = await axiosClient.get(API_ENDPOINTS.TOURS.LIST, { params });
        const rawData = unwrapApiData<Record<string, unknown>>(response);
        const listCandidate = rawData.data;
        const rows: unknown[] = Array.isArray(listCandidate) ? listCandidate : [];

        return {
            data: rows.map((item) => tourMapper.mapFromRaw(item as RawTour)),
            total: toNumberSafe(rawData.total),
            current_page: toNumberSafe(rawData.current_page, page),
            per_page: toNumberSafe(rawData.per_page, safeLimit),
            last_page: toNumberSafe(rawData.last_page, 1)
        };
    },

    getTourStats: async (): Promise<TourStats> => {
        const fetchCount = async (params: Record<string, unknown>) => {
            try {
                const response = await axiosClient.get(API_ENDPOINTS.TOURS.LIST, { params });
                const data = unwrapApiData<Record<string, unknown>>(response);
                return toNumberSafe(data.total, 0);
            } catch {
                return 0;
            }
        };

        const [total_tours, active_tours, featured_tours, sold_out_tours] = await Promise.all([
            fetchCount({ per_page: 1 }),
            fetchCount({ status: 'active', per_page: 1 }),
            fetchCount({ is_featured: 1, per_page: 1 }),
            fetchCount({ booking_availability: 'sold_out', per_page: 1 }),
        ]);

        return {
            total_tours,
            active_tours,
            featured_tours,
            sold_out_tours,
        };
    },

    getTourCategories: async (scope: 'public' | 'admin' = 'public'): Promise<TourCategory[]> => {
        const endpoint = scope === 'admin' ? API_ENDPOINTS.TOURS.ADMIN_CATEGORIES : API_ENDPOINTS.TOURS.CATEGORIES;
        const response = await axiosClient.get(endpoint);
        const data = unwrapApiData<unknown>(response);
        return Array.isArray(data) ? (data as TourCategory[]) : [];
    },

    createTour: async (data: Record<string, unknown>): Promise<Record<string, unknown>> => {
        const payload = tourMapper.mapToRaw(data);
        const response = await axiosClient.post(API_ENDPOINTS.TOURS.CREATE, payload);
        return unwrapApiData<Record<string, unknown>>(response);
    },

    getTour: async (id: number | string): Promise<TourViewModel> => {
        const response = await axiosClient.get(API_ENDPOINTS.TOURS.DETAIL(id));
        const data = unwrapApiData<RawTour>(response);
        return tourMapper.mapFromRaw(data as RawTour);
    },

    updateTour: async (id: number | string, data: Record<string, unknown>): Promise<Record<string, unknown>> => {
        const payload = tourMapper.mapToRaw(data);
        const response = await axiosClient.put(API_ENDPOINTS.TOURS.UPDATE(id), payload);
        return unwrapApiData<Record<string, unknown>>(response);
    },

    updateStatus: async (id: number | string, status: string): Promise<boolean> => {
        await axiosClient.patch(API_ENDPOINTS.TOURS.PATCH_STATUS(id), { status });
        return true;
    },

    toggleFeatured: async (id: number | string, is_featured: boolean): Promise<boolean> => {
        await axiosClient.patch(API_ENDPOINTS.TOURS.PATCH_FEATURED(id), { is_featured });
        return true;
    },

    toggleHot: async (id: number | string, is_hot: boolean): Promise<boolean> => {
        await axiosClient.patch(API_ENDPOINTS.TOURS.PATCH_HOT(id), { is_hot });
        return true;
    },

    deleteTour: async (id: number | string): Promise<boolean> => {
        await axiosClient.delete(API_ENDPOINTS.TOURS.DELETE(id));
        return true;
    },

    uploadImage: async (file: File): Promise<ImageUploadResponse> => {
        const formData = new FormData();
        formData.append('image', file);
        const response = await axiosClient.post(API_ENDPOINTS.UPLOAD.IMAGE, formData);
        return unwrapApiData<ImageUploadResponse>(response);
    },

    uploadImages: async (files: File[]): Promise<ImageUploadResponse[]> => {
        const formData = new FormData();
        files.forEach(file => formData.append('images[]', file));
        const response = await axiosClient.post(API_ENDPOINTS.UPLOAD.IMAGES, formData);
        const data = unwrapApiData<unknown>(response);
        if (Array.isArray(data)) {
            return data as ImageUploadResponse[];
        }
        const obj = asRecord(data);
        const items = obj.items;
        return Array.isArray(items) ? (items as ImageUploadResponse[]) : [];
    },

    deleteUploadedImage: async (public_id: string): Promise<boolean> => {
        await axiosClient.delete(API_ENDPOINTS.UPLOAD.DELETE, {
            data: { public_id }
        });
        return true;
    },

    exportExcel: async (filters: Partial<TourFilters>): Promise<void> => {
        const params: Record<string, unknown> = {};
        if (filters.q) params.search = filters.q;
        if (filters.tour_category_id && filters.tour_category_id !== 'all') {
            params.tour_category_id = toNumberSafe(filters.tour_category_id);
        }
        if (filters.status && filters.status !== 'all') params.status = filters.status;
        if (filters.booking_availability && filters.booking_availability !== 'all') {
            params.booking_availability = filters.booking_availability;
        }
        if (filters.type === 'featured') params.is_featured = 1;
        else if (filters.type === 'hot') params.is_hot = 1;
        else if (filters.type === 'normal') {
            params.is_featured = 0;
            params.is_hot = 0;
        }
        if (filters.sort) params.sort_by = filters.sort;
        if (filters.order) params.sort_order = filters.order;

        const response = await axiosClient.get(API_ENDPOINTS.EXPORT.TOURS, {
            params,
            responseType: 'blob'
        });

        const dateStr = new Date().toISOString().split('T')[0];
        const filename = `danh-sach-tour_${dateStr}.xlsx`;

        const url = window.URL.createObjectURL(new Blob([response.data as BlobPart]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
    }
};
