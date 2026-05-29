import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/routes/routes';
import { 
    Eye, CheckCircle, XCircle, ArrowUpDown, ChevronUp, ChevronDown, 
    Calendar, Clock, RefreshCw, ChevronLeft, ChevronRight
} from 'lucide-react';
import { clsx } from 'clsx';
import type { BookingItem } from '@/dataHelper/booking.dataHelper';
import BookingStatusBadge from './BookingStatusBadge';
import PaymentStatusBadge from './PaymentStatusBadge';
import LoadingReact from '@/components/loading';
import CustomSelect, { type Option } from '@/components/ui/CustomSelect';
import { formatAdminTableDate, formatAdminTableDateTime } from '@/utils';

interface BookingTableProps {
    data: BookingItem[];
    isLoading: boolean;
    isRefreshing?: boolean;
    total: number;
    page: number;
    limit: number;
    onPageChange: (page: number) => void;
    onLimitChange: (limit: number) => void;
    onRefresh?: () => void;
    onConfirm: (id: number) => void;
    onCancel: (booking: BookingItem) => void;
    sorting: { sortBy: string; sortOrder: 'asc' | 'desc' };
    onSort: (field: string) => void;
}

export const BookingTable = ({
    data,
    isLoading,
    isRefreshing,
    total,
    page,
    limit,
    onPageChange,
    onLimitChange,
    onRefresh,
    onConfirm,
    onCancel,
    sorting,
    onSort,
}: BookingTableProps) => {
    const { t, i18n } = useTranslation(['booking', 'tour', 'common']);
    const navigate = useNavigate();
    const lastPage = Math.max(1, Math.ceil(total / limit));

    const handleSortClick = (field: string) => {
        onSort(field);
    };

    return (
        <div className="bg-white border border-[#E2E8F0] rounded-[16px] shadow-sm overflow-hidden flex flex-col group/card min-w-0">
            {/* Table Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-center px-[24px] py-[16px] border-b border-[#E2E8F0] gap-4">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="flex items-center gap-2">
                        <h2 className="text-[14px] font-bold text-[#1E293B] uppercase tracking-wider">
                            {t('page.title', 'Danh sách Đơn hàng')}
                        </h2>
                        {onRefresh && (
                            <button
                                type="button"
                                onClick={onRefresh}
                                disabled={isRefreshing || isLoading}
                                className={clsx(
                                    "p-1.5 rounded-md transition-all duration-150",
                                    isRefreshing ? "text-[#14b8a6]" : "text-text-secondary hover:text-[#14b8a6] active:scale-95"
                                )}
                                aria-label={t('common:actions.refresh', 'Làm mới')}
                                title={t('common:actions.refresh', 'Làm mới')}
                            >
                                <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end min-w-0">
                    <span className="text-[13px] text-text-secondary font-sans flex-1 min-w-0 whitespace-nowrap truncate">
                        {t('common:pagination.showing_summary', { 
                            start: total > 0 ? (page - 1) * limit + 1 : 0,
                            end: Math.min(page * limit, total),
                            total: total
                        })}
                    </span>
                    <CustomSelect
                        options={[10, 20, 50].map(v => ({ value: v, label: t('table.items_per_page', { count: v, ns: 'tour', defaultValue: `${v} dòng` }) }))}
                        value={{ value: limit, label: t('table.items_per_page', { count: limit, ns: 'tour', defaultValue: `${limit} dòng` }) }}
                        onChange={(opt) => onLimitChange(Number((opt as Option)?.value))}
                        containerClassName="w-[120px] shrink-0"
                        className="text-[12px]"
                        menuPortalTarget={document.body}
                        size="sm"
                    />
                </div>
            </div>

            <div className="overflow-x-auto [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1.5">
                <table className="w-full text-left border-collapse min-w-[1000px] table-fixed">
                    <thead>
                        <tr className="bg-surface border-b border-[#E2E8F0] select-none text-[11px] uppercase font-bold text-text-secondary tracking-wider">
                            <th className="px-6 py-4 w-36 text-left">
                                {t('labels.booking_code')}
                            </th>
                            <th className="px-6 py-4 text-left">
                                {t('labels.customer')}
                            </th>
                            <th className="px-6 py-4 text-left">
                                {t('labels.tour_summary')}
                            </th>
                            <th 
                                className="px-6 py-4 w-72 cursor-pointer hover:text-slate-900 transition-colors text-left"
                                onClick={() => handleSortClick('booked_at')}
                            >
                                <div className="flex items-center gap-1">
                                    {t('labels.booked_at')}
                                    {sorting.sortBy === 'booked_at' ? (
                                        sorting.sortOrder === 'asc' ? <ChevronUp size={14} className="text-[#14B8A6] shrink-0" /> : <ChevronDown size={14} className="text-[#14B8A6] shrink-0" />
                                    ) : (
                                        <ArrowUpDown size={13} className="text-slate-400 shrink-0" />
                                    )}
                                </div>
                            </th>
                            <th 
                                className="px-6 py-4 w-36 cursor-pointer hover:text-slate-900 transition-colors text-left"
                                onClick={() => handleSortClick('amount')}
                            >
                                <div className="flex items-center gap-1">
                                    {t('labels.total_amount')}
                                    {sorting.sortBy === 'amount' ? (
                                        sorting.sortOrder === 'asc' ? <ChevronUp size={14} className="text-[#14B8A6] shrink-0" /> : <ChevronDown size={14} className="text-[#14B8A6] shrink-0" />
                                    ) : (
                                        <ArrowUpDown size={13} className="text-slate-400 shrink-0" />
                                    )}
                                </div>
                            </th>
                            <th className="px-6 py-4 w-48 text-left">
                                {t('labels.booking_status')}
                            </th>
                            <th className="px-6 py-4 w-36 text-right">
                                {t('table.col_actions')}
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 font-sans">
                        {isLoading ? (
                            <tr>
                                <td colSpan={7} className="py-[100px] text-center bg-white">
                                    <LoadingReact />
                                </td>
                            </tr>
                        ) : data.length > 0 ? (
                            data.map((booking) => (
                                <tr 
                                    key={booking.id} 
                                    className={clsx(
                                        "group transition-all duration-150 border-b border-border last:border-0 hover:bg-surface",
                                        isRefreshing && "opacity-60"
                                    )}
                                >
                                    {/* Code */}
                                    <td className="px-6 py-4">
                                        <span className="text-[13px] font-black text-[#14b8a6] font-mono tracking-tight bg-[#14b8a6]/5 px-2.5 py-1 rounded-lg">
                                            {booking.code}
                                        </span>
                                    </td>

                                    {/* Customer info */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full border-2 border-slate-100 overflow-hidden shrink-0">
                                                {booking.customer.avatar ? (
                                                    <img src={booking.customer.avatar} alt={booking.customer.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xs uppercase">
                                                        {booking.customer.name.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="min-w-0 flex flex-col">
                                                <span className="text-xs font-bold text-slate-900 leading-tight truncate uppercase">
                                                    {booking.customer.name}
                                                </span>
                                                <span className="text-[10px] font-bold text-slate-400 leading-none mt-0.5 truncate">
                                                    {booking.customer.email}
                                                </span>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Tour info */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center shrink-0">
                                                {booking.tour.thumbnail ? (
                                                    <img src={booking.tour.thumbnail} alt={booking.tour.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <Calendar size={18} className="text-slate-300" />
                                                )}
                                            </div>
                                            <div className="min-w-0 flex flex-col">
                                                <span className="text-xs font-bold text-slate-900 leading-tight truncate">
                                                    {booking.tour.name}
                                                </span>
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider leading-none mt-1">
                                                    {booking.tour.category || t('labels.no_category')}
                                                </span>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Dates */}
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1 text-[11px] font-bold whitespace-nowrap">
                                            <div className="flex items-center gap-1.5 text-slate-400">
                                                <Calendar size={12} className="shrink-0" />
                                                <span>{t('labels.booked_at')}:</span>
                                                <span className="text-slate-700">{formatAdminTableDateTime(booking.bookedAt)}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-slate-400">
                                                <Clock size={12} className="shrink-0" />
                                                <span>{t('labels.departure_date')}:</span>
                                                <span className="text-slate-700">{formatAdminTableDate(booking.departureDate)}</span>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Amount */}
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-black text-[#14b8a6] tracking-tight">
                                            {booking.amount.toLocaleString(i18n.language === 'vi' ? 'vi-VN' : 'en-US')} {t('common:currency')}
                                        </span>
                                    </td>

                                    {/* Status */}
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1 w-fit">
                                            <BookingStatusBadge status={booking.status} className="h-5" />
                                            <PaymentStatusBadge status={booking.paymentStatus} className="h-5" />
                                        </div>
                                    </td>

                                    {/* Actions */}
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1.5">
                                            {/* View button */}
                                            <button
                                                type="button"
                                                onClick={() => navigate(ROUTES.BOOKINGS_DETAIL.replace(':id', booking.id.toString()))}
                                                className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:text-[#14B8A6] hover:border-[#14B8A6] hover:bg-slate-50 transition-all cursor-pointer bg-white"
                                                title={t('common:actions.view')}
                                            >
                                                <Eye size={14} />
                                            </button>

                                            {/* Confirm button */}
                                            {booking.status === 'pending' && (
                                                <button
                                                    type="button"
                                                    onClick={() => onConfirm(booking.id)}
                                                    className="w-8 h-8 rounded-lg border border-[#10B981] flex items-center justify-center text-[#10B981] hover:bg-[#10B981] hover:text-white transition-all cursor-pointer bg-white"
                                                    title={t('actions.confirm')}
                                                >
                                                    <CheckCircle size={14} />
                                                </button>
                                            )}

                                            {/* Cancel button */}
                                            {(booking.status === 'pending' || booking.status === 'confirmed') && (
                                                <button
                                                    type="button"
                                                    onClick={() => onCancel(booking)}
                                                    className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:text-rose-600 hover:border-rose-600 hover:bg-rose-50/50 transition-all cursor-pointer bg-white"
                                                    title={t('actions.cancel')}
                                                >
                                                    <XCircle size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7} className="py-[80px] text-center bg-white">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
                                            <RefreshCw size={32} className="text-[#E2E8F0]" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[#1E293B] font-bold text-[16px]">{t('empty.title')}</p>
                                            <p className="text-text-secondary text-[14px]">{t('empty.subtitle')}</p>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="px-[24px] py-[16px] border-t border-[#E2E8F0] bg-surface flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-[13px] font-medium text-[#64748B] font-sans">
                    {t('common:pagination.showing_summary', { 
                        start: total > 0 ? (page - 1) * limit + 1 : 0,
                        end: Math.min(page * limit, total),
                        total: total
                    })}
                </div>

                <div className="flex items-center gap-1.5">
                    <button
                        type="button"
                        onClick={() => onPageChange(page - 1)}
                        disabled={page === 1}
                        className="w-[32px] h-[32px] flex items-center justify-center rounded-md bg-white border border-[#E2E8F0] text-[#64748B] hover:border-[#14b8a6] hover:text-[#14b8a6] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 shadow-sm active:scale-90"
                    >
                        <ChevronLeft size={16} />
                    </button>

                    <div className="flex items-center gap-1.5">
                        {Array.from({ length: lastPage }, (_, i) => i + 1)
                            .filter(p => p === 1 || p === lastPage || Math.abs(p - page) <= 1)
                            .map((p, i, arr) => (
                                <div key={p} className="flex items-center gap-1.5">
                                    {i > 0 && arr[i - 1] !== p - 1 && <span className="text-slate-300 font-bold px-1">...</span>}
                                    <button
                                        type="button"
                                        onClick={() => onPageChange(p)}
                                        className={clsx(
                                            "w-[32px] h-[32px] flex items-center justify-center rounded-md text-[13px] font-bold transition-all duration-150 shadow-sm",
                                            p === page
                                                ? "bg-[#14b8a6] text-white border-[#14b8a6]"
                                                : "bg-white border border-[#E2E8F0] text-[#64748B] hover:border-[#14b8a6] hover:text-[#14b8a6] active:scale-95"
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
                        className="w-[32px] h-[32px] flex items-center justify-center rounded-md bg-white border border-[#E2E8F0] text-[#64748B] hover:border-[#14b8a6] hover:text-[#14b8a6] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 shadow-sm active:scale-90"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BookingTable;
