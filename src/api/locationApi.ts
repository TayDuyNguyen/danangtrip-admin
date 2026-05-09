import axiosClient from './axiosClient';
import { toAdminLocationParams } from './locationQueryParams';
import type { LocationListResponse, LocationFilters } from '@/dataHelper/location.dataHelper';
import type { ApiResponse } from '@/types';

export type LocationStatsPayload = {
    total: number;
    active: number;
    featured: number;
    total_views: number;
};

export type PublicCategoryOption = {
    id: number;
    name: string;
};

const locationApi = {
    getLocations: (filters: LocationFilters): Promise<ApiResponse<LocationListResponse>> =>
        axiosClient.get('/admin/locations', {
            params: toAdminLocationParams(filters),
        }),

    getStats: (): Promise<ApiResponse<LocationStatsPayload>> =>
        axiosClient.get('/admin/locations/stats'),

    getAdminDistricts: (): Promise<ApiResponse<string[]>> =>
        axiosClient.get('/admin/locations/districts'),

    getPublicCategories: (): Promise<ApiResponse<PublicCategoryOption[]>> =>
        axiosClient.get('/categories'),

    deleteLocation: (id: number) => axiosClient.delete(`/admin/locations/${id}`),

    toggleFeatured: (id: number, isFeatured: boolean) =>
        axiosClient.patch(`/admin/locations/${id}/featured`, { is_featured: isFeatured }),

    updateStatus: (id: number, status: string) =>
        axiosClient.patch(`/admin/locations/${id}/status`, { status }),
};

export default locationApi;
