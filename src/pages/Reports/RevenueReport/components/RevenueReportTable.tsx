import React from 'react';
import { Eye, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/Skeleton';
import EmptyState from '@/components/common/EmptyState';
import { useTranslation } from 'react-i18next';
import type { RevenueReportItemViewModel } from '@/dataHelper/report.dataHelper';

interface RevenueReportTableProps {
    data?: {
        items: RevenueReportItemViewModel[];
        pagination: {
            currentPage: number;
            lastPage: number;
            perPage: number;
            total: number;
        };
    };
    isLoading?: boolean;
    onPageChange: (page: number) => void;
}

const RevenueReportTable: React.FC<RevenueReportTableProps> = ({
    data,
    isLoading = false,
    onPageChange,
}) => {
    const { t } = useTranslation('revenue_report');

    const renderStatusBadge = (status: string) => {
        const lower = status.toLowerCase();
        if (lower === 'success' || lower === 'paid' || lower === 'thành công') {
            return (
                <span className="inline-flex items-center bg-emerald-50 text-emerald-600 font-extrabold text-[11px] px-2.5 py-1 rounded-full">
                    {t('table.status_paid')}
                </span>
            );
        } else if (lower === 'refunded' || lower === 'hoàn tiền') {
            return (
                <span className="inline-flex items-center bg-rose-50 text-rose-600 font-extrabold text-[11px] px-2.5 py-1 rounded-full">
                    {t('table.status_refunded')}
                </span>
            );
        } else if (lower === 'pending' || lower === 'đang xử lý') {
            return (
                <span className="inline-flex items-center bg-amber-50 text-amber-600 font-extrabold text-[11px] px-2.5 py-1 rounded-full animate-pulse">
                    {t('table.status_pending')}
                </span>
            );
        } else {
            return (
                <span className="inline-flex items-center bg-slate-50 text-slate-400 font-extrabold text-[11px] px-2.5 py-1 rounded-full">
                    {t('table.status_failed')}
                </span>
            );
        }
    };

    const renderGatewayBadge = (gateway: string) => {
        const lower = gateway.toLowerCase();
        let classes = 'bg-slate-50 text-slate-500 border border-slate-100';
        if (lower === 'momo') {
            classes = 'bg-[#D82D8F]/10 text-[#D82D8F] border border-[#D82D8F]/20';
        } else if (lower === 'vnpay') {
            classes = 'bg-blue-50 text-[#3A5A9F] border border-blue-100';
        } else if (lower === 'zalopay') {
            classes = 'bg-emerald-50 text-[#0084FF] border border-emerald-100';
        }

        return (
            <span className={`inline-flex items-center font-black text-[10px] px-2 py-0.5 rounded-md uppercase ${classes}`}>
                {gateway}
            </span>
        );
    };

    if (isLoading) {
        return (
            <div className="bg-white/80 backdrop-blur-md border border-slate-100 rounded-2xl overflow-hidden shadow-xs mb-6">
                <div className="px-6 py-5 border-b border-slate-50 flex justify-between items-center">
                    <Skeleton className="w-40 h-6" />
                    <Skeleton className="w-24 h-5" />
                </div>
                <div className="p-6">
                    <div className="space-y-4">
                        {[...Array(5)].map((_, idx) => (
                            <Skeleton key={idx} className="w-full h-12 rounded-xl" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!data || data.items.length === 0) {
        return (
            <div className="bg-white/80 backdrop-blur-md border border-slate-100 rounded-2xl p-8 shadow-xs mb-6">
                <EmptyState
                    title={t('table.no_data_title')}
                    description={t('table.no_data_desc')}
                />
            </div>
        );
    }

    const { items, pagination } = data;
    const startIndex = (pagination.currentPage - 1) * pagination.perPage + 1;
    const endIndex = Math.min(pagination.currentPage * pagination.perPage, pagination.total);

    return (
        <div className="bg-white/80 backdrop-blur-md border border-slate-100 rounded-2xl overflow-hidden shadow-xs mb-6">
            {/* Table Header */}
            <div className="px-6 py-5 border-b border-slate-50 flex flex-col sm:flex-row gap-3 justify-between sm:items-center bg-white/40">
                <div>
                    <h3 className="text-[15px] font-black text-slate-800 leading-tight">{t('table.title')}</h3>
                    <p className="text-[11px] font-bold text-slate-400 mt-1">{t('table.subtitle')}</p>
                </div>
                <div className="text-right">
                    <span className="text-xs font-black text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                        {t('table.total_count', { total: pagination.total.toLocaleString() })}
                    </span>
                </div>
            </div>

            {/* Table Wrapper */}
            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                            <th className="px-6 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[140px]">
                                {t('table.header_tx_code')}
                            </th>
                            <th className="px-6 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[140px]">
                                {t('table.header_booking_code')}
                            </th>
                            <th className="px-6 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                {t('table.header_customer')}
                            </th>
                            <th className="px-6 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                {t('table.header_tour')}
                            </th>
                            <th className="px-6 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[150px]">
                                {t('table.header_amount')}
                            </th>
                            <th className="px-6 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[130px]">
                                {t('table.header_gateway')}
                            </th>
                            <th className="px-6 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[130px]">
                                {t('table.header_date')}
                            </th>
                            <th className="px-6 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[110px]">
                                {t('table.header_status')}
                            </th>
                            <th className="px-6 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[80px] text-right">
                                Detail
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {items.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-50/40 transition-colors group/row">
                                {/* 1. Transaction Code */}
                                <td className="px-6 py-4">
                                    <span className="text-[12px] font-black text-slate-800 select-all leading-none font-mono">
                                        {item.transactionCode || 'N/A'}
                                    </span>
                                </td>

                                {/* 2. Booking Code */}
                                <td className="px-6 py-4">
                                    {item.bookingId ? (
                                        <Link
                                            to={`/admin/bookings/${item.bookingId}`}
                                            className="text-[13px] font-black text-emerald-500 hover:underline inline-flex items-center gap-1 leading-none"
                                        >
                                            #{item.bookingCode}
                                            <ExternalLink size={10} className="opacity-0 group-hover/row:opacity-100 transition-opacity" />
                                        </Link>
                                    ) : (
                                        <span className="text-[13px] font-bold text-slate-400">N/A</span>
                                    )}
                                </td>

                                {/* 3. Customer */}
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2.5">
                                        {item.customerAvatar ? (
                                            <img
                                                src={item.customerAvatar}
                                                alt={item.customerName}
                                                className="w-7 h-7 rounded-full object-cover border border-slate-100"
                                            />
                                        ) : (
                                            <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                                                {item.customerName.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <span className="text-[13px] font-bold text-slate-800 line-clamp-1 max-w-[140px]" title={item.customerName}>
                                            {item.customerName}
                                        </span>
                                    </div>
                                </td>

                                {/* 4. Tour Name */}
                                <td className="px-6 py-4">
                                    <span className="text-[13px] font-bold text-slate-700 line-clamp-1 max-w-[200px]" title={item.tourName}>
                                        {item.tourName}
                                    </span>
                                </td>

                                {/* 5. Amount */}
                                <td className="px-6 py-4">
                                    <span className="text-[13px] font-extrabold text-slate-900">
                                        {item.amount.toLocaleString()} <span className="text-[10px] font-bold text-slate-400">đ</span>
                                    </span>
                                </td>

                                {/* 6. Gateway */}
                                <td className="px-6 py-4">
                                    {renderGatewayBadge(item.gateway)}
                                </td>

                                {/* 7. Date & Time */}
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="text-[12px] font-bold text-slate-700 leading-none">{item.date}</span>
                                        <span className="text-[10px] font-semibold text-slate-400 mt-1 leading-none">{item.time}</span>
                                    </div>
                                </td>

                                {/* 8. Status */}
                                <td className="px-6 py-4">
                                    {renderStatusBadge(item.status)}
                                </td>

                                {/* 9. Quick Link to Booking Detail */}
                                <td className="px-6 py-4 text-right">
                                    {item.bookingId ? (
                                        <Link
                                            to={`/admin/bookings/${item.bookingId}`}
                                            className="p-1.5 inline-flex rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
                                            title="View Booking Detail"
                                        >
                                            <Eye size={15} />
                                        </Link>
                                    ) : (
                                        <span className="text-slate-300">-</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50">
                <span className="text-[12px] font-bold text-slate-500">
                    {t('table.pagination_showing', {
                        from: startIndex,
                        to: endIndex,
                        total: pagination.total.toLocaleString()
                    })}
                </span>

                <div className="flex gap-1.5 items-center">
                    <button
                        type="button"
                        onClick={() => onPageChange(pagination.currentPage - 1)}
                        disabled={pagination.currentPage <= 1}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-bold border border-slate-100 bg-white text-slate-600 hover:bg-slate-50 active:scale-95 disabled:opacity-50 disabled:active:scale-100 transition-all cursor-pointer select-none"
                    >
                        {t('table.btn_prev')}
                    </button>

                    {/* Numeric Buttons */}
                    {[...Array(Math.min(5, pagination.lastPage))].map((_, i) => {
                        let pageNum = 1;
                        if (pagination.currentPage <= 3) {
                            pageNum = i + 1;
                        } else if (pagination.currentPage >= pagination.lastPage - 2) {
                            pageNum = Math.max(1, pagination.lastPage - 4 + i);
                        } else {
                            pageNum = pagination.currentPage - 2 + i;
                        }

                        if (pageNum > pagination.lastPage) return null;

                        const isActive = pageNum === pagination.currentPage;

                        return (
                            <button
                                key={pageNum}
                                type="button"
                                onClick={() => onPageChange(pageNum)}
                                className={`w-8 h-8 rounded-lg text-xs font-black transition-all flex items-center justify-center cursor-pointer select-none ${
                                    isActive
                                        ? 'bg-emerald-500 text-white shadow-xs'
                                        : 'bg-white border border-slate-100 text-slate-600 hover:bg-slate-50'
                                }`}
                            >
                                {pageNum}
                            </button>
                        );
                    })}

                    <button
                        type="button"
                        onClick={() => onPageChange(pagination.currentPage + 1)}
                        disabled={pagination.currentPage >= pagination.lastPage}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-bold border border-slate-100 bg-white text-slate-600 hover:bg-slate-50 active:scale-95 disabled:opacity-50 disabled:active:scale-100 transition-all cursor-pointer select-none"
                    >
                        {t('table.btn_next')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RevenueReportTable;
