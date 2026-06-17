import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import { Map, RefreshCw } from 'lucide-react';
import { ROUTES } from '@/routes/routes';

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

const defaultFilters: ScheduleFilters = {
    page: 1,
    limit: 10,
    sort: 'start_date',
    order: 'desc',
    status: 'all',
};

const clearableFilterKeys = ['start_date', 'end_date', 'tour_id', 'q', 'booking_availability'] as const;

const parseFiltersFromSearchParams = (searchParams: URLSearchParams): ScheduleFilters => {
    const tid = searchParams.get('tour_id');
    const q = searchParams.get('q');
    const status = searchParams.get('status');
    const availability = searchParams.get('availability');
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const page = searchParams.get('page');
    const perPage = searchParams.get('per_page');

    return {
        ...defaultFilters,
        ...(tid ? { tour_id: tid } : {}),
        ...(q ? { q } : {}),
        ...(status ? { status } : {}),
        ...(availability ? { booking_availability: availability } : {}),
        ...(from ? { start_date: from } : {}),
        ...(to ? { end_date: to } : {}),
        ...(page ? { page: Math.max(1, Number(page) || 1) } : {}),
        ...(perPage ? { limit: Math.max(1, Number(perPage) || 10) } : {}),
    };
};

const tourPickerFiltersBase: TourFilters = {
    q: '',
    tour_category_id: 'all',
    status: 'all',
    booking_availability: 'all',
    type: 'all',
    sort: 'name',
    order: 'asc',
};

const SchedulesPage = () => {
    const { t } = useTranslation(['schedules', 'common', 'tour']);
    const [searchParams, setSearchParams] = useSearchParams();

    const [filters, setFilters] = useState<ScheduleFilters>(() =>
        parseFiltersFromSearchParams(searchParams),
    );
    const [filterBarKey, setFilterBarKey] = useState(0);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [deleteTarget, setDeleteTarget] = useState<Schedule | null>(null);

    const { data: scheduleData, isLoading, isFetching, isError, refetch } = useSchedules(filters);

    useEffect(() => {
        const params = new URLSearchParams();
        if (filters.tour_id && filters.tour_id !== 'all') {
            params.set('tour_id', String(filters.tour_id));
        }
        if (filters.q?.trim()) {
            params.set('q', filters.q.trim());
        }
        if (filters.status && filters.status !== 'all') {
            params.set('status', String(filters.status));
        }
        if (filters.booking_availability && filters.booking_availability !== 'all') {
            params.set('availability', String(filters.booking_availability));
        }
        if (filters.start_date) {
            params.set('from', filters.start_date);
        }
        if (filters.end_date) {
            params.set('to', filters.end_date);
        }
        if (filters.page && filters.page > 1) {
            params.set('page', String(filters.page));
        }
        if (filters.limit && filters.limit !== defaultFilters.limit) {
            params.set('per_page', String(filters.limit));
        }
        setSearchParams(params, { replace: true });
    }, [filters, setSearchParams]);

    const statsParams = useMemo(
        () => ({
            tour_id: filters.tour_id,
            start_date: filters.start_date,
            end_date: filters.end_date,
            q: filters.q,
            status: filters.status,
            booking_availability: filters.booking_availability,
        }),
        [
            filters.tour_id,
            filters.start_date,
            filters.end_date,
            filters.q,
            filters.status,
            filters.booking_availability,
        ],
    );

    const {
        data: statsData,
        isLoading: isLoadingStats,
        isFetching: isFetchingStats,
        isError: isStatsError,
    } = useScheduleStats(statsParams);

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
        setFilters((prev) => {
            const next: ScheduleFilters = { ...prev, ...patch };
            clearableFilterKeys.forEach((key) => {
                if (Object.prototype.hasOwnProperty.call(patch, key) && patch[key] === undefined) {
                    delete next[key];
                }
            });
            if (Object.prototype.hasOwnProperty.call(patch, 'status') && patch.status === 'all') {
                next.status = 'all';
            }
            return next;
        });
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
                (filters.booking_availability && filters.booking_availability !== 'all') ||
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

    return (
        <div className="p-4 lg:p-10 mx-auto min-h-screen bg-white font-sans space-y-6">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                    <div className="mb-2">
                        <Breadcrumbs
                            icon={Map}
                            items={[
                                { label: 'sidebar.tours', path: ROUTES.TOURS_LIST },
                                { label: 'sidebar.tour_schedules' }
                            ]}
                        />
                    </div>
                    <h1 className="text-2xl font-black text-[#1E293B]">{t('schedules:title')}</h1>
                    <p className="text-sm text-[#64748B] mt-1">{t('schedules:subtitle')}</p>
                </div>
            </div>

            <StatsSummary
                stats={statsData}
                loading={isLoadingStats || isFetchingStats}
                isError={isStatsError}
            />

            <SchedulesCalendar 
                tourId={filters.tour_id}
                searchQuery={filters.q}
                statusFilter={filters.status}
                bookingAvailabilityFilter={filters.booking_availability}
                selectedDate={filters.start_date}
                selectedEndDate={filters.end_date}
                onSelectDate={(date) => {
                    if (date) {
                        applyFilters({
                            start_date: date,
                            end_date: date,
                            page: 1,
                        });
                        return;
                    }
                    applyFilters({
                        start_date: undefined,
                        end_date: undefined,
                        page: 1,
                    });
                }}
            />

            <FilterBar
                key={filterBarKey}
                tourOptions={tourOptions}
                filters={filters}
                onApply={applyFilters}
                onReset={handleReset}
                hasActiveFilters={hasActiveFilters}
            />

            {isError ? (
                <div className="bg-white border border-[#E2E8F0] rounded-2xl p-10 flex flex-col items-center text-center">
                    <EmptyState title={t('common:error.fetch')} description={t('common:error.try_again')} />
                    <button
                        type="button"
                        onClick={() => void refetch()}
                        className="mt-2 px-6 py-2.5 bg-[#14b8a6] text-white rounded-xl text-[13px] font-bold hover:bg-[#0f766e] transition-colors inline-flex items-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4" />
                        {t('tour:form.departures.retry')}
                    </button>
                </div>
            ) : (
                <TourSchedulesTable
                    data={rows}
                    isLoading={isLoading}
                    isRefreshing={isFetching && !isLoading}
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
                    onFilterByTour={(tourId) => applyFilters({ tour_id: String(tourId), page: 1 })}
                    onBulkStatusChange={(ids, status) => bulkStatus({ ids, status: status === 'available' ? ScheduleStatus.AVAILABLE : ScheduleStatus.CANCELLED })}
                    isBulkMutating={isBulk}
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
