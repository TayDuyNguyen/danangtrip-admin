import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { useBookingsReportQuery, useReportMutations } from '@/hooks/useReportQueries';
import useReportMockMode, { useReportApiErrorToast } from '../shared/useReportMockMode';
import { REPORTS_MOCK_PARAM, parseReportPerPage } from '../shared/reports.constants';
import ReportPageShell from '../shared/ReportPageShell';
import { downloadMockCsv } from '../shared/mockExportCsv';
import { getStableMockFactor } from '../shared/mockData';
import ReportFilterBar from './components/ReportFilterBar';
import BookingStatsCards from './components/BookingStatsCards';
import BookingsReportCharts from './components/BookingsReportCharts';
import BookingsReportTable from './components/BookingsReportTable';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import type { BookingsReportItemViewModel, BookingsReportFilters } from '@/dataHelper/report.dataHelper';

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
const getMockBookingsReportData = (filters: {
    from: string;
    to: string;
    status: string;
    payment_status: string;
    page: number;
    per_page: number;
}) => {
    const start = new Date(filters.from);
    const end = new Date(filters.to);
    const trend: { date: string; bookings: number; revenue: number }[] = [];
    const daysDiff = Math.max(1, Math.min(60, Math.round((end.getTime() - start.getTime()) / (1000 * 3600 * 24))));
    
    const baseBookings = 4;
    
    for (let i = 0; i <= daysDiff; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        const dateString = d.toISOString().split('T')[0];
        
        const factor = getStableMockFactor(start.getMonth() + end.getMonth() + i, 0.5, 1.6);
        const dailyBookings = Math.round(baseBookings * factor);
        const dailyRevenue = Math.round(dailyBookings * 1250000 * factor);
        
        trend.push({
            date: dateString,
            bookings: dailyBookings,
            revenue: dailyRevenue,
        });
    }

    const statuses = [
        { status: 'pending' as const, labelKey: 'booking.status.pending', count: 18, percentage: 12, color: '#F59E0B' },
        { status: 'confirmed' as const, labelKey: 'booking.status.confirmed', count: 32, percentage: 22, color: '#3B82F6' },
        { status: 'completed' as const, labelKey: 'booking.status.completed', count: 85, percentage: 58, color: '#10B981' },
        { status: 'cancelled' as const, labelKey: 'booking.status.cancelled', count: 11, percentage: 8, color: '#EF4444' },
    ];

    const stats = {
        total: 146,
        totalTrend: 14.8,
        completed: 85,
        completedTrend: 18.3,
        cancelled: 11,
        cancelledTrend: -5.4,
        revenue: 182500000,
        revenueTrend: 24.6,
    };

    const tourNames = [
        "Tour Ngũ Hành Sơn - Hội An 1 ngày",
        "Tour du ngoạn Bà Nà Hills - Cáp treo đạt kỷ lục",
        "Tour Cù Lao Chàm lặn ngắm san hô & hải sản du thuyền",
        "Tour tham quan Cố đô Huế 1 ngày từ Đà Nẵng",
        "Tour Công viên suối khoáng nóng Núi Thần Tài",
        "Tour Đô Thị Cổ Hội An & Trải nghiệm thả đèn hoa đăng"
    ];

    const customerNames = [
        "Nguyễn Hoàng Anh", "Trần Minh Tâm", "Lê Khánh Chi", "Phạm Văn Dũng", 
        "Vũ Hoàng Yến", "Đặng Hữu Quốc", "Hoàng Kim Liên", "Phan Gia Huy",
        "Đỗ Phương Nam", "Bùi Kiều Trang"
    ];

    const statusOptions = ['pending', 'confirmed', 'completed', 'cancelled'] as const;
    const paymentStatusOptions = ['pending', 'paid', 'refunded'] as const;

    const items: BookingsReportItemViewModel[] = [];
    const perPage = filters.per_page;
    const offset = (filters.page - 1) * perPage;
    
    // Simulate filtered items
    for (let i = 0; i < perPage; i++) {
        const itemIdx = offset + i;
        const id = 10452 + itemIdx;
        const status = statusOptions[itemIdx % statusOptions.length];
        const paymentStatus = status === 'completed' ? 'paid' : 
                              status === 'cancelled' ? 'refunded' : 
                              paymentStatusOptions[itemIdx % paymentStatusOptions.length];
        
        // Mock booked date
        const bookedDateObj = new Date(Date.now() - (itemIdx * 12 * 3600 * 1000));
        const datePart = bookedDateObj.toISOString().split('T')[0].split('-').reverse().join('/');
        const timePart = bookedDateObj.toTimeString().split(' ')[0].substring(0, 5);

        items.push({
            id,
            bookingCode: `DNT${id}`,
            customerName: customerNames[itemIdx % customerNames.length],
            tourName: tourNames[itemIdx % tourNames.length],
            totalAmount: Math.round((itemIdx + 2) * 680000 / 1000) * 1000,
            status,
            paymentStatus,
            bookedAt: datePart,
            bookedAtTime: timePart,
        });
    }

    return {
        stats,
        charts: {
            trend: trend.map(p => ({
                label: p.date.split('-').slice(1).reverse().join('/'),
                bookings: p.bookings,
                revenue: p.revenue
            })),
            statuses,
        },
        table: {
            items,
            pagination: {
                currentPage: filters.page,
                lastPage: 5,
                perPage,
                total: 50,
            },
        },
    };
};

const BookingsReport: React.FC = () => {
    const { t } = useTranslation(['bookings_report', 'reports_common']);
    const { t: tCommon } = useTranslation('reports_common');
    const [searchParams, setSearchParams] = useSearchParams();
    const { isMockMode, toggleMockMode, enableMockMode } = useReportMockMode();

    const initialFrom = searchParams.get('from') || getFirstDayOfMonth();
    const initialTo = searchParams.get('to') || getToday();
    const initialStatus = (searchParams.get('status') as BookingsReportFilters['status']) || 'all';
    const initialPaymentStatus = (searchParams.get('payment_status') as BookingsReportFilters['payment_status']) || 'all';
    const initialPage = Number(searchParams.get('page')) || 1;
    const initialPerPage = parseReportPerPage(searchParams.get('per_page'));

    const [localFilters, setLocalFilters] = useState({
        from: initialFrom,
        to: initialTo,
        status: initialStatus,
        payment_status: initialPaymentStatus,
    });

    const [activeFilters, setActiveFilters] = useState({
        from: initialFrom,
        to: initialTo,
        status: initialStatus,
        payment_status: initialPaymentStatus,
        page: initialPage,
        per_page: initialPerPage,
    });

    useEffect(() => {
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            next.set('from', activeFilters.from);
            next.set('to', activeFilters.to);
            next.set('status', activeFilters.status);
            next.set('payment_status', activeFilters.payment_status);
            next.set('page', String(activeFilters.page));
            next.set('per_page', String(activeFilters.per_page));
            if (isMockMode) next.set(REPORTS_MOCK_PARAM, '1');
            else next.delete(REPORTS_MOCK_PARAM);
            return next;
        }, { replace: true });
    }, [activeFilters, isMockMode, setSearchParams]);

    // 3. React Query to load reports data (disabled when Mock Mode is explicitly active)
    const {
        data: realData,
        isLoading: isRealLoading,
        isError: isRealError,
        refetch,
        isFetching: isRealFetching,
    } = useBookingsReportQuery(activeFilters, { enabled: !isMockMode });

    useReportApiErrorToast(isRealError, isMockMode);
    const showErrorPanel = isRealError && !isMockMode;

    // 4. Report mutations hooks
    const { exportBookingsMutation } = useReportMutations();

    // Determine final loading and data representation states
    const isLoading = !isMockMode && isRealLoading;
    const isFetching = !isMockMode && isRealFetching;
    
    // Choose data source based on mode
    const data = isMockMode 
        ? getMockBookingsReportData(activeFilters) 
        : realData;

    // 5. Handlers
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
        const defaultFilters = {
            from: getFirstDayOfMonth(),
            to: getToday(),
            status: 'all' as const,
            payment_status: 'all' as const,
        };
        setLocalFilters(defaultFilters);
        setActiveFilters({
            ...defaultFilters,
            page: 1,
            per_page: 10,
        });
        toast.info(t('filter.toast_reset'));
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
            const fallbackFilename = `bao-cao-don-hang_${activeFilters.from}_to_${activeFilters.to}_${dateStr}.xlsx`;

            if (isMockMode) {
                const headers = 'ID,Mã đơn hàng,Khách hàng,Tour,Tổng tiền,Trạng thái đơn,Thanh toán,Ngày đặt\n';
                const rows = data?.table.items
                    .map((i) =>
                        `"${i.id}","${i.bookingCode}","${i.customerName}","${i.tourName}","${i.totalAmount}","${i.status}","${i.paymentStatus}","${i.bookedAt}"`
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
                exportBookingsMutation.mutateAsync({
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

    return (
        <ReportPageShell
            icon={FileText}
            title={t('title')}
            subtitle={t('subtitle')}
            breadcrumbCurrentLabel="sidebar.reports_bookings"
            testIdPrefix="bookings-report"
            isMockMode={isMockMode}
            showErrorPanel={showErrorPanel}
            isExportDisabled={isLoading || isFetching || (data != null && data.table.items.length === 0)}
            isExportPending={exportBookingsMutation.isPending}
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
            <BookingStatsCards stats={data?.stats} isLoading={isLoading} />
            <BookingsReportCharts data={data?.charts} isLoading={isLoading} />
            <BookingsReportTable
                data={data?.table}
                isLoading={isLoading}
                onPageChange={handlePageChange}
                onPerPageChange={handlePerPageChange}
            />
        </ReportPageShell>
    );
};

export default BookingsReport;
