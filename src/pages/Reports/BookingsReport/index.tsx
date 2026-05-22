import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FileDown, FileText, ChevronRight, LayoutDashboard, AlertTriangle, RefreshCw, Sparkles } from 'lucide-react';
import { useBookingsReportQuery, useReportMutations } from '@/hooks/useReportQueries';
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
        
        const factor = 0.5 + Math.random() * 1.1;
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
    const { t } = useTranslation('bookings_report');
    const [searchParams, setSearchParams] = useSearchParams();
    const [isMockMode, setIsMockMode] = useState<boolean>(false);
    const [hasAttemptedRealApi, setHasAttemptedRealApi] = useState<boolean>(false);

    // 1. Initial filters state synced with URL SearchParams
    const initialFrom = searchParams.get('from') || getFirstDayOfMonth();
    const initialTo = searchParams.get('to') || getToday();
    const initialStatus = (searchParams.get('status') as BookingsReportFilters['status']) || 'all';
    const initialPaymentStatus = (searchParams.get('payment_status') as BookingsReportFilters['payment_status']) || 'all';
    const initialPage = Number(searchParams.get('page')) || 1;

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
        per_page: 10,
    });

    // 2. Synchronize active params with search query strings when they change
    useEffect(() => {
        const newParams: Record<string, string> = {
            from: activeFilters.from,
            to: activeFilters.to,
            status: activeFilters.status,
            payment_status: activeFilters.payment_status,
            page: String(activeFilters.page),
        };
        setSearchParams(newParams);
    }, [activeFilters, setSearchParams]);

    // 3. React Query to load reports data (disabled when Mock Mode is explicitly active)
    const {
        data: realData,
        isLoading: isRealLoading,
        isError: isRealError,
        refetch,
        isFetching: isRealFetching,
    } = useBookingsReportQuery(activeFilters);

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
    const { exportBookingsMutation } = useReportMutations();

    // Determine final loading and data representation states
    const isLoading = !isMockMode && isRealLoading;
    const isFetching = !isMockMode && isRealFetching;
    
    // Choose data source based on mode
    const data = isMockMode 
        ? getMockBookingsReportData(activeFilters) 
        : realData;

    // 5. Handlers
    const handleLocalFilterChange = (updated: Partial<typeof localFilters>) => {
        setLocalFilters(prev => ({ ...prev, ...updated }));
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
        setActiveFilters(prev => ({
            ...prev,
            page: newPage,
        }));
    };

    const handleExportExcel = async () => {
        try {
            const dateStr = new Date().toISOString().split('T')[0];
            const fallbackFilename = `bao-cao-don-hang_${activeFilters.from}_to_${activeFilters.to}_${dateStr}.xlsx`;

            if (isMockMode) {
                // If in mock mode, trigger a local mock download download to impress user
                toast.loading(t('export.toast_mock_loading'));
                setTimeout(() => {
                    toast.dismiss();
                    toast.success(t('export.toast_mock_success'));
                    
                    // Trigger a basic csv/blob download
                    const headers = 'ID,Mã đơn hàng,Khách hàng,Tour,Tổng tiền,Trạng thái đơn,Thanh toán,Ngày đặt\n';
                    const rows = data?.table.items.map(i => 
                        `"${i.id}","${i.bookingCode}","${i.customerName}","${i.tourName}","${i.totalAmount}","${i.status}","${i.paymentStatus}","${i.bookedAt}"`
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-50 pb-5">
                <div className="space-y-1.5">
                    {/* Breadcrumbs */}
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 select-none">
                        <span className="hover:text-slate-600 cursor-pointer flex items-center gap-1">
                            <LayoutDashboard size={11} />
                            {t('breadcrumb.home')}
                        </span>
                        <ChevronRight size={11} />
                        <span className="hover:text-slate-600 cursor-pointer">{t('breadcrumb.reports')}</span>
                        <ChevronRight size={11} />
                        <span className="text-[#14b8a6]">{t('breadcrumb.current')}</span>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 bg-linear-to-br from-[#14b8a6]/20 to-[#14b8a6]/5 rounded-xl flex items-center justify-center text-[#14b8a6] border border-[#14b8a6]/10 shadow-2xs">
                            <FileText size={18} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-800 leading-tight">{t('title')}</h1>
                            <p className="text-xs font-bold text-slate-400 mt-1">{t('subtitle')}</p>
                        </div>
                    </div>
                </div>

                {/* Header Actions: Toggle Mock & Export Excel */}
                <div className="flex items-center gap-2">
                    {/* Mock Mode toggle switch */}
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
                        disabled={isLoading || isFetching || exportBookingsMutation.isPending || (data && data.table.items.length === 0)}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-white border border-slate-100 hover:bg-slate-50 text-slate-600 shadow-sm active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100 cursor-pointer"
                    >
                        {exportBookingsMutation.isPending ? (
                            <div className="w-4 h-4 border-2 border-slate-600 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <FileDown size={16} />
                        )}
                        {t('export.btn_label')}
                    </button>
                </div>
            </div>

            {/* 2. Error Display shell (Only shown if NOT in mock mode and API fails) */}
            {isRealError && !isMockMode ? (
                <div className="bg-red-50/60 backdrop-blur-xs border border-red-100/50 rounded-2xl p-8 text-center space-y-4 max-w-lg mx-auto">
                    <div className="w-12 h-12 bg-red-100/50 rounded-full flex items-center justify-center text-red-500 mx-auto">
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <h3 className="text-base font-black text-red-800">{t('error.load_failed')}</h3>
                        <p className="text-xs font-bold text-red-400 mt-1.5">{t('error.connection')}</p>
                    </div>
                    <div className="flex gap-2 justify-center">
                        <button
                            onClick={() => refetch()}
                            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl active:scale-95 transition-all shadow-md shadow-red-600/10 cursor-pointer"
                        >
                            <RefreshCw size={15} />
                            {t('error.retry_btn')}
                        </button>
                        <button
                            onClick={toggleMockMode}
                            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm px-6 py-2.5 rounded-xl active:scale-95 transition-all shadow-md shadow-amber-500/10 cursor-pointer"
                        >
                            <Sparkles size={15} />
                            {t('error.use_mock_btn')}
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    {/* 3. Interactive Filter Bar */}
                    <ReportFilterBar
                        filters={localFilters}
                        onFilterChange={handleLocalFilterChange}
                        onApply={handleApplyFilters}
                        onReset={handleResetFilters}
                        isSubmitting={isLoading || isFetching}
                    />

                    {/* 4. Stats Summary Cards */}
                    <BookingStatsCards
                        stats={data?.stats}
                        isLoading={isLoading}
                    />

                    {/* 5. Visualization Charts */}
                    <BookingsReportCharts
                        data={data?.charts}
                        isLoading={isLoading}
                    />

                    {/* 6. Table */}
                    <BookingsReportTable
                        data={data?.table}
                        isLoading={isLoading}
                        onPageChange={handlePageChange}
                    />
                </>
            )}
        </div>
    );
};

export default BookingsReport;
