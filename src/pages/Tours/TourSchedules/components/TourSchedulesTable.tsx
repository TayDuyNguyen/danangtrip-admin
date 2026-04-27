import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { ChevronLeft, ChevronRight, Edit3, Trash2, ImageOff, ArrowUpDown, RefreshCw } from 'lucide-react';

import type { Schedule } from '@/types/schedule';
import { ScheduleStatus } from '@/types/schedule';
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
};

const TourSchedulesTable = ({
    data,
    isLoading,
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
}: Props) => {
    const { t, i18n } = useTranslation(['schedules', 'common']);
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

    return (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 px-6 py-4 border-b border-[#E2E8F0]">
                <div className="flex items-center gap-3">
                    {selectedIds.length > 0 && (
                        <span className="text-[13px] font-semibold text-[#14b8a6]">
                            {t('schedules:actions.selected_count', { count: selectedIds.length })}
                        </span>
                    )}
                </div>
                <div className="flex flex-wrap items-center gap-4 sm:ml-auto">
                    {isLoading && (
                        <div className="animate-fade-in">
                            <RefreshCw className="w-3.5 h-3.5 text-[#14b8a6] animate-spin" />
                        </div>
                    )}
                    <span className="text-[13px] font-medium text-text-secondary">
                        {t('schedules:table.showing_summary', {
                            start: total > 0 ? (page - 1) * limit + 1 : 0,
                            end: Math.min(page * limit, total),
                            total,
                        })}
                    </span>
                    <label className="flex items-center gap-2 text-[13px] text-[#64748B]">
                        <CustomSelect
                            value={{ value: limit, label: limit }}
                            onChange={(opt: Option | null) => onLimitChange(Number(opt?.value))}
                            options={[10, 20, 50].map((n) => ({ value: n, label: n }))}
                            size="sm"
                            containerClassName="w-[84px]"
                            isSearchable={false}
                        />
                    </label>
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
                            <th className="px-3 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-text-secondary w-32">
                                {t('schedules:table.actions')}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {(isLoading && data.length === 0) ? (
                            <tr>
                                <td colSpan={9} className="py-20 text-center">
                                    <LoadingReact type="spokes" height={48} width={48} color="#14B8A6" />
                                </td>
                            </tr>
                        ) : data.length === 0 ? (
                            <tr>
                                <td colSpan={9} className="py-16 text-center text-[#64748B] text-sm font-medium">
                                    {t('schedules:no_data.title')}
                                </td>
                            </tr>
                        ) : (
                            data.map((row, idx) => {
                                const idNum = Number(row.id);
                                const selected = selectedIds.includes(idNum);
                                const past = isPastDate(row.startDate);
                                const soon = !past && isWithinNextDays(row.startDate, 7);
                                const pctColor = progressColor(row.bookedSlots, row.totalSlots);

                                return (
                                    <tr
                                        key={row.id}
                                        className={clsx(
                                            'border-b border-border hover:bg-surface transition-colors',
                                            selected && 'bg-[#dff7f4] border-l-[3px] border-l-[#14b8a6]',
                                        )}
                                    >
                                        <td className="px-3 py-3">
                                            <div className="flex justify-center">
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 rounded border-[#E2E8F0] text-[#14b8a6] accent-[#14b8a6] cursor-pointer"
                                                    checked={selected}
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
                                                        onClick={() =>
                                                            navigate(
                                                                ROUTES.TOURS_EDIT.replace(
                                                                    ':id',
                                                                    String(row.tourId),
                                                                ),
                                                            )
                                                        }
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
                                            <CustomSelect
                                                value={{
                                                    value: row.status,
                                                    label:
                                                        row.status === ScheduleStatus.AVAILABLE
                                                            ? t('schedules:status.available')
                                                            : row.status === ScheduleStatus.FULL
                                                              ? t('schedules:status.full')
                                                              : t('schedules:status.cancelled'),
                                                }}
                                                onChange={(opt: Option | null) => onStatusChange(idNum, String(opt?.value))}
                                                options={[
                                                    { value: ScheduleStatus.AVAILABLE, label: t('schedules:status.available') },
                                                    { value: ScheduleStatus.FULL, label: t('schedules:status.full') },
                                                    { value: ScheduleStatus.CANCELLED, label: t('schedules:status.cancelled') },
                                                ]}
                                                size="sm"
                                                containerClassName="w-[130px]"
                                                isSearchable={false}
                                            />
                                        </td>
                                        <td className="px-3 py-3">
                                            <div className="flex justify-end gap-1">
                                                <button
                                                    type="button"
                                                    title={t('schedules:actions.edit_tour')}
                                                    onClick={() =>
                                                        navigate(
                                                            ROUTES.TOURS_EDIT.replace(
                                                                ':id',
                                                                String(row.tourId),
                                                            ),
                                                        )
                                                    }
                                                    className="w-7 h-7 flex items-center justify-center rounded-md bg-surface border border-[#E2E8F0] text-[#64748B] hover:text-[#F59E0B]"
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    title={t('common:actions.remove')}
                                                    onClick={() => onDelete(row)}
                                                    className="w-7 h-7 flex items-center justify-center rounded-md bg-surface border border-[#E2E8F0] text-[#64748B] hover:text-[#EF4444]"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
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
                                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-[#E2E8F0] text-[#64748B] hover:border-[#14b8a6] hover:text-[#14b8a6] disabled:opacity-40"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    
                    {Array.from({ length: lastPage }, (_, i) => i + 1)
                        .filter(p => p === 1 || p === lastPage || Math.abs(p - page) <= 1)
                        .reduce((acc: (string | number)[], p, i, arr) => {
                            if (i > 0 && p - arr[i - 1] > 1) {
                                acc.push('...');
                            }
                            acc.push(p);
                            return acc;
                        }, [])
                        .map((p, idx) => p === '...' ? (
                            <span key={`dots-${idx}`} className="px-1 text-text-secondary">...</span>
                        ) : (
                            <button
                                key={p}
                                type="button"
                                onClick={() => onPageChange(Number(p))}
                                className={clsx(
                                    "w-8 h-8 flex items-center justify-center rounded-lg border text-[13px] font-semibold transition-colors",
                                    p === page 
                                        ? "bg-[#14b8a6] text-white border-[#14b8a6]" 
                                        : "bg-white border-[#E2E8F0] text-[#64748B] hover:border-[#14b8a6] hover:text-[#14b8a6]"
                                )}
                            >
                                {p}
                            </button>
                        ))
                    }

                    <button
                        type="button"
                        onClick={() => onPageChange(page + 1)}
                        disabled={page >= lastPage}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-[#E2E8F0] text-[#64748B] hover:border-[#14b8a6] hover:text-[#14b8a6] disabled:opacity-40"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TourSchedulesTable;
