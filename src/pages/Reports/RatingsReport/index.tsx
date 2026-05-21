import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FileDown, FileText, ChevronRight, LayoutDashboard, AlertTriangle, RefreshCw } from 'lucide-react';
import { useRatingsReportQuery, useReportMutations } from '@/hooks/useReportQueries';
import ReportFilterBar from './components/ReportFilterBar';
import RatingStatsCards from './components/RatingStatsCards';
import RatingsReportCharts from './components/RatingsReportCharts';
import RatingsReportTable from './components/RatingsReportTable';
import { toast } from 'sonner';

// Date utility helpers
const getFirstDayOfMonth = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
};

const getToday = () => {
    return new Date().toISOString().split('T')[0];
};

const RatingsReport: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    // 1. Initial filters state synced with URL SearchParams
    const initialFrom = searchParams.get('from') || getFirstDayOfMonth();
    const initialTo = searchParams.get('to') || getToday();
    const initialStatus = (searchParams.get('status') as 'all' | 'pending' | 'approved' | 'rejected') || 'all';
    const initialType = (searchParams.get('type') as 'all' | 'location' | 'tour') || 'all';
    const initialPage = Number(searchParams.get('page')) || 1;

    const [localFilters, setLocalFilters] = useState({
        from: initialFrom,
        to: initialTo,
        status: initialStatus,
        type: initialType,
    });

    const [activeFilters, setActiveFilters] = useState({
        from: initialFrom,
        to: initialTo,
        status: initialStatus,
        type: initialType,
        page: initialPage,
        per_page: 10,
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
        setSearchParams(newParams);
    }, [activeFilters, setSearchParams]);

    // 3. React Query to load reports data ViewModel
    const {
        data,
        isLoading,
        isError,
        refetch,
        isFetching,
    } = useRatingsReportQuery(activeFilters);

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
            toast.error('Ngày bắt đầu không thể lớn hơn ngày kết thúc.');
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
        };
        setLocalFilters(defaultFilters);
        setActiveFilters({
            ...defaultFilters,
            page: 1,
            per_page: 10,
        });
        toast.info('Đã lập lại bộ lọc về mặc định.');
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

            toast.promise(
                exportMutation.mutateAsync({
                    params: activeFilters,
                    fallbackFilename,
                }),
                {
                    loading: 'Đang chuẩn bị và xuất file Excel...',
                    success: 'Xuất báo cáo Excel thành công!',
                    error: 'Xuất file Excel thất bại. Vui lòng thử lại.',
                }
            );
        } catch {
            // Error captured inside toast.promise
        }
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
                            Trang chủ
                        </span>
                        <ChevronRight size={11} />
                        <span className="hover:text-slate-600 cursor-pointer">Báo cáo</span>
                        <ChevronRight size={11} />
                        <span className="text-[#14b8a6]">Báo cáo Đánh giá</span>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 bg-linear-to-br from-[#14b8a6]/20 to-[#14b8a6]/5 rounded-xl flex items-center justify-center text-[#14b8a6] border border-[#14b8a6]/10 shadow-2xs">
                            <FileText size={18} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-800 leading-tight">Báo cáo Đánh giá</h1>
                            <p className="text-xs font-bold text-slate-400 mt-1">Thống kê, phân tích và kiểm duyệt phản hồi khách hàng</p>
                        </div>
                    </div>
                </div>

                {/* Header Action: Export Excel */}
                <button
                    type="button"
                    onClick={handleExportExcel}
                    disabled={isLoading || isFetching || exportMutation.isPending || (data && data.table.items.length === 0)}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-white border border-slate-100 hover:bg-slate-50 text-slate-600 shadow-sm active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100 cursor-pointer"
                >
                    {exportMutation.isPending ? (
                        <div className="w-4 h-4 border-2 border-slate-600 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <FileDown size={16} />
                    )}
                    Xuất Excel
                </button>
            </div>

            {/* 2. Error Display shell */}
            {isError ? (
                <div className="bg-red-50/60 backdrop-blur-xs border border-red-100/50 rounded-2xl p-8 text-center space-y-4 max-w-lg mx-auto">
                    <div className="w-12 h-12 bg-red-100/50 rounded-full flex items-center justify-center text-red-500 mx-auto">
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <h3 className="text-base font-black text-red-800">Không thể tải dữ liệu báo cáo</h3>
                        <p className="text-xs font-bold text-red-400 mt-1.5">Đã xảy ra sự cố kết nối với hệ thống API của Laravel.</p>
                    </div>
                    <button
                        onClick={() => refetch()}
                        className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl active:scale-95 transition-all shadow-md shadow-red-600/10 cursor-pointer"
                    >
                        <RefreshCw size={15} />
                        Thử lại
                    </button>
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
                    <RatingStatsCards
                        stats={data?.stats}
                        isLoading={isLoading}
                    />

                    {/* 5. Visualization Charts */}
                    <RatingsReportCharts
                        data={data?.charts}
                        averageScore={data?.stats?.average}
                        isLoading={isLoading}
                    />

                    {/* 6. Moderation Details Table */}
                    <RatingsReportTable
                        data={data?.table}
                        isLoading={isLoading}
                        onPageChange={handlePageChange}
                        onApprove={(id) => approveMutation.mutate(id)}
                        onReject={(id) => rejectMutation.mutate(id)}
                        onDelete={(id) => deleteMutation.mutate(id)}
                        isModerating={isModerating}
                    />
                </>
            )}
        </div>
    );
};

export default RatingsReport;
