import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { useRevenueReportQuery, useReportMutations } from '@/hooks/useReportQueries';
import ReportFilterBar from './components/ReportFilterBar';
import RevenueStatsCards from './components/RevenueStatsCards';
import RevenueReportCharts from './components/RevenueReportCharts';
import RevenueReportTable from './components/RevenueReportTable';
import ReportPageShell from '../shared/ReportPageShell';
import useReportMockMode, { useReportApiErrorToast } from '../shared/useReportMockMode';
import { REPORTS_MOCK_PARAM, REPORT_PER_PAGE_OPTIONS } from '../shared/reports.constants';
import { downloadMockCsv } from '../shared/mockExportCsv';
import { getStableMockFactor } from '../shared/mockData';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import type { RevenueReportItemViewModel } from '@/dataHelper/report.dataHelper';

const getFirstDayOfMonth = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
};

const getToday = () => new Date().toISOString().split('T')[0];

const parsePerPage = (value: string | null) => {
    const n = Number(value);
    return REPORT_PER_PAGE_OPTIONS.includes(n as (typeof REPORT_PER_PAGE_OPTIONS)[number]) ? n : 10;
};

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
        const factor = getStableMockFactor(start.getDate() + end.getDate() + i, 0.6, 1.5);
        const dailyTransactions = Math.round(baseTx * factor);
        const dailyRevenue = Math.round(dailyTransactions * 1450000 * factor);
        totalRevenue += dailyRevenue;
        totalTransactions += dailyTransactions;
        trend.push({ date: dateString, revenue: dailyRevenue, transactions: dailyTransactions });
    }

    const dailyAverage = Math.round(totalRevenue / daysDiff);
    const stats = {
        totalRevenue,
        totalRevenueTrend: 12.5,
        dailyAverage,
        dailyAverageTrend: 8.3,
        totalTransactions,
        totalTransactionsTrend: 15.2,
        totalRefunded: Math.round(totalRevenue * 0.045),
        totalRefundedTrend: -4.8,
    };

    const topTours = [
        { tourId: 1, tourName: 'Tour du ngoạn Bà Nà Hills - Cáp treo đạt kỷ lục', bookings: 45, revenue: Math.round(totalRevenue * 0.35) },
        { tourId: 2, tourName: 'Tour Ngũ Hành Sơn - Hội An 1 ngày', bookings: 38, revenue: Math.round(totalRevenue * 0.25) },
        { tourId: 3, tourName: 'Tour Cù Lao Chàm lặn ngắm san hô & hải sản du thuyền', bookings: 28, revenue: Math.round(totalRevenue * 0.2) },
        { tourId: 4, tourName: 'Tour tham quan Cố đô Huế 1 ngày từ Đà Nẵng', bookings: 19, revenue: Math.round(totalRevenue * 0.12) },
        { tourId: 5, tourName: 'Tour Công viên suối khoáng nóng Núi Thần Tài', bookings: 12, revenue: Math.round(totalRevenue * 0.08) },
    ];

    const gatewayMap: Record<string, { revenue: number; count: number; color: string; labelKey: string }> = {
        momo: { revenue: Math.round(totalRevenue * 0.35), count: Math.round(totalTransactions * 0.35), color: '#D82D8F', labelKey: 'revenue.gateway.momo' },
        vnpay: { revenue: Math.round(totalRevenue * 0.45), count: Math.round(totalTransactions * 0.45), color: '#3A5A9F', labelKey: 'revenue.gateway.vnpay' },
        zalopay: { revenue: Math.round(totalRevenue * 0.2), count: Math.round(totalTransactions * 0.2), color: '#0084FF', labelKey: 'revenue.gateway.zalopay' },
    };

    const gateways = Object.entries(gatewayMap).map(([key, value]) => ({
        gateway: key,
        labelKey: value.labelKey,
        revenue: value.revenue,
        count: value.count,
        percentage: totalRevenue > 0 ? Math.round((value.revenue / totalRevenue) * 100) : 0,
        color: value.color,
    }));

    const tourNames = topTours.map((t) => t.tourName);
    const customerNames = [
        'Nguyễn Hoàng Anh', 'Trần Minh Tâm', 'Lê Khánh Chi', 'Phạm Văn Dũng',
        'Vũ Hoàng Yến', 'Đặng Hữu Quốc', 'Hoàng Kim Liên', 'Phan Gia Huy',
        'Đỗ Phương Nam', 'Bùi Kiều Trang',
    ];
    const gatewayOptions = ['momo', 'vnpay', 'zalopay'];
    const statusOptions = ['success', 'success', 'success', 'refunded', 'pending', 'failed'];

    let allItems: RevenueReportItemViewModel[] = [];
    for (let i = 0; i < 80; i++) {
        const id = 20834 + i;
        const gateway = gatewayOptions[i % gatewayOptions.length];
        const status = statusOptions[i % statusOptions.length];
        const dateObj = new Date(Date.now() - i * 8 * 3600 * 1000);
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

    if (filters.payment_gateway !== 'all') {
        allItems = allItems.filter((item) => item.gateway.toLowerCase() === filters.payment_gateway.toLowerCase());
    }

    const totalCount = allItems.length;
    const perPage = filters.per_page;
    const offset = (filters.page - 1) * perPage;
    const items = allItems.slice(offset, offset + perPage);

    return {
        stats,
        charts: {
            trend: trend.map((p) => ({
                label: p.date.split('-').slice(1).reverse().join('/'),
                revenue: p.revenue,
                transactions: p.transactions,
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
    const { t } = useTranslation(['revenue_report', 'reports_common']);
    const { t: tCommon } = useTranslation('reports_common');
    const [searchParams, setSearchParams] = useSearchParams();

    const initialFrom = searchParams.get('from') || getFirstDayOfMonth();
    const initialTo = searchParams.get('to') || getToday();
    const initialGateway = searchParams.get('payment_gateway') || 'all';
    const initialPage = Number(searchParams.get('page')) || 1;
    const initialPerPage = parsePerPage(searchParams.get('per_page'));

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
        per_page: initialPerPage,
    });

    const { isMockMode, toggleMockMode, enableMockMode } = useReportMockMode();

    const {
        data: realData,
        isLoading: isRealLoading,
        isError: isRealError,
        refetch,
        isFetching: isRealFetching,
    } = useRevenueReportQuery(activeFilters, { enabled: !isMockMode });

    const showErrorPanel = isRealError && !isMockMode;
    useReportApiErrorToast(isRealError, isMockMode);

    useEffect(() => {
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            next.set('from', activeFilters.from);
            next.set('to', activeFilters.to);
            next.set('payment_gateway', activeFilters.payment_gateway);
            next.set('page', String(activeFilters.page));
            next.set('per_page', String(activeFilters.per_page));
            if (isMockMode) next.set(REPORTS_MOCK_PARAM, '1');
            else next.delete(REPORTS_MOCK_PARAM);
            return next;
        }, { replace: true });
    }, [activeFilters, isMockMode, setSearchParams]);

    const { exportRevenueMutation } = useReportMutations();
    const isLoading = !isMockMode && isRealLoading;
    const isFetching = !isMockMode && isRealFetching;
    const data = isMockMode ? getMockRevenueReportData(activeFilters) : realData;

    const applyFilterValues = useCallback((values: typeof localFilters) => {
        if (new Date(values.from) > new Date(values.to)) {
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
        const defaultFilters = { from: getFirstDayOfMonth(), to: getToday(), payment_gateway: 'all' };
        setLocalFilters(defaultFilters);
        setActiveFilters({ ...defaultFilters, page: 1, per_page: 10 });
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
            const fallbackFilename = `bao-cao-doanh-thu_${activeFilters.from}_to_${activeFilters.to}_${dateStr}.xlsx`;

            if (isMockMode) {
                const headers = 'ID,Mã giao dịch,Mã đơn hàng,Khách hàng,Tour,Số tiền,Cổng thanh toán,Ngày trả,Trạng thái\n';
                const rows = data?.table.items
                    .map((i) =>
                        `"${i.id}","${i.transactionCode}","${i.bookingCode}","${i.customerName}","${i.tourName}","${i.amount}","${i.gateway}","${i.date} ${i.time}","${i.status}"`
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
                exportRevenueMutation.mutateAsync({ params: activeFilters, fallbackFilename }),
                {
                    loading: t('export.toast_loading'),
                    success: t('export.toast_success'),
                    error: t('export.toast_error'),
                }
            );
        } catch {
            // handled by toast.promise
        }
    };

    return (
        <ReportPageShell
            icon={FileText}
            title={t('title')}
            subtitle={t('subtitle')}
            breadcrumbCurrentLabel="sidebar.reports_revenue"
            testIdPrefix="revenue-report"
            isMockMode={isMockMode}
            showErrorPanel={showErrorPanel}
            isExportDisabled={isLoading || isFetching || (data != null && data.table.items.length === 0)}
            isExportPending={exportRevenueMutation.isPending}
            exportLabel={tCommon('export.btn_label')}
            onToggleMock={toggleMockMode}
            onExport={handleExportExcel}
            onRetry={() => refetch()}
            onUseMock={enableMockMode}
        >
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both delay-75">
                <ReportFilterBar
                    filters={localFilters}
                    onFilterChange={handleLocalFilterChange}
                    onApply={handleApplyFilters}
                    onReset={handleResetFilters}
                    onQuickRangeApply={handleQuickRangeApply}
                    isSubmitting={isLoading || isFetching}
                />
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both delay-150">
                <RevenueStatsCards stats={data?.stats} isLoading={isLoading} />
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both delay-200">
                <RevenueReportCharts data={data?.charts} isLoading={isLoading} />
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both delay-300">
                <RevenueReportTable
                    data={data?.table}
                    isLoading={isLoading}
                    onPageChange={handlePageChange}
                    onPerPageChange={handlePerPageChange}
                />
            </div>
        </ReportPageShell>
    );
};

export default RevenueReport;
