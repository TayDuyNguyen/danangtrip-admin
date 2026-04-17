import axiosClient from './axiosClient';
import type { TourListData, TourFilters, TourStats, TourCategory } from '@/dataHelper/tour.dataHelper';

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
        const result = response.data as unknown as TourListData;
        return result;
    },

    getTourStats: async (): Promise<TourStats> => {
        // Implement robust requests to handle individual failures (e.g. 422 on sold_out)
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
            fetchCount({ status: 'sold_out', per_page: 1 }), // Kept for logic, but fetchCount handles the 422
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

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'danh-sach-tour.xlsx');
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
    }
};
