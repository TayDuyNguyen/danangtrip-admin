import axiosClient from './axiosClient';
import { API_ENDPOINTS } from '@/constants';
import type { RawRatingsReport, RatingsReportFilters } from '@/dataHelper/report.dataHelper';
import type { ApiResponse } from '@/types';
import type { AxiosResponse } from 'axios';

export const reportApi = {
    getRatingsReport: (params: RatingsReportFilters): Promise<ApiResponse<RawRatingsReport>> =>
        axiosClient.get(API_ENDPOINTS.REPORTS.RATINGS, { params }),

    exportRatingsReport: (params: RatingsReportFilters): Promise<AxiosResponse<Blob>> =>
        axiosClient.get(API_ENDPOINTS.EXPORT.RATINGS, {
            params,
            responseType: 'blob',
        }) as Promise<AxiosResponse<Blob>>,

    approveRating: (id: string | number): Promise<ApiResponse<unknown>> =>
        axiosClient.patch(API_ENDPOINTS.RATINGS.APPROVE(id)),

    rejectRating: (id: string | number): Promise<ApiResponse<unknown>> =>
        axiosClient.patch(API_ENDPOINTS.RATINGS.REJECT(id)),

    deleteRating: (id: string | number): Promise<ApiResponse<unknown>> =>
        axiosClient.delete(API_ENDPOINTS.RATINGS.DELETE(id)),
};
