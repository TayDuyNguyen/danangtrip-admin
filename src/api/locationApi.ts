import axiosClient from './axiosClient';
import { toAdminLocationParams } from './locationQueryParams';
import { API_ENDPOINTS } from '@/constants/endpoints';
import type { LocationListResponse, LocationFilters } from '@/dataHelper/location.dataHelper';
import type { ApiResponse, RawLocation, Paginator, RawRating, RawRatingStats, PaginationParams } from '@/types';
import type { CreateLocationInput } from '@/validations/location.schema';
import type { AxiosResponse } from 'axios';
import { downloadBlobFile, prepareSpreadsheetDownload } from '@/utils/spreadsheetExport';

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

    getStats: (params?: { from?: string; to?: string }): Promise<ApiResponse<LocationStatsPayload>> =>
        axiosClient.get(API_ENDPOINTS.LOCATIONS.STATS, { params }),

    getAdminDistricts: (): Promise<ApiResponse<string[]>> =>
        axiosClient.get(API_ENDPOINTS.LOCATIONS.DISTRICTS),

    getPublicCategories: (): Promise<ApiResponse<PublicCategoryOption[]>> =>
        axiosClient.get(API_ENDPOINTS.LOCATIONS.CATEGORIES),

    getTags: (type?: string): Promise<ApiResponse<TagOption[]>> =>
        axiosClient.get(API_ENDPOINTS.LOCATIONS.TAGS, { params: type ? { type } : {} }),

    getAmenities: (): Promise<ApiResponse<AmenityOption[]>> =>
        axiosClient.get(API_ENDPOINTS.LOCATIONS.AMENITIES),

    createLocation: (data: CreateLocationInput): Promise<ApiResponse<{ id: number }>> =>
        axiosClient.post(API_ENDPOINTS.LOCATIONS.CREATE, data),

    getDetail: (id: string | number): Promise<ApiResponse<RawLocation>> =>
        axiosClient.get(API_ENDPOINTS.LOCATIONS.DETAIL(id)),

    updateLocation: (id: string | number, data: Partial<CreateLocationInput>): Promise<ApiResponse<void>> =>
        axiosClient.put(API_ENDPOINTS.LOCATIONS.UPDATE(id), data),

    deleteLocation: (id: number) => axiosClient.delete(API_ENDPOINTS.LOCATIONS.DELETE(id)),

    toggleFeatured: (id: number, isFeatured: boolean) =>
        axiosClient.patch(API_ENDPOINTS.LOCATIONS.PATCH_FEATURED(id), { is_featured: isFeatured }),

    updateStatus: (id: number, status: string) =>
        axiosClient.patch(API_ENDPOINTS.LOCATIONS.PATCH_STATUS(id), { status }),

    getRatingStats: (id: string | number): Promise<ApiResponse<RawRatingStats>> =>
        axiosClient.get(API_ENDPOINTS.LOCATIONS.RATING_STATS(id)),

    getRatings: (id: string | number, params?: PaginationParams): Promise<ApiResponse<Paginator<RawRating>>> =>
        axiosClient.get(API_ENDPOINTS.LOCATIONS.RATINGS(id), { params }),

    exportExcel: async (filters: LocationFilters): Promise<void> => {
        const params = toAdminLocationParams(filters);
        const response = (await axiosClient.get(API_ENDPOINTS.EXPORT.LOCATIONS, {
            params,
            responseType: 'blob',
        })) as AxiosResponse<Blob>;
        const dateStr = new Date().toISOString().split('T')[0];
        const fallback = `danh-sach-dia-diem_${dateStr}.xlsx`;
        const prepared = await prepareSpreadsheetDownload(response, fallback);
        if (!prepared.ok) throw new Error(prepared.error);
        downloadBlobFile(prepared.blob, prepared.filename);
    },
};

export default locationApi;
