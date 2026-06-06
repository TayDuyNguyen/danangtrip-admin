import React from 'react';
import { Eye, ExternalLink, RefreshCw, CalendarX } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '@/routes/routes';
import type { BookingsReportItemViewModel } from '@/dataHelper/report.dataHelper';

interface BookingsReportTableProps {
    data?: {
        items: BookingsReportItemViewModel[];
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

const BookingsReportTable: React.FC<BookingsReportTableProps> = ({
    data,
    isLoading = false,
    onPageChange,
}) => {
    const { t } = useTranslation('bookings_report');

    const pagination = data?.pagination;
    const items = data?.items ?? [];
    const startIndex = pagination ? (pagination.currentPage - 1) * pagination.perPage + 1 : 0;
    const endIndex = pagination ? Math.min(pagination.currentPage * pagination.perPage, pagination.total) : 0;

    const renderStatusBadge = (status: BookingsReportItemViewModel['status']) => {
        switch (status) {
            case 'completed': return <span className="inline-flex items-center bg-emerald-50 text-emerald-600 font-extrabold text-[11px] px-2.5 py-1 rounded-full">{t('table.status_completed')}</span>;
            case 'confirmed': return <span className="inline-flex items-center bg-blue-50 text-blue-600 font-extrabold text-[11px] px-2.5 py-1 rounded-full">{t('table.status_confirmed')}</span>;
            case 'cancelled': return <span className="inline-flex items-center bg-rose-50 text-rose-600 font-extrabold text-[11px] px-2.5 py-1 rounded-full">{t('table.status_cancelled')}</span>;
            case 'pending': default: return <span className="inline-flex items-center bg-amber-50 text-amber-600 font-extrabold text-[11px] px-2.5 py-1 rounded-full animate-pulse">{t('table.status_pending')}</span>;
        }
    };

    const renderPaymentStatusBadge = (paymentStatus: BookingsReportItemViewModel['paymentStatus']) => {
        switch (paymentStatus) {
            case 'paid': return <span className="inline-flex items-center bg-emerald-50 text-emerald-600 font-extrabold text-[11px] px-2.5 py-1 rounded-full">{t('table.payment_paid')}</span>;
            case 'refunded': return <span className="inline-flex items-center bg-purple-50 text-purple-600 font-extrabold text-[11px] px-2.5 py-1 rounded-full">{t('table.payment_refunded')}</span>;
            case 'pending': default: return <span className="inline-flex items-center bg-amber-50 text-amber-600 font-extrabold text-[11px] px-2.5 py-1 rounded-full">{t('table.payment_pending')}</span>;
        }
    };

    return (
        <div className="bg-white border border-[#E2E8F0] rounded-[16px] shadow-sm overflow-hidden flex flex-col group/card min-w-0 mb-6">
            {/* Toolbar */}
            <div className="px-[24px] py-[16px] border-b border-[#E2E8F0] flex flex-col sm:flex-row gap-3 justify-between sm:items-center bg-[#F8FAFC]/50 shrink-0">
                <div>
                    <h3 className="text-[15px] font-black text-[#0F172A] leading-tight">{t('table.title')}</h3>
                    <p className="text-[11px] font-bold text-[#94A3B8] mt-1">{t('table.subtitle')}</p>
                </div>
                {pagination && pagination.total > 0 && (
                    <span className="text-xs font-black text-[#0F172A]/85 bg-[#F8FAFC] px-3 py-1.5 rounded-lg border border-[#E2E8F0]">
                        {t('table.total_count', { total: pagination.total.toLocaleString() })}
                    </span>
                )}
            </div>

            {/* Table */}
            <div className="overflow-x-auto flex-1">
                <table className="w-full border-collapse text-left">
                    <thead>
                        <tr className="bg-[#F8FAFC]/60 border-b border-[#E2E8F0]">
                            <th className="px-6 py-3.5 text-[10px] font-black text-[#94A3B8] uppercase tracking-widest w-[120px]">{t('table.header_code')}</th>
                            <th className="px-6 py-3.5 text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">{t('table.header_customer')}</th>
                            <th className="px-6 py-3.5 text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">{t('table.header_tour')}</th>
                            <th className="px-6 py-3.5 text-[10px] font-black text-[#94A3B8] uppercase tracking-widest w-[140px]">{t('table.header_amount')}</th>
                            <th className="px-6 py-3.5 text-[10px] font-black text-[#94A3B8] uppercase tracking-widest w-[120px]">{t('table.header_status')}</th>
                            <th className="px-6 py-3.5 text-[10px] font-black text-[#94A3B8] uppercase tracking-widest w-[130px]">{t('table.header_payment')}</th>
                            <th className="px-6 py-3.5 text-[10px] font-black text-[#94A3B8] uppercase tracking-widest w-[110px]">{t('table.header_date')}</th>
                            <th className="px-6 py-3.5 text-[10px] font-black text-[#94A3B8] uppercase tracking-widest w-[80px] text-right">{t('table.header_detail')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F1F5F9]">
                        {isLoading ? (
                            <tr>
                                <td colSpan={8} className="py-16 text-center">
                                    <div className="flex flex-col items-center justify-center gap-3">
                                        <RefreshCw size={24} className="animate-spin text-[#14b8a6]" />
                                        <span className="text-sm font-bold text-slate-400">Đang tải dữ liệu...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : items.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="py-16 text-center">
                                    <div className="flex flex-col items-center justify-center gap-3">
                                        <CalendarX size={32} className="text-slate-200" />
                                        <p className="text-sm font-black text-slate-500">{t('table.no_data_title')}</p>
                                        <p className="text-xs font-bold text-slate-400 max-w-sm">{t('table.no_data_desc')}</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            items.map((item) => (
                                <tr key={item.id} className="hover:bg-[#14b8a6]/5 transition-colors group/row">
                                    <td className="px-6 py-4">
                                        {item.id > 0 ? (
                                            <Link to={ROUTES.BOOKINGS_DETAIL.replace(':id', String(item.id))} className="text-[13px] font-black text-[#14b8a6] hover:underline flex items-center gap-1">
                                                #{item.bookingCode}
                                                <ExternalLink size={11} className="opacity-0 group-hover/row:opacity-100 transition-opacity" />
                                            </Link>
                                        ) : (
                                            <span className="text-[13px] font-black text-[#14b8a6]">{item.bookingCode}</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-[13px] font-bold text-[#0F172A]" title={item.customerName}>{item.customerName}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-[13px] font-bold text-[#0F172A]/90 line-clamp-1 max-w-[220px]" title={item.tourName}>{item.tourName}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-[13px] font-extrabold text-[#0F172A]">
                                            {item.totalAmount.toLocaleString()} <span className="text-[10px] font-bold text-[#94A3B8]">đ</span>
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">{renderStatusBadge(item.status)}</td>
                                    <td className="px-6 py-4">{renderPaymentStatusBadge(item.paymentStatus)}</td>
                                    <td className="px-6 py-4">
                                        <span className="text-[12px] font-bold text-[#0F172A]/90 whitespace-nowrap">
                                            {item.bookedAtTime ? `${item.bookedAtTime} ${item.bookedAt}` : item.bookedAt}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {item.id > 0 ? (
                                            <Link to={ROUTES.BOOKINGS_DETAIL.replace(':id', String(item.id))} className="p-1.5 inline-flex rounded-lg text-[#94A3B8] hover:text-[#14b8a6] hover:bg-[#14b8a6]/10 transition-all cursor-pointer" title={t('table.tooltip_detail')}>
                                                <Eye size={15} />
                                            </Link>
                                        ) : (
                                            <span className="p-1.5 inline-flex rounded-lg text-[#CBD5E1]"><Eye size={15} /></span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Footer */}
            {!isLoading && pagination && pagination.total > 0 && (
                <div className="px-[24px] py-[16px] border-t border-[#E2E8F0] flex flex-col sm:flex-row gap-4 justify-between items-center bg-[#F8FAFC]/50 shrink-0">
                    <span className="text-[12px] font-bold text-[#94A3B8]">
                        {t('table.pagination_showing', { from: startIndex, to: endIndex, total: pagination.total.toLocaleString() })}
                    </span>
                    <div className="flex gap-1.5 items-center">
                        <button type="button" onClick={() => onPageChange(pagination.currentPage - 1)} disabled={pagination.currentPage <= 1}
                            className="px-3.5 py-1.5 rounded-lg text-xs font-bold border border-[#E2E8F0] bg-white text-slate-600 hover:border-[#14b8a6] hover:text-[#14b8a6] hover:bg-[#14b8a6]/5 active:scale-95 disabled:opacity-50 disabled:active:scale-100 transition-all duration-150 cursor-pointer select-none">
                            {t('table.btn_prev')}
                        </button>
                        {[...Array(Math.min(5, pagination.lastPage))].map((_, i) => {
                            let pageNum = 1;
                            if (pagination.currentPage <= 3) pageNum = i + 1;
                            else if (pagination.currentPage >= pagination.lastPage - 2) pageNum = Math.max(1, pagination.lastPage - 4 + i);
                            else pageNum = pagination.currentPage - 2 + i;
                            if (pageNum > pagination.lastPage) return null;
                            const isActive = pageNum === pagination.currentPage;
                            return (
                                <button key={pageNum} type="button" onClick={() => onPageChange(pageNum)}
                                    className={`w-8 h-8 rounded-lg text-xs font-black transition-all flex items-center justify-center cursor-pointer select-none ${isActive ? 'bg-[#14b8a6] text-white shadow-xs' : 'bg-white border border-[#E2E8F0] text-slate-600 hover:border-[#14b8a6] hover:text-[#14b8a6] hover:bg-[#14b8a6]/5'}`}>
                                    {pageNum}
                                </button>
                            );
                        })}
                        <button type="button" onClick={() => onPageChange(pagination.currentPage + 1)} disabled={pagination.currentPage >= pagination.lastPage}
                            className="px-3.5 py-1.5 rounded-lg text-xs font-bold border border-[#E2E8F0] bg-white text-slate-600 hover:border-[#14b8a6] hover:text-[#14b8a6] hover:bg-[#14b8a6]/5 active:scale-95 disabled:opacity-50 disabled:active:scale-100 transition-all duration-150 cursor-pointer select-none">
                            {t('table.btn_next')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookingsReportTable;
