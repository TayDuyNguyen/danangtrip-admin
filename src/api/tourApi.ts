import axiosClient from './axiosClient';
import type { TourListData, TourFilters } from '@/dataHelper/tour.dataHelper';

export const tourApi = {
    getTours: async (filters: TourFilters, page: number = 1, limit: number = 10): Promise<TourListData> => {
        // Updated to use actual API endpoint pattern
        // The backend should implement GET /admin/tours matching the previous params
        const response = await axiosClient.get('/admin/tours', {
            params: { ...filters, page, limit }
        });
        
        return response.data;
    },

    deleteTour: async (id: string): Promise<boolean> => {
        const response = await axiosClient.delete(`/admin/tours/${id}`);
        return response.data?.success || true;
    }
};
