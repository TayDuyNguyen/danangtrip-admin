import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reportApi } from '@/api/reportApi';
import { mapRatingsList } from '@/dataHelper/rating.mapper';
import type { RatingsListFilters } from '@/dataHelper/rating.dataHelper';
import type { RatingsReportFilters } from '@/dataHelper/report.dataHelper';
import { getLocalizedApiErrorMessage } from '@/utils/apiError';
import { prepareSpreadsheetDownload, downloadBlobFile } from '@/utils';
import { toast } from 'sonner';

export const ratingKeys = {
    all: ['reports', 'ratings-list'] as const,
    list: (params: RatingsListFilters) => [...ratingKeys.all, params] as const,
};

/**
 * Query hook to fetch paginated ratings list for the admin ratings management page.
 */
export const useAdminRatingsListQuery = (params: RatingsListFilters) => {
    return useQuery({
        queryKey: ratingKeys.list(params),
        queryFn: async () => {
            const response = await reportApi.getRatingsList(params);
            return mapRatingsList(response.data);
        },
        staleTime: 1000 * 15, // 15 seconds
    });
};

/**
 * Mutations hook for hiding, deleting and exporting ratings.
 */
export const useAdminRatingMutations = () => {
    const queryClient = useQueryClient();

    const approveMutation = useMutation({
        mutationFn: (id: string | number) => reportApi.approveRating(id),
        onSuccess: () => {
            toast.success('Đã phê duyệt đánh giá thành công.');
            queryClient.invalidateQueries({ queryKey: ['reports'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
        onError: (err: unknown) => {
            const errMsg = getLocalizedApiErrorMessage('Có lỗi xảy ra khi phê duyệt đánh giá.', err);
            toast.error(errMsg);
        }
    });

    const rejectMutation = useMutation({
        mutationFn: ({ id, rejected_reason }: { id: string | number; rejected_reason: string }) => 
            reportApi.rejectRating(id, { rejected_reason }),
        onSuccess: () => {
            toast.success('Đã ẩn đánh giá thành công.');
            queryClient.invalidateQueries({ queryKey: ['reports'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
        onError: (err: unknown) => {
            const errMsg = getLocalizedApiErrorMessage('Có lỗi xảy ra khi ẩn đánh giá.', err);
            toast.error(errMsg);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string | number) => reportApi.deleteRating(id),
        onSuccess: () => {
            toast.success('Đã xóa đánh giá vĩnh viễn.');
            queryClient.invalidateQueries({ queryKey: ['reports'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
        onError: (err: unknown) => {
            const errMsg = getLocalizedApiErrorMessage('Có lỗi xảy ra khi xóa đánh giá.', err);
            toast.error(errMsg);
        }
    });

    const exportMutation = useMutation({
        mutationFn: async ({ params, fallbackFilename }: { params: RatingsReportFilters; fallbackFilename: string }) => {
            const response = await reportApi.exportRatingsReport(params);
            const prepared = await prepareSpreadsheetDownload(response, fallbackFilename);
            if (!prepared.ok) throw new Error(prepared.error);
            downloadBlobFile(prepared.blob, prepared.filename);
        },
        onSuccess: () => {
            toast.success('Xuất file Excel thành công.');
        },
        onError: () => {
            toast.error('Xuất file Excel thất bại.');
        }
    });

    return {
        approveMutation,
        rejectMutation,
        deleteMutation,
        exportMutation,
    };
};
export default useAdminRatingMutations;
