import { memo, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';
import { ExternalLink, CheckCircle2, Clock, XCircle, ChevronRight, ChevronLeft, RefreshCw } from 'lucide-react';
import { clsx } from 'clsx';
import type { BookingsResponse } from '@/dataHelper/dashboard.dataHelper';
import { Skeleton } from '@/components/ui/Skeleton';
import EmptyState from '@/components/common/EmptyState';

type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | '';

interface RecentOrdersTableProps {
    bookings: BookingsResponse | undefined;
    currentPage: number;
    onPageChange: (page: number) => void;
    statusFilter: BookingStatus;
    onStatusChange: (status: BookingStatus) => void;
    onRefresh?: () => void;
    isRefreshing?: boolean;
    isLoading?: boolean;
    isError?: boolean;
}

const STATUS_OPTIONS = [
    { value: '', labelKey: 'filters.all', color: 'bg-slate-100 text-slate-600' },
    { value: 'pending', labelKey: 'status.pending', color: 'bg-amber-50 text-amber-600 border-amber-100' },
    { value: 'confirmed', labelKey: 'status.confirmed', color: 'bg-blue-50 text-blue-600 border-blue-100' },
    { value: 'completed', labelKey: 'status.completed', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
    { value: 'cancelled', labelKey: 'status.cancelled', color: 'bg-red-50 text-red-500 border-red-100' },
];

const RecentOrdersTable = ({
    bookings,
    currentPage,
    onPageChange,
    statusFilter,
    onStatusChange,
    onRefresh,
    isRefreshing,
    isLoading,
    isError,
}: RecentOrdersTableProps) => {
    const { t } = useTranslation('dashboard');
    const orders = bookings?.data ?? [];
    const total = bookings?.meta?.total ?? 0;
    const lastPage = bookings?.meta?.last_page ?? 1;
    const perPage = bookings?.meta?.per_page ?? 8;
    const start = total === 0 ? 0 : (currentPage - 1) * perPage + 1;
    const end = Math.min(start + (orders.length > 0 ? orders.length - 1 : 0), total);
    const totalPages = Math.max(1, lastPage);

    const isEmpty = !isLoading && !isError && orders.length === 0;

    const STATUS_CONFIG: Record<string, { label: string; className: string; icon: ReactNode }> = {
        completed: { label: t('status.completed'), className: 'bg-emerald-50 text-emerald-600 border-emerald-100', icon: <CheckCircle2 size={13} /> },
        confirmed: { label: t('status.confirmed'), className: 'bg-blue-50 text-blue-600 border-blue-100', icon: <CheckCircle2 size={13} /> },
        pending:   { label: t('status.pending'),   className: 'bg-amber-50 text-amber-600 border-amber-100', icon: <Clock size={13} /> },
        cancelled: { label: t('status.cancelled'), className: 'bg-red-50 text-red-500 border-red-100', icon: <XCircle size={13} /> },
    };

    const AVATAR_COLORS = [
        'bg-blue-100 text-blue-600',
        'bg-sky-100 text-sky-600',
        'bg-emerald-100 text-emerald-600',
        'bg-cyan-100 text-cyan-600',
        'bg-orange-100 text-orange-600',
        'bg-rose-100 text-rose-600',
        'bg-teal-100 text-teal-600',
    ];

    return (
        <div className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-sm overflow-hidden flex flex-col">
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 group/card transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div>
                            <h3 className="text-base font-black text-slate-900 tracking-tighter">{t('tables.recent_orders')}</h3>
                            <p className="text-slate-400 text-[12px] font-bold">
                                {t('tables.subtitle_recent_orders', { 
                                    start, 
                                    end, 
                                    total: total.toLocaleString(i18n.language === 'vi' ? 'vi-VN' : 'en-US') 
                                })}
                            </p>
                        </div>
                        {onRefresh && (
                            <button 
                                onClick={(e) => { e.stopPropagation(); onRefresh(); }}
                                disabled={isRefreshing}
                                title={t('charts.refresh_chart')}
                                className={`p-2 rounded-xl bg-slate-50 hover:bg-blue-50 transition-all ${isRefreshing ? 'opacity-100 text-blue-600 cursor-not-allowed' : 'text-slate-400 hover:text-blue-600 active:scale-90 group-hover/card:opacity-100 opacity-0 lg:opacity-0'}`}
                            >
                                <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
                            </button>
                        )}
                    </div>
                    <button className="flex items-center gap-1 text-xs font-black text-blue-600 hover:underline">
                        {t('tables.view_all')} <ExternalLink size={12} />
                    </button>
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-2 flex-wrap">
                    {STATUS_OPTIONS.map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => onStatusChange(opt.value as BookingStatus)}
                            className={`px-3 py-1.5 rounded-xl text-[11px] font-black border transition-all ${
                                statusFilter === opt.value
                                    ? opt.color + ' ring-2 ring-offset-1 ring-blue-200'
                                    : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                            }`}
                        >
                            {t(opt.labelKey)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div className="max-w-full overflow-x-auto custom-scrollbar-horizontal min-h-[300px] relative">
                {isError ? (
                    <div className="flex flex-col items-center justify-center p-12 text-center h-full">
                        <p className="text-sm font-black text-red-500 uppercase tracking-widest mb-2">{t('error_states.title')}</p>
                        <p className="text-xs text-slate-400 mb-4 max-w-[280px]">{t('error_states.desc')}</p>
                        <button 
                            onClick={onRefresh}
                            className="bg-slate-900 text-white px-5 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-black transition-all active:scale-95 flex items-center gap-2"
                        >
                            <RefreshCw size={14} />
                            {t('retry')}
                        </button>
                    </div>
                ) : isEmpty ? (
                    <EmptyState 
                        title={t('empty_states.no_bookings')}
                        description={t('empty_states.no_data_desc')}
                        className="py-16"
                    />
                ) : (
                    <table className="w-full min-w-[980px] text-left">
                        <thead className="bg-slate-50/50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('tables.header_order_id')}</th>
                                <th className="px-6 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('tables.header_customer')}</th>
                                <th className="px-6 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('tables.header_tour')}</th>
                                <th className="px-6 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">{t('tables.header_amount')}</th>
                                <th className="px-6 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">{t('tables.header_status')}</th>
                                <th className="px-6 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('tables.header_date')}</th>
                                <th className="px-6 py-3.5 w-8"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {isLoading ? (
                                Array.from({ length: 8 }).map((_, i) => (
                                    <tr key={i}>
                                        <td className="px-6 py-4"><Skeleton className="w-16 h-4 rounded-md" /></td>
                                        <td className="px-6 py-4 flex gap-2.5">
                                            <Skeleton className="w-8 h-8 rounded-full" />
                                            <Skeleton className="w-24 h-4 rounded-md mt-2" />
                                        </td>
                                        <td className="px-6 py-4"><Skeleton className="w-32 h-4 rounded-md" /></td>
                                        <td className="px-6 py-4"><Skeleton className="w-20 h-4 rounded-md ml-auto" /></td>
                                        <td className="px-6 py-4"><Skeleton className="w-20 h-6 rounded-xl mx-auto" /></td>
                                        <td className="px-6 py-4"><Skeleton className="w-24 h-4 rounded-md" /></td>
                                        <td className="px-3 py-4 text-right"><Skeleton className="w-4 h-4 rounded-full ml-auto" /></td>
                                    </tr>
                                ))
                            ) : (
                                orders.map((item, idx) => {
                                    const statusCfg = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.pending;
                                    const avatarColor = AVATAR_COLORS[idx % AVATAR_COLORS.length];

                                    return (
                                        <tr key={item.id} className="hover:bg-slate-50/40 transition-colors group cursor-pointer">
                                            <td className="px-6 py-4">
                                                <span className="text-[12px] font-black text-slate-500 font-mono">{item.id}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2.5 min-w-[150px]">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-black border shrink-0 ${avatarColor}`}>
                                                        {item.customer.name.charAt(0)}
                                                    </div>
                                                    <span className="text-[13px] font-bold text-slate-800 line-clamp-1">{item.customer.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-[13px] font-bold text-slate-600 line-clamp-1 max-w-[180px] block">{item.tour_title}</span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="text-[13px] font-black text-slate-900">{item.total_amount.toLocaleString(i18n.language === 'vi' ? 'vi-VN' : 'en-US')} {t('charts.unit_currency')}</span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[11px] font-black ${statusCfg.className}`}>
                                                    {statusCfg.icon}
                                                    {statusCfg.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-[12px] font-bold text-slate-400 italic">{item.booked_at}</span>
                                            </td>
                                            <td className="px-3 py-4 text-right">
                                                <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Footer with Pagination */}
            {!isEmpty && !isError && (
                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/30">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-400">
                            {t('pagination.showing', { start, end, total })}
                        </span>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => onPageChange(currentPage - 1)}
                                disabled={currentPage <= 1 || isLoading}
                                className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronLeft size={14} />
                            </button>

                            <div className="flex items-center gap-1.5">
                                {Array.from({ length: totalPages }, (_, i) => i + 1)
                                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                                    .map((p, i, arr) => (
                                        <div key={p} className="flex items-center gap-1.5">
                                            {i > 0 && arr[i - 1] !== p - 1 && (
                                                <span className="text-slate-300">...</span>
                                            )}
                                            <button
                                                onClick={() => onPageChange(p)}
                                                disabled={isLoading}
                                                className={clsx(
                                                    'w-8 h-8 rounded-xl text-[11px] font-black transition-all',
                                                    p === currentPage
                                                        ? 'bg-blue-600 text-white shadow-sm'
                                                        : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 disabled:opacity-50'
                                                )}
                                            >
                                                {p}
                                            </button>
                                        </div>
                                    ))}
                            </div>

                            <button
                                onClick={() => onPageChange(currentPage + 1)}
                                disabled={currentPage >= totalPages || isLoading}
                                className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronRight size={14} />
                            </button>
                        </div>

                        <button className="text-[11px] font-black text-blue-600 flex items-center gap-1 hover:underline">
                            {t('tables.manage_orders')} <ExternalLink size={10} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default memo(RecentOrdersTable);
