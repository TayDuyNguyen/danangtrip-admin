import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FileDown, FileText, ChevronRight, LayoutDashboard, AlertTriangle, RefreshCw, Sparkles } from 'lucide-react';
import { useUsersReportQuery, useReportMutations } from '@/hooks/useReportQueries';
import UsersReportFilterBar from './components/UsersReportFilterBar';
import UsersStatsCards from './components/UsersStatsCards';
import UsersReportCharts from './components/UsersReportCharts';
import UsersReportTable from './components/UsersReportTable';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import type { UsersReportMonthViewModel, UsersExportFilters } from '@/dataHelper/report.dataHelper';

/**
 * Generate premium mock data fallback when API endpoints are not ready
 */
const getMockUsersReportData = (filters: { year: number }) => {
    const stats: UsersReportMonthViewModel[] = [];
    const baseNewUsers = 12;
    let runningSum = 0;

    for (let month = 1; month <= 12; month++) {
        // Create random growth factor
        const factor = 0.4 + Math.random() * 1.5;
        const count = Math.round(baseNewUsers * factor);
        runningSum += count;

        stats.push({
            month,
            labelKey: `users_report.month.${month}`,
            count,
            cumulativeCount: runningSum
        });
    }

    return {
        year: filters.year,
        stats,
        totalNewUsers: runningSum
    };
};

const UsersReport: React.FC = () => {
    const { t } = useTranslation('users_report');
    const [searchParams, setSearchParams] = useSearchParams();
    const [isMockMode, setIsMockMode] = useState<boolean>(false);
    const [hasAttemptedRealApi, setHasAttemptedRealApi] = useState<boolean>(false);

    const currentYear = new Date().getFullYear();

    // 1. Initial filters state synced with URL SearchParams
    const initialYear = Number(searchParams.get('year')) || currentYear;
    const initialRole = (searchParams.get('role') as UsersExportFilters['role']) || 'all';
    const initialStatus = (searchParams.get('status') as UsersExportFilters['status']) || 'all';

    const [localFilters, setLocalFilters] = useState({
        year: initialYear,
        role: initialRole,
        status: initialStatus,
    });

    const [activeFilters, setActiveFilters] = useState({
        year: initialYear,
        role: initialRole,
        status: initialStatus,
    });

    // 2. Synchronize active params with search query strings when they change
    useEffect(() => {
        const newParams: Record<string, string> = {
            year: String(activeFilters.year),
            role: activeFilters.role,
            status: activeFilters.status,
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
    } = useUsersReportQuery(
        { year: activeFilters.year },
        { enabled: !isMockMode }
    );

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
    const { exportUsersMutation } = useReportMutations();

    // Determine final loading and data representation states
    const isLoading = !isMockMode && isRealLoading;
    const isFetching = !isMockMode && isRealFetching;
    
    // Choose data source based on mode
    const data = isMockMode 
        ? getMockUsersReportData({ year: activeFilters.year }) 
        : realData;

    // 5. Handlers
    const handleLocalFilterChange = (updated: Partial<typeof localFilters>) => {
        setLocalFilters(prev => ({ ...prev, ...updated }));
    };

    const handleApplyFilters = () => {
        if (localFilters.year < 2000 || localFilters.year > 2027) {
            toast.error(t('filter.validation.year_invalid'));
            return;
        }

        setActiveFilters(prev => ({
            ...prev,
            ...localFilters,
        }));
    };

    const handleResetFilters = () => {
        const defaultFilters = {
            year: currentYear,
            role: 'all' as const,
            status: 'all' as const,
        };
        setLocalFilters(defaultFilters);
        setActiveFilters(defaultFilters);
        toast.info(t('filter.toast_reset'));
    };

    const handleExportExcel = async () => {
        try {
            const dateStr = new Date().toISOString().split('T')[0];
            const fallbackFilename = `bao-cao-nguoi-dung_year_${activeFilters.year}_role_${activeFilters.role}_status_${activeFilters.status}_${dateStr}.xlsx`;

            if (isMockMode) {
                // If in mock mode, trigger a local mock download to impress user
                toast.loading(t('export.toast_mock_loading'));
                setTimeout(() => {
                    toast.dismiss();
                    toast.success(t('export.toast_mock_success'));
                    
                    // Trigger a basic csv/blob download
                    const headers = 'Tháng,Số lượng đăng ký mới,Tổng lũy kế\n';
                    const rows = data?.stats.map(i => 
                        `"Tháng ${i.month}","${i.count}","${i.cumulativeCount}"`
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
                exportUsersMutation.mutateAsync({
                    params: {
                        role: activeFilters.role,
                        status: activeFilters.status,
                    },
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
                    <div className="flex items-center gap-1.5 text-[11px] font-black text-slate-400 select-none">
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
                        id="users-report-mock-toggle"
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
                        id="users-report-export-btn"
                        onClick={handleExportExcel}
                        disabled={isLoading || isFetching || exportUsersMutation.isPending}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-white border border-slate-100 hover:bg-slate-50 text-slate-600 shadow-sm active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100 cursor-pointer"
                    >
                        {exportUsersMutation.isPending ? (
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
                    <UsersReportFilterBar
                        filters={localFilters}
                        onFilterChange={handleLocalFilterChange}
                        onApply={handleApplyFilters}
                        onReset={handleResetFilters}
                        isSubmitting={isLoading || isFetching}
                    />

                    {/* 4. Stats Summary Cards */}
                    <UsersStatsCards
                        totalNewUsers={data?.totalNewUsers || 0}
                        isLoading={isLoading}
                    />

                    {/* 5. Visualization Charts */}
                    <UsersReportCharts
                        data={data?.stats}
                        isLoading={isLoading}
                    />

                    {/* 6. Table */}
                    <UsersReportTable
                        data={data?.stats}
                        isLoading={isLoading}
                    />
                </>
            )}
        </div>
    );
};

export default UsersReport;
