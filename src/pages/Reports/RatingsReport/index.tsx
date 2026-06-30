import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { useRatingsReportQuery, useReportMutations } from '@/hooks/useReportQueries';
import useReportMockMode, { useReportApiErrorToast } from '../shared/useReportMockMode';
import { REPORTS_MOCK_PARAM, parseReportPerPage } from '../shared/reports.constants';
import ReportPageShell from '../shared/ReportPageShell';
import { downloadMockCsv } from '../shared/mockExportCsv';
import { getStableMockFactor } from '../shared/mockData';
import ReportFilterBar from './components/ReportFilterBar';
import RatingStatsCards from './components/RatingStatsCards';
import RatingsReportCharts from './components/RatingsReportCharts';
import RatingsReportTable from './components/RatingsReportTable';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import type { 
    RatingsReportViewModel, 
    TrendChartDataPoint, 
    StarDistributionPoint, 
    StatusDistributionPoint, 
    TypeDistributionPoint,
    RatingsReportItemViewModel
} from '@/dataHelper/report.dataHelper';

// Date utility helpers
const getFirstDayOfMonth = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
};

const getToday = () => {
    return new Date().toISOString().split('T')[0];
};

/**
 * Generate premium mock data fallback when API endpoints are not ready
 */
const getMockRatingsReportData = (filters: {
    from: string;
    to: string;
    status: 'all' | 'pending' | 'approved' | 'rejected';
    type: 'all' | 'location' | 'tour';
    page: number;
    per_page: number;
    user_id?: string | number;
}): RatingsReportViewModel => {
    const start = new Date(filters.from);
    const end = new Date(filters.to);
    const trend: TrendChartDataPoint[] = [];
    const daysDiff = Math.max(1, Math.min(60, Math.round((end.getTime() - start.getTime()) / (1000 * 3600 * 24))));

    const baseRatings = 3;

    for (let i = 0; i <= daysDiff; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        const dateString = d.toISOString().split('T')[0];

        const factor = getStableMockFactor(start.getFullYear() + i, 0.4, 1.6);
        const dailyTotal = Math.round(baseRatings * factor);
        const dailyApproved = Math.round(dailyTotal * 0.8);

        trend.push({
            label: dateString.split('-').slice(1).reverse().join('/'),
            total: dailyTotal,
            approved: dailyApproved,
        });
    }

    const stars: StarDistributionPoint[] = [
        { stars: 5, count: 120, percentage: 60 },
        { stars: 4, count: 50, percentage: 25 },
        { stars: 3, count: 20, percentage: 10 },
        { stars: 2, count: 7, percentage: 3.5 },
        { stars: 1, count: 3, percentage: 1.5 },
    ];

    const statuses: StatusDistributionPoint[] = [
        { status: 'approved', labelKey: 'filter.status_approved', count: 170, percentage: 85, color: '#10B981' },
        { status: 'pending', labelKey: 'filter.status_pending', count: 20, percentage: 10, color: '#F59E0B' },
        { status: 'rejected', labelKey: 'filter.status_rejected', count: 10, percentage: 5, color: '#EF4444' },
    ];

    const types: TypeDistributionPoint[] = [
        { type: 'location', labelKey: 'filter.type_location', count: 85, average: 4.6 },
        { type: 'tour', labelKey: 'filter.type_tour', count: 115, average: 4.3 },
    ];

    const stats = {
        total: 200,
        totalTrend: 12.5,
        new: 20,
        viewed: 180,
        pending: 20,
        pendingTrend: -15.2,
        approved: 170,
        approvedTrend: 18.4,
        average: 4.4,
        averageTrend: 2.1,
    };

    const reviewableNames = {
        tour: [
            "Tour Ngũ Hành Sơn - Hội An 1 ngày",
            "Tour du ngoạn Bà Nà Hills - Cáp treo đạt kỷ lục",
            "Tour Cù Lao Chàm lặn ngắm san hô & hải sản du thuyền",
            "Tour tham quan Cố đô Huế 1 ngày từ Đà Nẵng",
            "Tour Công viên suối khoáng nóng Núi Thần Tài",
            "Tour Đô Thị Cổ Hội An & Trải nghiệm thả đèn hoa đăng"
        ],
        location: [
            "Chùa Linh Ứng Bán Đảo Sơn Trà",
            "Cầu Rồng Đà Nẵng",
            "Bãi biển Mỹ Khê",
            "Ngũ Hành Sơn",
            "Rừng Dừa Bảy Mẫu",
            "Chợ Cồn Đà Nẵng"
        ]
    };

    const userNames = [
        "Nguyễn Hoàng Anh", "Trần Minh Tâm", "Lê Khánh Chi", "Phạm Văn Dũng",
        "Vũ Hoàng Yến", "Đặng Hữu Quốc", "Hoàng Kim Liên", "Phan Gia Huy",
        "Đỗ Phương Nam", "Bùi Kiều Trang"
    ];

    const comments = [
        "Dịch vụ tuyệt vời, hướng dẫn viên nhiệt tình vui tính. Gia đình tôi rất hài lòng!",
        "Chuyến đi rất vui, cảnh đẹp xuất sắc, đồ ăn ngon và phong phú.",
        "Độ hoàn thiện dịch vụ tốt, giá cả hợp lý, đáng tiền trải nghiệm.",
        "Cần cải thiện thời gian đón khách, hơi trễ một chút nhưng nhìn chung ổn.",
        "Mọi thứ hoàn hảo từ khâu chuẩn bị đến khâu đưa đón, 5 sao!",
        "Địa điểm đẹp, nhân viên hỗ trợ chu đáo nhiệt tình.",
        "Trải nghiệm tuyệt vời, nhất định sẽ giới thiệu cho bạn bè đồng nghiệp.",
        "Phong cảnh tuyệt đẹp nhưng hơi đông khách du lịch vào dịp cuối tuần.",
        "Đồ ăn tạm ổn, xe đưa đón sạch sẽ, lái xe cẩn thận an toàn.",
        "Hài lòng với chuyến đi này, cám ơn đội ngũ hỗ trợ."
    ];

    const imagesList = [
        "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=150",
        "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=150",
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=150"
    ];

    const statusOptions = ['pending', 'approved', 'rejected'] as const;
    const typeOptions = ['location', 'tour'] as const;

    const items: RatingsReportItemViewModel[] = [];
    const perPage = filters.per_page;
    const offset = (filters.page - 1) * perPage;

    // Filter simulation based on filters
    const selectedStatus = filters.status;
    const selectedType = filters.type;

    let targetCount = filters.user_id ? 4 : 50;
    if (selectedStatus !== 'all' && !filters.user_id) {
        targetCount = selectedStatus === 'approved' ? 35 : selectedStatus === 'pending' ? 10 : 5;
    }

    for (let i = 0; i < perPage; i++) {
        const itemIdx = offset + i;
        if (itemIdx >= targetCount) break;

        const id = 30200 + itemIdx;
        const type = selectedType !== 'all' ? selectedType : typeOptions[itemIdx % typeOptions.length];
        const status = selectedStatus !== 'all' ? selectedStatus : statusOptions[itemIdx % statusOptions.length];
        const score = status === 'rejected' ? 2 : (itemIdx % 5) + 1 === 1 ? 3 : (itemIdx % 5) + 1 === 2 ? 4 : 5;
        const targetList = reviewableNames[type];
        const targetName = targetList[itemIdx % targetList.length];

        const dateObj = new Date(Date.now() - (itemIdx * 8 * 3600 * 1000));
        const datePart = dateObj.toISOString().split('T')[0].split('-').reverse().join('/');
        const timePart = dateObj.toTimeString().split(' ')[0].substring(0, 5);

        items.push({
            id,
            score,
            comment: comments[itemIdx % comments.length],
            images: itemIdx % 3 === 0 ? imagesList.slice(0, (itemIdx % 2) + 1) : [],
            status,
            reviewableType: type,
            reviewableId: 100 + itemIdx,
            reviewableName: targetName,
            userName: filters.user_id ? `User ${filters.user_id}` : userNames[itemIdx % userNames.length],
            userAvatar: '',
            createdAt: datePart,
            createdAtTime: timePart
        });
    }

    return {
        stats,
        charts: {
            trend,
            stars,
            statuses,
            types,
        },
        table: {
            items,
            pagination: {
                currentPage: filters.page,
                lastPage: Math.ceil(targetCount / perPage),
                perPage,
                total: targetCount,
            },
        },
    };
};

const RatingsReport: React.FC = () => {
    const { t } = useTranslation(['ratings', 'common', 'reports_common']);
    const { t: tCommon } = useTranslation('reports_common');
    const [searchParams, setSearchParams] = useSearchParams();
    const { isMockMode, toggleMockMode, enableMockMode } = useReportMockMode();

    const initialUserId = searchParams.get('user_id') || undefined;
    const initialFrom = searchParams.get('from') !== null
        ? (searchParams.get('from') || '')
        : (initialUserId ? '' : getFirstDayOfMonth());
    const initialTo = searchParams.get('to') !== null
        ? (searchParams.get('to') || '')
        : (initialUserId ? '' : getToday());
    const initialStatus = (searchParams.get('status') as 'all' | 'pending' | 'approved' | 'rejected') || 'all';
    const initialType = (searchParams.get('type') as 'all' | 'location' | 'tour') || 'all';
    const initialPage = Number(searchParams.get('page')) || 1;
    const initialPerPage = parseReportPerPage(searchParams.get('per_page'));

    const [localFilters, setLocalFilters] = useState<{
        from: string;
        to: string;
        status: 'all' | 'pending' | 'approved' | 'rejected';
        type: 'all' | 'location' | 'tour';
        user_id?: string | number;
    }>({
        from: initialFrom,
        to: initialTo,
        status: initialStatus,
        type: initialType,
        user_id: initialUserId,
    });

    const [activeFilters, setActiveFilters] = useState<{
        from: string;
        to: string;
        status: 'all' | 'pending' | 'approved' | 'rejected';
        type: 'all' | 'location' | 'tour';
        page: number;
        per_page: number;
        user_id?: string | number;
    }>({
        from: initialFrom,
        to: initialTo,
        status: initialStatus,
        type: initialType,
        page: initialPage,
        per_page: initialPerPage,
        user_id: initialUserId,
    });

    useEffect(() => {
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            next.set('from', activeFilters.from);
            next.set('to', activeFilters.to);
            next.set('status', activeFilters.status);
            next.set('type', activeFilters.type);
            next.set('page', String(activeFilters.page));
            next.set('per_page', String(activeFilters.per_page));
            if (activeFilters.user_id) next.set('user_id', String(activeFilters.user_id));
            else next.delete('user_id');
            if (isMockMode) next.set(REPORTS_MOCK_PARAM, '1');
            else next.delete(REPORTS_MOCK_PARAM);
            return next;
        }, { replace: true });
    }, [activeFilters, isMockMode, setSearchParams]);

    // 3. React Query to load reports data (disabled when Mock Mode is active)
    const {
        data: realData,
        isLoading: isRealLoading,
        isError: isRealError,
        refetch,
        isFetching: isRealFetching,
    } = useRatingsReportQuery(activeFilters, { enabled: !isMockMode });

    useReportApiErrorToast(isRealError, isMockMode);
    const showErrorPanel = isRealError && !isMockMode;

    // Determine final loading and data states
    const isLoading = !isMockMode && isRealLoading;
    const isFetching = !isMockMode && isRealFetching;

    const data = isMockMode
        ? getMockRatingsReportData(activeFilters)
        : realData;

    // 4. Report mutations hooks
    const {
        exportMutation,
        approveMutation,
        rejectMutation,
        deleteMutation,
    } = useReportMutations();

    const isModerating =
        approveMutation.isPending ||
        rejectMutation.isPending ||
        deleteMutation.isPending;

    // 5. Handlers
    const applyFilterValues = useCallback((values: typeof localFilters) => {
        if (values.from && values.to && new Date(values.from) > new Date(values.to)) {
            toast.error(t('filter.validation.date_range'));
            return;
        }
        setLocalFilters(values);
        setActiveFilters((prev) => ({ ...prev, ...values, page: 1 }));
    }, [t]);

    const handleLocalFilterChange = (updated: Partial<typeof localFilters>) => {
        setLocalFilters((prev) => ({ ...prev, ...updated }));
    };

    const handleApplyFilters = () => applyFilterValues(localFilters);

    const handleQuickRangeApply = (dates: { from: string; to: string }) => {
        applyFilterValues({ ...localFilters, ...dates });
    };

    const handleResetFilters = () => {
        const defaultFilters = {
            from: getFirstDayOfMonth(),
            to: getToday(),
            status: 'all' as const,
            type: 'all' as const,
            user_id: undefined,
        };
        setLocalFilters(defaultFilters);
        setActiveFilters({
            ...defaultFilters,
            page: 1,
            per_page: 10,
        });
        toast.info(t('filter.toast.reset_success'));
    };

    const handlePageChange = (newPage: number) => {
        setActiveFilters((prev) => ({ ...prev, page: newPage }));
    };

    const handlePerPageChange = (perPage: number) => {
        setActiveFilters((prev) => ({ ...prev, per_page: perPage, page: 1 }));
    };

    const handleExportExcel = async () => {
        try {
            const dateStr = new Date().toISOString().split('T')[0];
            const fallbackFilename = `bao-cao-danh-gia_${activeFilters.from}_to_${activeFilters.to}_${dateStr}.xlsx`;

            if (isMockMode) {
                const headers = 'ID,Score,Comment,Status,Target Type,Target Name,User,Created At\n';
                const rows = data?.table.items
                    .map((i) =>
                        `"${i.id}","${i.score}","${(i.comment || '').replace(/"/g, '""')}","${i.status}","${i.reviewableType}","${i.reviewableName}","${i.userName}","${i.createdAt} ${i.createdAtTime}"`
                    )
                    .join('\n') ?? '';
                downloadMockCsv({
                    filename: fallbackFilename,
                    headers,
                    rows,
                    loadingMessage: tCommon('export.toast_mock_loading'),
                    successMessage: tCommon('export.toast_mock_success'),
                });
                return;
            }

            toast.promise(
                exportMutation.mutateAsync({
                    params: activeFilters,
                    fallbackFilename,
                }),
                {
                    loading: t('toast.exporting_excel'),
                    success: t('toast.export_success'),
                    error: t('toast.export_failed'),
                }
            );
        } catch {
            // Error captured inside toast.promise
        }
    };

    const handleApprove = (id: number) => {
        if (isMockMode) {
            toast.success(t('common:success.update'));
            // Simulate status update locally
            if (data) {
                const item = data.table.items.find(i => i.id === id);
                if (item) item.status = 'approved';
            }
            return;
        }
        approveMutation.mutate(id);
    };

    const handleReject = (id: number) => {
        if (isMockMode) {
            toast.success(t('common:success.update'));
            // Simulate status update locally
            if (data) {
                const item = data.table.items.find(i => i.id === id);
                if (item) item.status = 'rejected';
            }
            return;
        }
        rejectMutation.mutate(id);
    };

    const handleDelete = (id: number) => {
        if (isMockMode) {
            toast.success(t('common:success.delete'));
            // Simulate deletion locally
            if (data) {
                data.table.items = data.table.items.filter(i => i.id !== id);
                data.table.pagination.total -= 1;
            }
            return;
        }
        deleteMutation.mutate(id);
    };

    return (
        <ReportPageShell
            icon={FileText}
            title={t('title')}
            subtitle={t('subtitle')}
            breadcrumbCurrentLabel="sidebar.reports_ratings"
            testIdPrefix="ratings-report"
            isMockMode={isMockMode}
            showErrorPanel={showErrorPanel}
            isExportDisabled={isLoading || isFetching || (data != null && data.table.items.length === 0)}
            isExportPending={exportMutation.isPending}
            exportLabel={tCommon('export.btn_label')}
            onToggleMock={toggleMockMode}
            onExport={handleExportExcel}
            onRetry={() => refetch()}
            onUseMock={enableMockMode}
        >
            <ReportFilterBar
                filters={localFilters}
                onFilterChange={handleLocalFilterChange}
                onApply={handleApplyFilters}
                onReset={handleResetFilters}
                onQuickRangeApply={handleQuickRangeApply}
                isSubmitting={isLoading || isFetching}
            />
            <RatingStatsCards stats={data?.stats} isLoading={isLoading} />
            <RatingsReportCharts
                data={data?.charts}
                averageScore={data?.stats?.average}
                isLoading={isLoading}
            />
            <RatingsReportTable
                data={data?.table}
                isLoading={isLoading}
                onPageChange={handlePageChange}
                onPerPageChange={handlePerPageChange}
                onApprove={handleApprove}
                onReject={handleReject}
                onDelete={handleDelete}
                isModerating={isModerating}
            />
        </ReportPageShell>
    );
};

export default RatingsReport;
