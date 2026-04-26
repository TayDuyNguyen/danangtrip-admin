import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus } from 'lucide-react';

import type { Option } from '@/components/ui/CustomSelect';
import type { TourFilters } from '@/dataHelper/tour.dataHelper';
import {
    useSchedules,
    useScheduleStats,
    useDeleteSchedule,
    useUpdateScheduleStatus,
    useBulkUpdateScheduleStatus,
} from '@/hooks/useScheduleQueries';
import { useToursQuery } from '@/hooks/useTourQueries';
import type { ScheduleFilters } from '@/types/schedule';
import { ScheduleStatus } from '@/types/schedule';
import type { Schedule } from '@/types/schedule';

import FilterBar from './components/FilterBar';
import StatsSummary from './components/StatsSummary';
import SchedulesCalendar from './components/SchedulesCalendar';
import TourSchedulesTable from './components/TourSchedulesTable';
import ScheduleDeleteDialog from './components/ScheduleDeleteDialog';
import EmptyState from '@/components/common/EmptyState';
import { ROUTES } from '@/routes/routes';

const defaultFilters: ScheduleFilters = {
    page: 1,
    limit: 10,
    sort: 'start_date',
    order: 'desc',
    status: 'all',
};

const tourPickerFiltersBase: TourFilters = {
    q: '',
    tour_category_id: 'all',
    status: 'all',
    type: 'all',
    sort: 'name',
    order: 'asc',
};

const SchedulesPage = () => {
    const { t } = useTranslation(['schedules', 'common']);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [filters, setFilters] = useState<ScheduleFilters>(() => {
        const tid = searchParams.get('tour_id');
        return {
            ...defaultFilters,
            ...(tid ? { tour_id: tid, page: 1 } : {}),
        };
    });
    const [filterBarKey, setFilterBarKey] = useState(0);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [deleteTarget, setDeleteTarget] = useState<Schedule | null>(null);

    const { data: scheduleData, isLoading, isFetching, isError } = useSchedules(filters);

    const statsParams = useMemo(
        () => ({
            tour_id: filters.tour_id,
            start_date: filters.start_date,
            end_date: filters.end_date,
            q: filters.q,
        }),
        [filters.tour_id, filters.start_date, filters.end_date, filters.q],
    );

    const { data: statsData, isLoading: isLoadingStats, isFetching: isFetchingStats } = useScheduleStats(statsParams);

    // Backend validates per_page <= 100
    const { data: toursPicker } = useToursQuery(tourPickerFiltersBase, 1, 100);

    const tourOptions = useMemo<Option[]>(() => {
        const rows = toursPicker?.data ?? [];
        return [
            { value: 'all', label: t('schedules:filters.tour_placeholder') },
            ...rows.map((row) => ({ value: String(row.id), label: row.name })),
        ];
    }, [toursPicker?.data, t]);

    const applyFilters = useCallback((patch: Partial<ScheduleFilters>) => {
        setFilters((prev) => ({ ...prev, ...patch }));
        setSelectedIds([]);
    }, []);

    const handleReset = useCallback(() => {
        setFilters(defaultFilters);
        setSelectedIds([]);
        setFilterBarKey((k) => k + 1);
    }, []);

    const hasActiveFilters = useMemo(() => {
        return Boolean(
            (filters.q && filters.q.trim() !== '') ||
                (filters.tour_id && filters.tour_id !== 'all') ||
                (filters.status && filters.status !== 'all') ||
                filters.start_date ||
                filters.end_date,
        );
    }, [filters]);

    const { mutate: deleteSchedule, isPending: isDeleting } = useDeleteSchedule();
    const { mutate: updateStatus } = useUpdateScheduleStatus();
    const { mutate: bulkStatus, isPending: isBulk } = useBulkUpdateScheduleStatus();

    const rows = scheduleData?.data ?? [];
    const total = scheduleData?.total ?? 0;
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 10;

    const handleSortChange = (field: string) => {
        setFilters((prev) => {
            if (prev.sort === field) {
                return { ...prev, order: prev.order === 'asc' ? 'desc' : 'asc', page: 1 };
            }
            return { ...prev, sort: field, order: 'desc', page: 1 };
        });
    };

    const toggleRow = (id: number) => {
        setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    };

    const toggleAllPage = (checked: boolean) => {
        const ids = rows.map((r) => Number(r.id));
        if (!checked) {
            setSelectedIds((prev) => prev.filter((id) => !ids.includes(id)));
            return;
        }
        setSelectedIds((prev) => Array.from(new Set([...prev, ...ids])));
    };

    const handleBulkAvailable = () => {
        if (selectedIds.length === 0) {
            return;
        }
        bulkStatus({ ids: selectedIds, status: ScheduleStatus.AVAILABLE });
        setSelectedIds([]);
    };

    const handleBulkCancel = () => {
        if (selectedIds.length === 0) {
            return;
        }
        bulkStatus({ ids: selectedIds, status: ScheduleStatus.CANCELLED });
        setSelectedIds([]);
    };

    return (
        <div className="p-4 lg:p-10 mx-auto min-h-screen bg-white font-sans space-y-6">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                    <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wide mb-1">
                        {t('schedules:breadcrumb')}
                    </p>
                    <h1 className="text-2xl font-black text-[#1E293B]">{t('schedules:title')}</h1>
                    <p className="text-sm text-[#64748B] mt-1">{t('schedules:subtitle')}</p>
                </div>
                <button
                    type="button"
                    onClick={() => navigate(ROUTES.TOURS_LIST)}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#14b8a6] hover:bg-[#0f766e] text-white rounded-xl font-bold shadow-md transition-all"
                >
                    <Plus className="w-5 h-5" />
                    {t('schedules:actions.add_new')}
                </button>
            </div>

            <StatsSummary stats={statsData} loading={isLoadingStats || isFetchingStats} />

            <SchedulesCalendar 
                tourId={filters.tour_id}
                selectedDate={filters.start_date}
                onSelectDate={(date) => {
                    applyFilters({
                        start_date: date,
                        end_date: date,
                        page: 1
                    });
                }}
            />

            {selectedIds.length > 0 ? (
                <div className="flex flex-wrap items-center gap-3 px-4 py-3 bg-blue-100 border border-slate-100 rounded-xl">
                    <span className="text-[13px] font-bold text-slate-900">
                        {t('schedules:actions.selected_count', { count: selectedIds.length })}
                    </span>
                    <button
                        type="button"
                        disabled={isBulk}
                        onClick={handleBulkAvailable}
                        className="px-3 py-1.5 rounded-lg bg-[#f4fce3] text-[#0f766e] text-xs font-bold hover:opacity-90 disabled:opacity-50"
                    >
                        {t('schedules:actions.bulk_activate')}
                    </button>
                    <button
                        type="button"
                        disabled={isBulk}
                        onClick={handleBulkCancel}
                        className="px-3 py-1.5 rounded-lg bg-[#FEE2E2] text-[#EF4444] text-xs font-bold hover:opacity-90 disabled:opacity-50"
                    >
                        {t('schedules:actions.bulk_cancel')}
                    </button>
                </div>
            ) : null}

            <FilterBar
                key={filterBarKey}
                tourOptions={tourOptions}
                filters={filters}
                onApply={applyFilters}
                onReset={handleReset}
                hasActiveFilters={hasActiveFilters}
            />

            {isError ? (
                <EmptyState title={t('common:error.fetch')} description={t('common:error.try_again')} />
            ) : (
                <TourSchedulesTable
                    data={rows}
                    isLoading={isLoading || isFetching}
                    total={total}
                    page={page}
                    limit={limit}
                    sort={filters.sort ?? 'start_date'}
                    order={filters.order ?? 'desc'}
                    selectedIds={selectedIds}
                    onPageChange={(p) => applyFilters({ page: p })}
                    onLimitChange={(l) => applyFilters({ limit: l, page: 1 })}
                    onSortChange={handleSortChange}
                    onToggleRow={toggleRow}
                    onToggleAllPage={toggleAllPage}
                    onStatusChange={(id, status) => updateStatus({ id, status })}
                    onDelete={setDeleteTarget}
                />
            )}

            <ScheduleDeleteDialog
                isOpen={!!deleteTarget}
                schedule={deleteTarget}
                isDeleting={isDeleting}
                onClose={() => setDeleteTarget(null)}
                onConfirm={() => {
                    if (!deleteTarget) {
                        return;
                    }
                    deleteSchedule(Number(deleteTarget.id), {
                        onSuccess: () => {
                            setDeleteTarget(null);
                            setSelectedIds((prev) => prev.filter((id) => id !== Number(deleteTarget.id)));
                        },
                    });
                }}
            />
        </div>
    );
};

export default SchedulesPage;
