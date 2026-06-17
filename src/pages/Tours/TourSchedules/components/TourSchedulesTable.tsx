import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { ChevronLeft, ChevronRight, Trash2, ImageOff, ArrowUpDown, RefreshCw, Plus, Pencil } from 'lucide-react';

import type { Schedule } from '@/types/schedule';
import { ScheduleBookingAvailability, ScheduleStatus } from '@/types/schedule';
import CustomSelect from '@/components/ui/CustomSelect';
import type { Option } from '@/components/ui/CustomSelect';
import ProgressBar from '@/components/ui/ProgressBar';
import { formatCurrency } from '@/utils/pricing';
import {
    formatAdminShortDate,
    formatAdminWeekday,
    isPastDate,
    isWithinNextDays,
} from '@/utils/dateDisplay';
import LoadingReact from '@/components/loading';
import { ROUTES } from '@/routes/routes';

type Props = {
    data: Schedule[];
    isLoading: boolean;
    isRefreshing?: boolean;
    total: number;
    page: number;
    limit: number;
    sort: string;
    order: 'asc' | 'desc';
    selectedIds: number[];
    onPageChange: (page: number) => void;
    onLimitChange: (limit: number) => void;
    onSortChange: (field: string) => void;
    onToggleRow: (id: number) => void;
    onToggleAllPage: (checked: boolean) => void;
    onStatusChange: (id: number, status: string) => void;
    onDelete: (schedule: Schedule) => void;
    onBulkStatusChange?: (ids: number[], status: 'available' | 'cancelled') => void;
    onFilterByTour?: (tourId: number | string) => void;
    isBulkMutating?: boolean;
};

const TourSchedulesTable = ({
    data,
    isLoading,
    isRefreshing,
    total,
    page,
    limit,
    sort,
    order,
    selectedIds,
    onPageChange,
    onLimitChange,
    onSortChange,
    onToggleRow,
    onToggleAllPage,
    onStatusChange,
    onDelete,
    onBulkStatusChange,
    onFilterByTour,
    isBulkMutating,
}: Props) => {
    const { t, i18n } = useTranslation(['schedules', 'tour', 'common']);
    const navigate = useNavigate();

    const pageIds = useMemo(() => data.map((r) => Number(r.id)), [data]);
    const allPageSelected =
        pageIds.length > 0 && pageIds.every((id) => selectedIds.includes(id));

    const progressColor = (booked: number, max: number): 'blue' | 'yellow' | 'red' => {
        if (max <= 0) {
            return 'blue';
        }
        const pct = (booked / max) * 100;
        if (pct >= 90) {
            return 'red';
        }
        if (pct >= 61) {
            return 'yellow';
        }
        return 'blue';
    };

    const lastPage = Math.max(1, Math.ceil(total / limit));

    const scheduleStatusLabel = (status: ScheduleStatus) => {
        if (status === ScheduleStatus.AVAILABLE) {
            return t('schedules:status.available');
        }
        if (status === ScheduleStatus.FULL) {
            return t('schedules:status.full');
        }
        return t('schedules:status.cancelled');
    };

    const toScheduleCreate = (tourId: number | string) =>
        ROUTES.TOURS_SCHEDULE_CREATE.replace(':id', String(tourId));

    const toScheduleEdit = (id: number | string) =>
        ROUTES.TOURS_SCHEDULE_EDIT.replace(':id', String(id));

    return (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-center px-[24px] py-[16px] border-b border-[#E2E8F0] gap-4">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    {selectedIds.length > 0 ? (
                        <div className="flex items-center gap-4 animate-in fade-in slide-in-from-left-2 duration-150">
                            <span className="text-[13px] font-bold text-[#14b8a6] whitespace-nowrap">
                                {t('schedules:actions.selected_count', { count: selectedIds.length })}
                            </span>
                            <div className="h-4 w-px bg-[#E2E8F0]" />
                            <div className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar">
                                <button
                                    onClick={() => onBulkStatusChange?.(selectedIds, 'available')}
                                    disabled={isBulkMutating}
                                    className="px-3 py-1.5 bg-[#D1FAE5] text-[#10B981] rounded-md text-[12px] font-bold hover:brightness-95 transition-all duration-150 shadow-sm whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    {t('schedules:actions.bulk_activate')}
                                </button>
                                <button
                                    onClick={() => onBulkStatusChange?.(selectedIds, 'cancelled')}
                                    disabled={isBulkMutating}
                                    className="px-3 py-1.5 bg-[#FEE2E2] text-[#EF4444] rounded-md text-[12px] font-bold hover:brightness-95 transition-all duration-150 shadow-sm whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    {t('schedules:actions.bulk_cancel')}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <h2 className="text-[14px] font-bold text-[#1E293B] uppercase tracking-wider">{t('schedules:table.title', 'Danh sách lịch trình')}</h2>
                            {(isRefreshing || isLoading) && (
                                <div className="animate-fade-in">
                                    <RefreshCw className="w-3.5 h-3.5 text-[#14b8a6] animate-spin" />
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                    <span className="text-[13px] text-text-secondary font-sans">
                        {t('schedules:table.showing_summary', {
                            start: total > 0 ? (page - 1) * limit + 1 : 0,
                            end: Math.min(page * limit, total),
                            total,
                        })}
                    </span>
                    <CustomSelect
                        options={[10, 20, 50].map((n) => ({ value: n, label: t('table.items_per_page', { count: n, ns: 'tour', defaultValue: `${n} dòng` }) }))}
                        value={{ value: limit, label: t('table.items_per_page', { count: limit, ns: 'tour', defaultValue: `${limit} dòng` }) }}
                        onChange={(opt: Option | null) => onLimitChange(Number(opt?.value))}
                        className="text-[12px] w-[120px]"
                        isSearchable={false}
                        size="sm"
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full min-w-[960px]">
                    <thead>
                        <tr className="bg-surface border-b border-[#E2E8F0]">
                            <th className="w-10 px-3 py-3">
                                <div className="flex justify-center">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded border-[#E2E8F0] text-[#14b8a6] accent-[#14b8a6] cursor-pointer"
                                        checked={allPageSelected}
                                        onChange={(e) => onToggleAllPage(e.target.checked)}
                                        aria-label={t('schedules:table.select_all')}
                                    />
                                </div>
                            </th>
                            <th className="px-3 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-text-secondary w-12">
                                {t('schedules:table.stt')}
                            </th>
                            <th className="px-3 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                                {t('schedules:table.tour')}
                            </th>
                            <th className="px-3 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-text-secondary w-36">
                                <button
                                    type="button"
                                    onClick={() => onSortChange('start_date')}
                                    className="inline-flex items-center gap-1 text-text-secondary hover:text-[#14b8a6]"
                                >
                                    {t('schedules:table.start')}
                                    <ArrowUpDown className="w-3.5 h-3.5" />
                                    {sort === 'start_date' ? ` (${order === 'desc' ? t('schedules:table.sort_desc', 'Giảm dần') : t('schedules:table.sort_asc', 'Tăng dần')})` : ''}
                                </button>
                            </th>
                            <th className="px-3 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-text-secondary w-32">
                                {t('schedules:table.end')}
                            </th>
                            <th className="px-3 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-text-secondary w-28">
                                {t('schedules:table.price')}
                            </th>
                            <th className="px-3 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-text-secondary w-36">
                                {t('schedules:table.capacity')}
                            </th>
                            <th className="px-3 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-text-secondary w-36">
                                {t('schedules:table.status')}
                            </th>
                            <th className="px-3 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-text-secondary w-32">
                                {t('schedules:table.booking_availability')}
                            </th>
                            <th className="px-3 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-text-secondary w-32">
                                {t('schedules:table.actions')}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {(isLoading && data.length === 0) ? (
                            <tr>
                                <td colSpan={10} className="py-20 text-center">
                                    <LoadingReact type="spokes" height={48} width={48} color="#14B8A6" />
                                </td>
                            </tr>
                        ) : data.length === 0 ? (
                            <tr>
                                <td colSpan={10} className="py-[80px] text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
                                            <RefreshCw size={32} className="text-[#E2E8F0]" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[#1E293B] font-bold text-[16px]">{t('schedules:no_data.title', 'Không có dữ liệu')}</p>
                                            <p className="text-text-secondary text-[14px]">{t('schedules:no_data.description')}</p>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            data.map((row, idx) => {
                                const idNum = Number(row.id);
                                const selected = selectedIds.includes(idNum);
                                const isFull = row.status === ScheduleStatus.FULL;
                                const past = isPastDate(row.startDate);
                                const soon = !past && isWithinNextDays(row.startDate, 7);
                                const pctColor = progressColor(row.bookedSlots, row.totalSlots);

                                return (
                                    <tr
                                        key={row.id}
                                        className={clsx(
                                            'border-b border-border hover:bg-surface transition-colors',
                                            selected && 'bg-[#dff7f4] border-l-[3px] border-l-[#14b8a6]',
                                            isRefreshing && 'opacity-60',
                                        )}
                                    >
                                        <td className="px-3 py-3">
                                            <div className="flex justify-center">
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 rounded border-[#E2E8F0] text-[#14b8a6] accent-[#14b8a6] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                                    checked={selected}
                                                    disabled={isFull}
                                                    onChange={() => onToggleRow(idNum)}
                                                    aria-label={t('schedules:table.select_row', {
                                                        name: row.tourName || t('schedules:card.untitled_tour'),
                                                    })}
                                                />
                                            </div>
                                        </td>
                                        <td className="px-3 py-3 text-[13px] font-semibold text-[#64748B]">
                                            {(page - 1) * limit + idx + 1}
                                        </td>
                                        <td className="px-3 py-3">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-11 h-11 rounded-lg overflow-hidden border border-[#E2E8F0] shrink-0 bg-slate-100 flex items-center justify-center">
                                                    {row.tourImage ? (
                                                        <img
                                                            src={row.tourImage}
                                                            alt=""
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <ImageOff className="w-5 h-5 text-slate-300" />
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <button
                                                        type="button"
                                                        onClick={() => onFilterByTour?.(row.tourId)}
                                                        title={t('schedules:actions.filter_by_tour')}
                                                        aria-label={`${t('schedules:actions.filter_by_tour')}: ${row.tourName || t('schedules:card.untitled_tour')}`}
                                                        className="text-left text-[14px] font-semibold text-[#1E293B] hover:text-[#14b8a6] line-clamp-2"
                                                    >
                                                        {row.tourName || '—'}
                                                    </button>
                                                    {row.categoryName && (
                                                        <span 
                                                            className="inline-block max-w-[110px] truncate align-bottom text-[11px] font-bold uppercase tracking-wide px-2 py-0.5 mt-1 rounded-full bg-[#dff7f4] text-[#0f766e] border border-[#ccfbf1]"
                                                            title={row.categoryName}
                                                        >
                                                            {row.categoryName}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-3 py-3">
                                            <div className="flex flex-wrap items-center gap-1">
                                                <span
                                                    className={clsx(
                                                        'text-[13px] font-semibold',
                                                        past ? 'text-text-secondary' : 'text-[#1E293B]',
                                                    )}
                                                >
                                                    {formatAdminShortDate(row.startDate, i18n.language)}
                                                </span>
                                                {soon ? (
                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#dff7f4] text-[#0f766e]">
                                                        {t('schedules:table.upcoming')}
                                                    </span>
                                                ) : null}
                                            </div>
                                            <div className="text-[11px] text-text-secondary">
                                                {formatAdminWeekday(row.startDate, i18n.language)}
                                            </div>
                                        </td>
                                        <td className="px-3 py-3 text-[13px] text-[#64748B]">
                                            {formatAdminShortDate(row.endDate, i18n.language)}
                                        </td>
                                        <td className="px-3 py-3">
                                            {row.priceAdult == null ? (
                                                <span className="text-[13px] text-text-secondary italic">
                                                    {t('schedules:fields.price_follows_tour')}
                                                </span>
                                            ) : (
                                                <span className="text-[13px] font-bold text-[#FF6B35]">
                                                    {formatCurrency(row.priceAdult)}đ
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-3 py-3">
                                            <div className="text-[13px] font-semibold text-[#1E293B]">
                                                {row.bookedSlots} / {row.totalSlots}
                                            </div>
                                            <div className="w-20 mt-1">
                                                <ProgressBar
                                                    value={row.bookedSlots}
                                                    max={Math.max(row.totalSlots, 1)}
                                                    color={pctColor}
                                                />
                                            </div>
                                        </td>
                                        <td className="px-3 py-3">
                                            {row.status === ScheduleStatus.FULL ? (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide bg-[#FEE2E2] text-[#B91C1C] border border-[#FECACA]">
                                                    {scheduleStatusLabel(row.status)}
                                                </span>
                                            ) : (
                                                <CustomSelect
                                                    value={{
                                                        value: row.status,
                                                        label: scheduleStatusLabel(row.status),
                                                    }}
                                                    onChange={(opt: Option | null) => onStatusChange(idNum, String(opt?.value))}
                                                    options={[
                                                        { value: ScheduleStatus.AVAILABLE, label: t('schedules:status.available') },
                                                        { value: ScheduleStatus.CANCELLED, label: t('schedules:status.cancelled') },
                                                    ]}
                                                    size="sm"
                                                    containerClassName="w-[130px]"
                                                    isSearchable={false}
                                                />
                                            )}
                                        </td>
                                        <td className="px-3 py-3">
                                            <span
                                                className={clsx(
                                                    'inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide',
                                                    row.bookingAvailability === ScheduleBookingAvailability.SOLD_OUT
                                                        ? 'bg-[#FEE2E2] text-[#B91C1C] border border-[#FECACA]'
                                                        : 'bg-[#dff7f4] text-[#0f766e] border border-[#ccfbf1]',
                                                )}
                                            >
                                                {row.bookingAvailability === ScheduleBookingAvailability.SOLD_OUT
                                                    ? t('schedules:booking_availability.sold_out')
                                                    : t('schedules:booking_availability.open')}
                                            </span>
                                        </td>
                                        <td className="px-3 py-3">
                                            <div className="flex justify-end gap-1">
                                                <button
                                                    type="button"
                                                    title={t('schedules:actions.add_new')}
                                                    aria-label={t('schedules:actions.add_new')}
                                                    onClick={() => navigate(toScheduleCreate(row.tourId))}
                                                    className="w-7 h-7 flex items-center justify-center rounded-md bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#14b8a6] hover:border-[#14b8a6] transition-colors"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    title={t('common:actions.edit')}
                                                    aria-label={t('common:actions.edit')}
                                                    onClick={() => navigate(toScheduleEdit(row.id))}
                                                    className="w-7 h-7 flex items-center justify-center rounded-md bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#F59E0B] hover:border-[#F59E0B] transition-colors"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                {(() => {
                                                    const hasBookings = row.bookedSlots > 0;
                                                    const deleteLabel = hasBookings
                                                        ? t('schedules:actions.delete_blocked_has_bookings')
                                                        : t('common:actions.remove');
                                                    return (
                                                        <button
                                                            type="button"
                                                            title={deleteLabel}
                                                            aria-label={deleteLabel}
                                                            disabled={hasBookings}
                                                            onClick={() => {
                                                                if (!hasBookings) {
                                                                    onDelete(row);
                                                                }
                                                            }}
                                                            className={clsx(
                                                                'w-7 h-7 flex items-center justify-center rounded-md bg-white border border-[#E2E8F0] text-[#64748B] transition-colors',
                                                                hasBookings
                                                                    ? 'opacity-40 cursor-not-allowed'
                                                                    : 'hover:text-[#EF4444] hover:border-[#EF4444]',
                                                            )}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    );
                                                })()}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            <div className="px-6 py-4 border-t border-[#E2E8F0] bg-surface flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-[13px] font-semibold text-[#64748B]">
                    {t('schedules:table.showing_summary', {
                        start: total > 0 ? (page - 1) * limit + 1 : 0,
                        end: Math.min(page * limit, total),
                        total,
                    })}
                </div>
                <div className="flex items-center gap-1.5">
                    <button
                        type="button"
                        onClick={() => onPageChange(page - 1)}
                        disabled={page <= 1}
                        aria-label={t('common:pagination.previous')}
                        className="w-[32px] h-[32px] flex items-center justify-center rounded-md bg-white border border-[#E2E8F0] text-[#64748B] hover:border-[#14b8a6] hover:text-[#14b8a6] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 shadow-sm active:scale-90"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    
                    <div className="flex items-center gap-1.5">
                        {Array.from({ length: lastPage }, (_, i) => i + 1)
                            .filter(p => p === 1 || p === lastPage || Math.abs(p - page) <= 1)
                            .map((p, i, arr) => (
                                <div key={p} className="flex items-center gap-1.5">
                                    {i > 0 && arr[i - 1] !== p - 1 && (
                                        <span className="text-slate-300 font-bold px-1">...</span>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => onPageChange(Number(p))}
                                        className={clsx(
                                            'w-[32px] h-[32px] flex items-center justify-center rounded-md text-[13px] font-bold transition-all duration-150 shadow-sm',
                                            p === page 
                                                ? 'bg-[#14b8a6] text-white border-[#14b8a6]' 
                                                : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:border-[#14b8a6] hover:text-[#14b8a6] active:scale-95'
                                        )}
                                    >
                                        {p}
                                    </button>
                                </div>
                            ))}
                    </div>

                    <button
                        type="button"
                        onClick={() => onPageChange(page + 1)}
                        disabled={page >= lastPage}
                        aria-label={t('common:pagination.next')}
                        className="w-[32px] h-[32px] flex items-center justify-center rounded-md bg-white border border-[#E2E8F0] text-[#64748B] hover:border-[#14b8a6] hover:text-[#14b8a6] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 shadow-sm active:scale-90"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TourSchedulesTable;
