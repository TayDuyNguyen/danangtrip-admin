import axiosClient from './axiosClient';
import type { TourListData, TourFilters, TourStats, TourCategory } from '@/dataHelper/tour.dataHelper';
import { tourMapper, type RawTour } from '@/dataHelper/tour.mapper';
import { toNumberSafe } from '@/utils/safeConverters';

export const tourApi = {
    getTours: async (filters: TourFilters, page: number = 1, limit: number = 10): Promise<TourListData> => {
        const params: Record<string, unknown> = {
            page,
            per_page: limit,
        };

        // Mapping filters according to spec
        if (filters.q) params.q = filters.q;
        if (filters.tour_category_id && filters.tour_category_id !== 'all') {
            params.tour_category_id = filters.tour_category_id;
        }
        if (filters.status && filters.status !== 'all') {
            params.status = filters.status;
        }

        // Handle 'type' filter (featured, hot, normal)
        if (filters.type === 'featured') params.is_featured = 1;
        else if (filters.type === 'hot') params.is_hot = 1;
        else if (filters.type === 'normal') {
            params.is_featured = 0;
            params.is_hot = 0;
        }

        if (filters.sort) params.sort = filters.sort;
        if (filters.order) params.order = filters.order;

        const response = await axiosClient.get('/tours', { params });
        const rawData = response.data as unknown as Record<string, unknown>;
        const listCandidate = rawData.data;
        const rows: unknown[] = Array.isArray(listCandidate) ? listCandidate : [];

        return {
            data: rows.map((item) => tourMapper.mapFromRaw(item as RawTour)),
            total: toNumberSafe(rawData.total),
            current_page: toNumberSafe(rawData.current_page, page),
            per_page: toNumberSafe(rawData.per_page, limit),
            last_page: toNumberSafe(rawData.last_page, 1)
        };
    },

    getTourStats: async (): Promise<TourStats> => {
        const fetchCount = async (params: Record<string, unknown>) => {
            try {
                const response = await axiosClient.get('/tours', { params });
                const data = response.data as Record<string, unknown>;
                return (data?.total as number) || (response as unknown as Record<string, unknown>)?.total as number || 0;
            } catch (error) {
                console.error(`Failed to fetch stats for ${JSON.stringify(params)}:`, error);
                return 0;
            }
        };

        const [total_tours, active_tours, featured_tours, sold_out_tours] = await Promise.all([
            fetchCount({ per_page: 1 }),
            fetchCount({ status: 'active', per_page: 1 }),
            fetchCount({ is_featured: 1, per_page: 1 }),
            fetchCount({ status: 'sold_out', per_page: 1 }),
        ]);

        return {
            total_tours,
            active_tours,
            featured_tours,
            sold_out_tours,
        };
    },

    getTourCategories: async (): Promise<TourCategory[]> => {
        const response = await axiosClient.get('/tour-categories');
        return response.data?.data || response.data;
    },

    createTour: async (data: Record<string, unknown>): Promise<Record<string, unknown>> => {
        const payload = tourMapper.mapToRaw(data);
        const response = await axiosClient.post('/admin/tours', payload);
        return response.data;
    },

    updateStatus: async (id: number | string, status: string): Promise<boolean> => {
        const response = await axiosClient.patch(`/admin/tours/${id}/status`, { status });
        return response.data?.code === 200;
    },

    toggleFeatured: async (id: number | string, is_featured: boolean): Promise<boolean> => {
        const response = await axiosClient.patch(`/admin/tours/${id}/featured`, { is_featured });
        return response.data?.code === 200;
    },

    toggleHot: async (id: number | string, is_hot: boolean): Promise<boolean> => {
        const response = await axiosClient.patch(`/admin/tours/${id}/hot`, { is_hot });
        return response.data?.code === 200;
    },

    deleteTour: async (id: number | string): Promise<boolean> => {
        const response = await axiosClient.delete(`/admin/tours/${id}`);
        return response.data?.code === 200;
    },

    uploadImage: async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append('image', file);
        const response = await axiosClient.post('/upload/image', formData);
        return response.data?.data?.url || response.data?.url;
    },

    uploadImages: async (files: File[]): Promise<string[]> => {
        const formData = new FormData();
        files.forEach(file => formData.append('images[]', file));
        const response = await axiosClient.post('/upload/images', formData);
        return (response.data?.data || []).map((item: { url: string }) => item.url);
    },

    exportExcel: async (filters: Partial<TourFilters>): Promise<void> => {
        const cleanedFilters: Partial<TourFilters> = {};
        (Object.keys(filters) as Array<keyof TourFilters>).forEach((key) => {
            const value = filters[key];
            if (value !== undefined && value !== 'all' && value !== '') {
                (cleanedFilters as Record<string, unknown>)[key] = value;
            }
        });

        const response = await axiosClient.get('/admin/tours/export', {
            params: cleanedFilters,
            responseType: 'blob'
        });

        const url = window.URL.createObjectURL(new Blob([response.data as BlobPart]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'danh-sach-tour.xlsx');
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
    }
};
