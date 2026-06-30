import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { useUsersReportQuery, useReportMutations } from '@/hooks/useReportQueries';
import UsersReportFilterBar from './components/UsersReportFilterBar';
import UsersStatsCards from './components/UsersStatsCards';
import UsersReportCharts from './components/UsersReportCharts';
import UsersRoleChart from './components/UsersRoleChart';
import UsersReportTable from './components/UsersReportTable';
import ReportPageShell from '../shared/ReportPageShell';
import useReportMockMode, { useReportApiErrorToast } from '../shared/useReportMockMode';
import { REPORTS_MOCK_PARAM } from '../shared/reports.constants';
import { downloadMockCsv } from '../shared/mockExportCsv';
import { getStableMockFactor } from '../shared/mockData';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import type { UsersExportFilters, UsersReportMonthViewModel } from '@/dataHelper/report.dataHelper';

const getMockUsersReportData = (filters: { year: number }) => {
    const stats: UsersReportMonthViewModel[] = [];
    const baseNewUsers = 12;
    let runningSum = 0;

    for (let month = 1; month <= 12; month++) {
        const factor = getStableMockFactor(filters.year + month, 0.4, 1.9);
        const count = Math.round(baseNewUsers * factor);
        runningSum += count;
        stats.push({
            month,
            labelKey: `users_report.month.${month}`,
            count,
            cumulativeCount: runningSum,
        });
    }

    const totalUsers = 864;
    const activeUsers = 760;

    return {
        year: filters.year,
        stats,
        totalNewUsers: runningSum,
        totalUsers,
        activeUsers,
        activeRate: Number(((activeUsers / totalUsers) * 100).toFixed(1)),
        roleDistribution: [
            { role: 'user', labelKey: 'filter.role_user', count: 820, percentage: 82, color: '#14b8a6' },
            { role: 'admin', labelKey: 'filter.role_admin', count: 12, percentage: 12, color: '#6366f1' },
            { role: 'manager', labelKey: 'filter.role_manager', count: 8, percentage: 4, color: '#f59e0b' },
            { role: 'staff', labelKey: 'filter.role_staff', count: 24, percentage: 2, color: '#64748b' },
        ],
    };
};

const UsersReport: React.FC = () => {
    const { t } = useTranslation('users_report');
    const { t: tCommon } = useTranslation('reports_common');
    const [searchParams, setSearchParams] = useSearchParams();
    const currentYear = new Date().getFullYear();

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

    const { isMockMode, toggleMockMode, enableMockMode } = useReportMockMode();

    const {
        data: realData,
        isLoading: isRealLoading,
        isError: isRealError,
        refetch,
        isFetching: isRealFetching,
    } = useUsersReportQuery({ year: activeFilters.year }, { enabled: !isMockMode });

    const showErrorPanel = isRealError && !isMockMode;
    useReportApiErrorToast(isRealError, isMockMode);

    useEffect(() => {
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            next.set('year', String(activeFilters.year));
            next.set('role', activeFilters.role);
            next.set('status', activeFilters.status);
            if (isMockMode) next.set(REPORTS_MOCK_PARAM, '1');
            else next.delete(REPORTS_MOCK_PARAM);
            return next;
        }, { replace: true });
    }, [activeFilters, isMockMode, setSearchParams]);

    const { exportUsersMutation } = useReportMutations();
    const isLoading = !isMockMode && isRealLoading;
    const isFetching = !isMockMode && isRealFetching;
    const data = isMockMode ? getMockUsersReportData({ year: activeFilters.year }) : realData;

    const handleLocalFilterChange = (updated: Partial<typeof localFilters>) => {
        setLocalFilters((prev) => ({ ...prev, ...updated }));
    };

    const handleApplyFilters = () => {
        if (localFilters.year < 2000 || localFilters.year > 2027) {
            toast.error(t('filter.validation.year_invalid'));
            return;
        }
        setActiveFilters((prev) => ({ ...prev, ...localFilters }));
    };

    const handleResetFilters = () => {
        const defaultFilters = { year: currentYear, role: 'all' as const, status: 'all' as const };
        setLocalFilters(defaultFilters);
        setActiveFilters(defaultFilters);
        toast.info(t('filter.toast_reset'));
    };

    const handleExportExcel = async () => {
        try {
            const dateStr = new Date().toISOString().split('T')[0];
            const fallbackFilename = `bao-cao-nguoi-dung_year_${activeFilters.year}_role_${activeFilters.role}_status_${activeFilters.status}_${dateStr}.xlsx`;

            if (isMockMode) {
                const headers = 'Tháng,Số lượng đăng ký mới,Tổng lũy kế\n';
                const rows = data?.stats
                    .map((i) => `"Tháng ${i.month}","${i.count}","${i.cumulativeCount}"`)
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
                exportUsersMutation.mutateAsync({
                    params: { role: activeFilters.role, status: activeFilters.status },
                    fallbackFilename,
                }),
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
            breadcrumbCurrentLabel="sidebar.reports_users"
            testIdPrefix="users-report"
            isMockMode={isMockMode}
            showErrorPanel={showErrorPanel}
            isExportDisabled={isLoading || isFetching}
            isExportPending={exportUsersMutation.isPending}
            exportLabel={tCommon('export.btn_label')}
            onToggleMock={toggleMockMode}
            onExport={handleExportExcel}
            onRetry={() => refetch()}
            onUseMock={enableMockMode}
        >
            <UsersReportFilterBar
                filters={localFilters}
                onFilterChange={handleLocalFilterChange}
                onApply={handleApplyFilters}
                onReset={handleResetFilters}
                isSubmitting={isLoading || isFetching}
            />

            <UsersStatsCards
                totalNewUsers={data?.totalNewUsers ?? 0}
                totalUsers={data?.totalUsers ?? 0}
                activeRate={data?.activeRate ?? 0}
                isLoading={isLoading}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <UsersReportCharts data={data?.stats} isLoading={isLoading} />
                <UsersRoleChart data={data?.roleDistribution} isLoading={isLoading} />
            </div>

            <UsersReportTable data={data?.stats} isLoading={isLoading} />
        </ReportPageShell>
    );
};

export default UsersReport;
