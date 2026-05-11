import axiosClient from './axiosClient';
import { toAdminLocationParams } from './locationQueryParams';
import { API_ENDPOINTS } from '@/constants/endpoints';
import type { LocationListResponse, LocationFilters } from '@/dataHelper/location.dataHelper';
import type { ApiResponse } from '@/types';
import type { CreateLocationInput } from '@/validations/location.schema';

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

export type TagOption = {
    id: number;
    name: string;
};

export type AmenityOption = {
    id: number;
    name: string;
    icon?: string;
};

const locationApi = {
    getLocations: (filters: LocationFilters): Promise<ApiResponse<LocationListResponse>> =>
        axiosClient.get(API_ENDPOINTS.LOCATIONS.LIST, {
            params: toAdminLocationParams(filters),
        }),

    getStats: (): Promise<ApiResponse<LocationStatsPayload>> =>
        axiosClient.get(API_ENDPOINTS.LOCATIONS.STATS),

    getAdminDistricts: (): Promise<ApiResponse<string[]>> =>
        axiosClient.get(API_ENDPOINTS.LOCATIONS.DISTRICTS),

    getPublicCategories: (): Promise<ApiResponse<PublicCategoryOption[]>> =>
        axiosClient.get(API_ENDPOINTS.LOCATIONS.CATEGORIES),

    getTags: (type = 'location'): Promise<ApiResponse<TagOption[]>> =>
        axiosClient.get(API_ENDPOINTS.LOCATIONS.TAGS, { params: { type } }),

    getAmenities: (): Promise<ApiResponse<AmenityOption[]>> =>
        axiosClient.get(API_ENDPOINTS.LOCATIONS.AMENITIES),

    createLocation: (data: CreateLocationInput): Promise<ApiResponse<{ id: number }>> =>
        axiosClient.post(API_ENDPOINTS.LOCATIONS.CREATE, data),

    deleteLocation: (id: number) => axiosClient.delete(API_ENDPOINTS.LOCATIONS.DELETE(id)),

    toggleFeatured: (id: number, isFeatured: boolean) =>
        axiosClient.patch(API_ENDPOINTS.LOCATIONS.PATCH_FEATURED(id), { is_featured: isFeatured }),

    updateStatus: (id: number, status: string) =>
        axiosClient.patch(API_ENDPOINTS.LOCATIONS.PATCH_STATUS(id), { status }),
};

export default locationApi;
