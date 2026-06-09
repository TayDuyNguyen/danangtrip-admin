import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FileDown, FileText, AlertTriangle, RefreshCw, Sparkles } from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import { ROUTES } from '@/routes/routes';
import { useRatingsReportQuery, useReportMutations } from '@/hooks/useReportQueries';
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

        const factor = 0.4 + Math.random() * 1.2;
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
    const { t } = useTranslation(['ratings', 'common']);
    const [searchParams, setSearchParams] = useSearchParams();
    const [isMockMode, setIsMockMode] = useState<boolean>(false);
    const [hasAttemptedRealApi, setHasAttemptedRealApi] = useState<boolean>(false);

    // 1. Initial filters state synced with URL SearchParams
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
        per_page: 10,
        user_id: initialUserId,
    });

    // 2. Synchronize active params with search query strings when they change
    useEffect(() => {
        const newParams: Record<string, string> = {
            from: activeFilters.from,
            to: activeFilters.to,
            status: activeFilters.status,
            type: activeFilters.type,
            page: String(activeFilters.page),
        };
        if (activeFilters.user_id) {
            newParams.user_id = String(activeFilters.user_id);
        }
        setSearchParams(newParams);
    }, [activeFilters, setSearchParams]);

    // 3. React Query to load reports data (disabled when Mock Mode is active)
    const {
        data: realData,
        isLoading: isRealLoading,
        isError: isRealError,
        refetch,
        isFetching: isRealFetching,
    } = useRatingsReportQuery(activeFilters);

    // Auto-fallback to mock mode on error
    useEffect(() => {
        if (isRealError && !isMockMode && !hasAttemptedRealApi) {
            const timer = setTimeout(() => {
                setIsMockMode(true);
                setHasAttemptedRealApi(true);
                toast.warning(t('mock.toast_to_mock'));
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [isRealError, isMockMode, hasAttemptedRealApi, t]);

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
    const handleLocalFilterChange = (updated: Partial<typeof localFilters>) => {
        setLocalFilters(prev => ({ ...prev, ...updated }));
    };

    const handleApplyFilters = () => {
        // Validation: End date must be greater than start date
        if (new Date(localFilters.from) > new Date(localFilters.to)) {
            toast.error(t('filter.validation.date_range'));
            return;
        }

        setActiveFilters(prev => ({
            ...prev,
            ...localFilters,
            page: 1, // Reset to first page on filter apply
        }));
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
        setActiveFilters(prev => ({
            ...prev,
            page: newPage,
        }));
    };

    const handleExportExcel = async () => {
        try {
            const dateStr = new Date().toISOString().split('T')[0];
            const fallbackFilename = `bao-cao-danh-gia_${activeFilters.from}_to_${activeFilters.to}_${dateStr}.xlsx`;

            if (isMockMode) {
                toast.loading(t('toast.exporting_mock'));
                setTimeout(() => {
                    toast.dismiss();
                    toast.success(t('toast.export_mock_success'));

                    // Trigger local csv/blob download
                    const headers = 'ID,Score,Comment,Status,Target Type,Target Name,User,Created At\n';
                    const rows = data?.table.items.map(i =>
                        `"${i.id}","${i.score}","${(i.comment || '').replace(/"/g, '""')}","${i.status}","${i.reviewableType}","${i.reviewableName}","${i.userName}","${i.createdAt} ${i.createdAtTime}"`
                    ).join('\n');
                    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.setAttribute('href', url);
                    link.setAttribute('download', fallbackFilename.replace('.xlsx', '.csv'));
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }, 1000);
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

    const toggleMockMode = () => {
        const nextMode = !isMockMode;
        setIsMockMode(nextMode);
        toast.success(
            nextMode
                ? t('mock.toast_switched_mock')
                : t('mock.toast_switched_real')
        );
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
        <div className="p-1 sm:p-2 max-w-[1600px] mx-auto space-y-6 animate-in fade-in duration-300">
            {/* 1. Header & Breadcrumbs block */}
            <div className="flex flex-col gap-3">
                {/* Breadcrumbs */}
                <Breadcrumbs
                    icon={FileText}
                    items={[
                        { label: 'sidebar.reports', path: ROUTES.REPORTS_RATINGS },
                        { label: 'sidebar.reports_ratings' }
                    ]}
                />

                {/* ─── Gradient border shell header card ─── */}
                <div className="p-[1px] rounded-3xl bg-gradient-to-br from-[#14b8a6]/25 via-slate-200/20 to-transparent shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="bg-white/98 backdrop-blur-sm rounded-[23px] px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-[#14b8a6] to-[#0f766e] text-white rounded-2xl flex items-center justify-center shadow-md shadow-[#14b8a6]/20 shrink-0">
                                <FileText size={20} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h1 className="text-[22px] font-black text-[#0F172A] tracking-tight leading-tight">{t('title')}</h1>
                                <p className="text-xs font-bold text-[#94A3B8] mt-1">{t('subtitle')}</p>
                            </div>
                        </div>

                        {/* Header Actions: Toggle Mock & Export Excel */}
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={toggleMockMode}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black border transition-all cursor-pointer ${
                                    isMockMode
                                        ? 'bg-amber-50 border-amber-200 text-amber-600'
                                        : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                                }`}
                                title={t('mock.toggle_title')}
                            >
                                <Sparkles size={13} className={isMockMode ? "animate-bounce" : ""} />
                                {isMockMode ? t('mock.mock_on') : t('mock.mock_off')}
                            </button>

                            <button
                                type="button"
                                onClick={handleExportExcel}
                                disabled={isLoading || isFetching || exportMutation.isPending || (data && data.table.items.length === 0)}
                                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-white border border-[#E2E8F0] hover:border-[#14b8a6] hover:bg-[#14b8a6]/5 hover:text-[#14b8a6] shadow-xs active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:active:scale-100 cursor-pointer text-[#0F172A]/80"
                            >
                                {exportMutation.isPending ? (
                                    <div className="w-4 h-4 border-2 border-[#14b8a6] border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <FileDown size={16} />
                                )}
                                {t('common:actions.export_excel')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Error Display shell */}
            {isRealError && !isMockMode ? (
                <div className="bg-red-50/60 backdrop-blur-xs border border-red-100/50 rounded-2xl p-8 text-center space-y-4 max-w-lg mx-auto">
                    <div className="w-12 h-12 bg-red-100/50 rounded-full flex items-center justify-center text-red-500 mx-auto">
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <h3 className="text-base font-black text-red-800">{t('error.api_failed')}</h3>
                        <p className="text-xs font-bold text-red-400 mt-1.5">{t('error.laravel_connection')}</p>
                    </div>
                    <div className="flex gap-2 justify-center">
                        <button
                            onClick={() => refetch()}
                            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl active:scale-95 transition-all shadow-md shadow-red-600/10 cursor-pointer"
                        >
                            <RefreshCw size={15} />
                            {t('common:error.try_again')}
                        </button>
                        <button
                            onClick={toggleMockMode}
                            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm px-6 py-2.5 rounded-xl active:scale-95 transition-all shadow-md shadow-amber-500/10 cursor-pointer"
                        >
                            <Sparkles size={15} />
                            {t('mock.use_mock_btn')}
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    {/* 3. Interactive Filter Bar */}
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both delay-75">
                        <ReportFilterBar
                            filters={localFilters}
                            onFilterChange={handleLocalFilterChange}
                            onApply={handleApplyFilters}
                            onReset={handleResetFilters}
                            isSubmitting={isLoading || isFetching}
                        />
                    </div>

                    {/* 4. Stats Summary Cards */}
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both delay-150">
                        <RatingStatsCards
                            stats={data?.stats}
                            isLoading={isLoading}
                        />
                    </div>

                    {/* 5. Visualization Charts */}
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both delay-200">
                        <RatingsReportCharts
                            data={data?.charts}
                            averageScore={data?.stats?.average}
                            isLoading={isLoading}
                        />
                    </div>

                    {/* 6. Moderation Details Table */}
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both delay-300">
                        <RatingsReportTable
                            data={data?.table}
                            isLoading={isLoading}
                            onPageChange={handlePageChange}
                            onApprove={handleApprove}
                            onReject={handleReject}
                            onDelete={handleDelete}
                            isModerating={isModerating}
                        />
                    </div>
                </>
            )}
        </div>
    );
};

export default RatingsReport;
