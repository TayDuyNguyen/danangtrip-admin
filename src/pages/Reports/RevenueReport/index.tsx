import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FileDown, FileText, LayoutDashboard, AlertTriangle, RefreshCw, Sparkles } from 'lucide-react';
import { useRevenueReportQuery, useReportMutations } from '@/hooks/useReportQueries';
import ReportFilterBar from './components/ReportFilterBar';
import RevenueStatsCards from './components/RevenueStatsCards';
import RevenueReportCharts from './components/RevenueReportCharts';
import RevenueReportTable from './components/RevenueReportTable';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import type { RevenueReportItemViewModel } from '@/dataHelper/report.dataHelper';

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
const getMockRevenueReportData = (filters: {
    from: string;
    to: string;
    payment_gateway: string;
    page: number;
    per_page: number;
}) => {
    const start = new Date(filters.from);
    const end = new Date(filters.to);
    const trend: { date: string; revenue: number; transactions: number }[] = [];
    const daysDiff = Math.max(1, Math.min(60, Math.round((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1));

    const baseTx = 5;
    let totalRevenue = 0;
    let totalTransactions = 0;

    for (let i = 0; i < daysDiff; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        const dateString = d.toISOString().split('T')[0];

        const factor = 0.6 + Math.random() * 0.9;
        const dailyTransactions = Math.round(baseTx * factor);
        const dailyRevenue = Math.round(dailyTransactions * 1450000 * factor);

        totalRevenue += dailyRevenue;
        totalTransactions += dailyTransactions;

        trend.push({
            date: dateString,
            revenue: dailyRevenue,
            transactions: dailyTransactions,
        });
    }

    const dailyAverage = Math.round(totalRevenue / daysDiff);
    const totalRefunded = Math.round(totalRevenue * 0.045);

    const stats = {
        totalRevenue,
        totalRevenueTrend: 12.5,
        dailyAverage,
        dailyAverageTrend: 8.3,
        totalTransactions,
        totalTransactionsTrend: 15.2,
        totalRefunded,
        totalRefundedTrend: -4.8,
    };

    const topTours = [
        { tourId: 1, tourName: "Tour du ngoạn Bà Nà Hills - Cáp treo đạt kỷ lục", bookings: 45, revenue: Math.round(totalRevenue * 0.35) },
        { tourId: 2, tourName: "Tour Ngũ Hành Sơn - Hội An 1 ngày", bookings: 38, revenue: Math.round(totalRevenue * 0.25) },
        { tourId: 3, tourName: "Tour Cù Lao Chàm lặn ngắm san hô & hải sản du thuyền", bookings: 28, revenue: Math.round(totalRevenue * 0.20) },
        { tourId: 4, tourName: "Tour tham quan Cố đô Huế 1 ngày từ Đà Nẵng", bookings: 19, revenue: Math.round(totalRevenue * 0.12) },
        { tourId: 5, tourName: "Tour Công viên suối khoáng nóng Núi Thần Tài", bookings: 12, revenue: Math.round(totalRevenue * 0.08) },
    ];

    const gatewayMap: Record<string, { revenue: number; count: number; color: string; labelKey: string }> = {
        momo: { revenue: Math.round(totalRevenue * 0.35), count: Math.round(totalTransactions * 0.35), color: '#D82D8F', labelKey: 'revenue.gateway.momo' },
        vnpay: { revenue: Math.round(totalRevenue * 0.45), count: Math.round(totalTransactions * 0.45), color: '#3A5A9F', labelKey: 'revenue.gateway.vnpay' },
        zalopay: { revenue: Math.round(totalRevenue * 0.20), count: Math.round(totalTransactions * 0.20), color: '#0084FF', labelKey: 'revenue.gateway.zalopay' },
    };

    const gateways = Object.entries(gatewayMap).map(([key, value]) => ({
        gateway: key,
        labelKey: value.labelKey,
        revenue: value.revenue,
        count: value.count,
        percentage: totalRevenue > 0 ? Math.round((value.revenue / totalRevenue) * 100) : 0,
        color: value.color,
    }));

    const tourNames = [
        "Tour du ngoạn Bà Nà Hills - Cáp treo đạt kỷ lục",
        "Tour Ngũ Hành Sơn - Hội An 1 ngày",
        "Tour Cù Lao Chàm lặn ngắm san hô & hải sản du thuyền",
        "Tour tham quan Cố đô Huế 1 ngày từ Đà Nẵng",
        "Tour Công viên suối khoáng nóng Núi Thần Tài"
    ];

    const customerNames = [
        "Nguyễn Hoàng Anh", "Trần Minh Tâm", "Lê Khánh Chi", "Phạm Văn Dũng",
        "Vũ Hoàng Yến", "Đặng Hữu Quốc", "Hoàng Kim Liên", "Phan Gia Huy",
        "Đỗ Phương Nam", "Bùi Kiều Trang"
    ];

    const gatewayOptions = ['momo', 'vnpay', 'zalopay'];
    const statusOptions = ['success', 'success', 'success', 'refunded', 'pending', 'failed'];

    let allItems: RevenueReportItemViewModel[] = [];
    const simulatedTotal = 80;

    for (let i = 0; i < simulatedTotal; i++) {
        const id = 20834 + i;
        const gateway = gatewayOptions[i % gatewayOptions.length];
        const status = statusOptions[i % statusOptions.length];

        const dateObj = new Date(Date.now() - (i * 8 * 3600 * 1000));
        const datePart = dateObj.toISOString().split('T')[0].split('-').reverse().join('/');
        const timePart = dateObj.toTimeString().split(' ')[0].substring(0, 5);

        allItems.push({
            id,
            transactionCode: `TX${id}`,
            bookingId: 10452 + i,
            bookingCode: `DNT${10452 + i}`,
            customerName: customerNames[i % customerNames.length],
            customerAvatar: '',
            tourName: tourNames[i % tourNames.length],
            amount: Math.round((i + 2) * 650000 / 1000) * 1000,
            gateway,
            status,
            date: datePart,
            time: timePart,
        });
    }

    // Filter by gateway if not 'all'
    if (filters.payment_gateway !== 'all') {
        allItems = allItems.filter(item => item.gateway.toLowerCase() === filters.payment_gateway.toLowerCase());
    }

    const totalCount = allItems.length;
    const perPage = filters.per_page;
    const offset = (filters.page - 1) * perPage;
    const items = allItems.slice(offset, offset + perPage);

    return {
        stats,
        charts: {
            trend: trend.map(p => ({
                label: p.date.split('-').slice(1).reverse().join('/'),
                revenue: p.revenue,
                transactions: p.transactions
            })),
            topTours,
            gateways,
        },
        table: {
            items,
            pagination: {
                currentPage: filters.page,
                lastPage: Math.ceil(totalCount / perPage) || 1,
                perPage,
                total: totalCount,
            },
        },
    };
};

const RevenueReport: React.FC = () => {
    const { t } = useTranslation('revenue_report');
    const [searchParams, setSearchParams] = useSearchParams();
    const [isMockMode, setIsMockMode] = useState<boolean>(false);
    const [hasAttemptedRealApi, setHasAttemptedRealApi] = useState<boolean>(false);

    // 1. Initial filters state synced with URL SearchParams
    const initialFrom = searchParams.get('from') || getFirstDayOfMonth();
    const initialTo = searchParams.get('to') || getToday();
    const initialGateway = searchParams.get('payment_gateway') || 'all';
    const initialPage = Number(searchParams.get('page')) || 1;

    const [localFilters, setLocalFilters] = useState({
        from: initialFrom,
        to: initialTo,
        payment_gateway: initialGateway,
    });

    const [activeFilters, setActiveFilters] = useState({
        from: initialFrom,
        to: initialTo,
        payment_gateway: initialGateway,
        page: initialPage,
        per_page: 10,
    });

    // 2. Synchronize active params with search query strings when they change
    useEffect(() => {
        const newParams: Record<string, string> = {
            from: activeFilters.from,
            to: activeFilters.to,
            payment_gateway: activeFilters.payment_gateway,
            page: String(activeFilters.page),
        };
        setSearchParams(newParams);
    }, [activeFilters, setSearchParams]);

    // 3. React Query to load reports data (disabled when Mock Mode is active)
    const {
        data: realData,
        isLoading: isRealLoading,
        isError: isRealError,
        refetch,
        isFetching: isRealFetching,
    } = useRevenueReportQuery(activeFilters);

    // Keep track of errors to automatically enable mock mode
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

    // 4. Report mutations hooks
    const { exportRevenueMutation } = useReportMutations();

    // Determine final loading and data representation states
    const isLoading = !isMockMode && isRealLoading;
    const isFetching = !isMockMode && isRealFetching;

    // Choose data source based on mode
    const data = isMockMode
        ? getMockRevenueReportData(activeFilters)
        : realData;

    // 5. Handlers
    const handleLocalFilterChange = (updated: Partial<typeof localFilters>) => {
        setLocalFilters(prev => ({
            ...prev,
            ...updated,
        }));
    };

    const handleApplyFilters = () => {
        if (new Date(localFilters.from) > new Date(localFilters.to)) {
            toast.error(t('filter.validation.date_range'));
            return;
        }

        setActiveFilters(prev => ({
            ...prev,
            ...localFilters,
            page: 1,
        }));
    };

    const handleResetFilters = () => {
        const defaultFilters = {
            from: getFirstDayOfMonth(),
            to: getToday(),
            payment_gateway: 'all',
        };
        setLocalFilters(defaultFilters);
        setActiveFilters({
            ...defaultFilters,
            page: 1,
            per_page: 10,
        });
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
            const fallbackFilename = `bao-cao-doanh-thu_${activeFilters.from}_to_${activeFilters.to}_${dateStr}.xlsx`;

            if (isMockMode) {
                // Mock Excel download to impress user
                toast.loading(t('export.toast_mock_loading'));
                setTimeout(() => {
                    toast.dismiss();
                    toast.success(t('export.toast_mock_success'));

                    // Trigger a basic CSV/Blob download
                    const headers = 'ID,Mã giao dịch,Mã đơn hàng,Khách hàng,Tour,Số tiền,Cổng thanh toán,Ngày trả,Trạng thái\n';
                    const rows = data?.table.items.map(i =>
                        `"${i.id}","${i.transactionCode}","${i.bookingCode}","${i.customerName}","${i.tourName}","${i.amount}","${i.gateway}","${i.date} ${i.time}","${i.status}"`
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
                exportRevenueMutation.mutateAsync({
                    params: activeFilters,
                    fallbackFilename,
                }),
                {
                    loading: t('export.toast_loading'),
                    success: t('export.toast_success'),
                    error: t('export.toast_error'),
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

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
            {/* 1. Header & Breadcrumbs block */}
            <div className="flex flex-col gap-3">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-wider select-none px-1">
                    <span className="hover:text-[#14b8a6] cursor-pointer flex items-center gap-1 transition-colors duration-150">
                        <LayoutDashboard size={13} />
                        {t('breadcrumb.home')}
                    </span>
                    <span className="text-slate-300">/</span>
                    <span className="hover:text-[#14b8a6] cursor-pointer transition-colors duration-150">{t('breadcrumb.reports')}</span>
                    <span className="text-slate-300">/</span>
                    <span className="text-[#14b8a6]">{t('breadcrumb.current')}</span>
                </div>

                {/* ─── Gradient border shell header card ─── */}
                <div className="p-[1px] rounded-3xl bg-gradient-to-br from-[#14b8a6]/25 via-slate-200/20 to-transparent shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="bg-white/98 backdrop-blur-sm rounded-[23px] px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#14b8a6]/10 text-[#14b8a6] border border-[#14b8a6]/20 rounded-2xl flex items-center justify-center shadow-xs shrink-0">
                                <FileText size={20} />
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
                                disabled={isLoading || isFetching || exportRevenueMutation.isPending || (data && data.table.items.length === 0)}
                                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-white border border-[#E2E8F0] hover:border-[#14b8a6] hover:bg-[#14b8a6]/5 hover:text-[#14b8a6] shadow-xs active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:active:scale-100 cursor-pointer text-[#0F172A]/80"
                            >
                                {exportRevenueMutation.isPending ? (
                                    <div className="w-4 h-4 border-2 border-[#14b8a6] border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <FileDown size={16} />
                                )}
                                {t('export.btn_label')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Error Display shell (Only shown if NOT in mock mode and API fails) */}
            {isRealError && !isMockMode ? (
                <div className="p-[1px] rounded-3xl bg-gradient-to-br from-red-500/20 via-slate-200/25 to-slate-100/10 shadow-xs max-w-lg mx-auto mt-12 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[23px] p-8 text-center flex flex-col items-center justify-center font-sans">
                        <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100/50">
                            <AlertTriangle size={24} />
                        </div>
                        <div>
                            <h3 className="text-base font-black text-[#0F172A]">{t('error.load_failed')}</h3>
                            <p className="text-xs font-bold text-[#94A3B8] mt-1.5">{t('error.connection')}</p>
                        </div>
                        <div className="flex gap-2 justify-center mt-6">
                            <button
                                onClick={() => refetch()}
                                className="inline-flex items-center gap-2 bg-[#14b8a6] hover:bg-[#0f766e] text-white font-bold text-xs px-6 py-2.5 rounded-xl active:scale-95 transition-all shadow-md cursor-pointer"
                            >
                                <RefreshCw size={15} />
                                {t('error.retry_btn')}
                            </button>
                            <button
                                onClick={toggleMockMode}
                                className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-6 py-2.5 rounded-xl active:scale-95 transition-all shadow-md cursor-pointer"
                            >
                                <Sparkles size={15} />
                                {t('error.use_mock_btn')}
                            </button>
                        </div>
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
                        <RevenueStatsCards
                            stats={data?.stats}
                            isLoading={isLoading}
                        />
                    </div>

                    {/* 5. Visualization Charts */}
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both delay-200">
                        <RevenueReportCharts
                            data={data?.charts}
                            isLoading={isLoading}
                        />
                    </div>

                    {/* 6. Table */}
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both delay-300">
                        <RevenueReportTable
                            data={data?.table}
                            isLoading={isLoading}
                            onPageChange={handlePageChange}
                        />
                    </div>
                </>
            )}
        </div>
    );
};

export default RevenueReport;
