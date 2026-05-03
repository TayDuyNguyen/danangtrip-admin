import axiosClient from './axiosClient';
import type { LocationListResponse, LocationFilters } from '@/dataHelper/location.dataHelper';

const locationApi = {
    /**
     * Get list of locations with filters
     */
    getLocations: (params: Partial<LocationFilters>) => {
        return axiosClient.get<LocationListResponse>('/admin/locations', { params });
    },

    /**
     * Get location statistics summary
     */
    getStats: () => {
        return axiosClient.get('/admin/locations/stats');
    },

    /**
     * Delete a location
     */
    deleteLocation: (id: number) => {
        return axiosClient.delete(`/admin/locations/${id}`);
    },

    /**
     * Toggle featured status
     */
    toggleFeatured: (id: number, isFeatured: boolean) => {
        return axiosClient.patch(`/admin/locations/${id}/featured`, { is_featured: isFeatured });
    },

    /**
     * Update location status
     */
    updateStatus: (id: number, status: string) => {
        return axiosClient.patch(`/admin/locations/${id}/status`, { status });
    },

    /**
     * Bulk update status
     */
    bulkUpdateStatus: (ids: number[], status: string) => {
        return axiosClient.patch('/admin/locations/bulk-status', { ids, status });
    },

    /**
     * Bulk delete
     */
    bulkDelete: (ids: number[]) => {
        return axiosClient.post('/admin/locations/bulk-delete', { ids, _method: 'DELETE' });
    }
};

export default locationApi;
