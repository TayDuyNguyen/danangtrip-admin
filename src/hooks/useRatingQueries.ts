import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { reportApi } from '@/api/reportApi';
import { mapRatingsList } from '@/dataHelper/rating.mapper';
import type { RatingsListFilters } from '@/dataHelper/rating.dataHelper';
import type { RatingsReportFilters } from '@/dataHelper/report.dataHelper';
import { getLocalizedApiErrorMessage } from '@/utils/apiError';
import { prepareSpreadsheetDownload, downloadBlobFile } from '@/utils';
import { toast } from 'sonner';

const ratingKeys = {
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
        retry: false,
    });
};

/**
 * Mutations hook for hiding, deleting and exporting ratings.
 */
export const useAdminRatingMutations = () => {
    const queryClient = useQueryClient();
    const { t } = useTranslation('ratings');

    const invalidateRatingQueries = () => {
        void queryClient.invalidateQueries({ queryKey: ['reports'] });
        void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    };

    const rejectMutation = useMutation({
        mutationFn: ({ id, rejected_reason }: { id: string | number; rejected_reason: string }) =>
            reportApi.rejectRating(id, { rejected_reason }),
        onSuccess: () => {
            toast.success(t('success.hide', { defaultValue: 'Đã ẩn đánh giá thành công.' }));
            invalidateRatingQueries();
        },
        onError: (err: unknown) => {
            const errMsg = getLocalizedApiErrorMessage(
                t('error.hide', { defaultValue: 'Có lỗi xảy ra khi ẩn đánh giá.' }),
                err
            );
            toast.error(errMsg);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string | number) => reportApi.deleteRating(id),
        onSuccess: () => {
            toast.success(t('success.delete', { defaultValue: 'Đã xóa đánh giá vĩnh viễn.' }));
            invalidateRatingQueries();
        },
        onError: (err: unknown) => {
            const errMsg = getLocalizedApiErrorMessage(
                t('error.delete', { defaultValue: 'Có lỗi xảy ra khi xóa đánh giá.' }),
                err
            );
            toast.error(errMsg);
        },
    });

    const exportMutation = useMutation({
        mutationFn: async ({ params, fallbackFilename }: { params: RatingsReportFilters; fallbackFilename: string }) => {
            const response = await reportApi.exportRatingsReport(params);
            const prepared = await prepareSpreadsheetDownload(response, fallbackFilename);
            if (!prepared.ok) throw new Error(prepared.error);
            downloadBlobFile(prepared.blob, prepared.filename);
        },
    });

    const markViewedMutation = useMutation({
        mutationFn: (id: string | number) => reportApi.markRatingViewed(id),
        onSuccess: () => {
            toast.success(t('success.mark_viewed', { defaultValue: 'Đã đánh dấu đánh giá là đã xem.' }));
            invalidateRatingQueries();
        },
        onError: (err: unknown) => {
            const errMsg = getLocalizedApiErrorMessage(
                t('error.mark_viewed', { defaultValue: 'Có lỗi xảy ra khi đánh dấu đã xem.' }),
                err
            );
            toast.error(errMsg);
        },
    });

    return {
        rejectMutation,
        deleteMutation,
        exportMutation,
        markViewedMutation,
        invalidateRatingQueries,
    };
};
