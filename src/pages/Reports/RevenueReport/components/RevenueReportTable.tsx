import React from 'react';
import { Eye, ExternalLink, RefreshCw, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '@/routes/routes';
import type { RevenueReportItemViewModel } from '@/dataHelper/report.dataHelper';
import ReportPerPageSelector from '../../shared/ReportPerPageSelector';

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
    onPerPageChange?: (perPage: number) => void;
}

const RevenueReportTable: React.FC<RevenueReportTableProps> = ({
    data,
    isLoading = false,
    onPageChange,
    onPerPageChange,
}) => {
    const { t } = useTranslation('revenue_report');

    const pagination = data?.pagination;
    const items = data?.items ?? [];
    const startIndex = pagination ? (pagination.currentPage - 1) * pagination.perPage + 1 : 0;
    const endIndex = pagination ? Math.min(pagination.currentPage * pagination.perPage, pagination.total) : 0;

    const renderStatusBadge = (status: string) => {
        const lower = status.toLowerCase();
        if (lower === 'success' || lower === 'paid' || lower === 'thành công')
            return <span className="inline-flex items-center bg-emerald-50 text-emerald-600 font-extrabold text-[11px] px-2.5 py-1 rounded-full">{t('table.status_paid')}</span>;
        if (lower === 'refunded' || lower === 'hoàn tiền')
            return <span className="inline-flex items-center bg-rose-50 text-rose-600 font-extrabold text-[11px] px-2.5 py-1 rounded-full">{t('table.status_refunded')}</span>;
        if (lower === 'pending' || lower === 'đang xử lý')
            return <span className="inline-flex items-center bg-amber-50 text-amber-600 font-extrabold text-[11px] px-2.5 py-1 rounded-full animate-pulse">{t('table.status_pending')}</span>;
        return <span className="inline-flex items-center bg-slate-50 text-slate-400 font-extrabold text-[11px] px-2.5 py-1 rounded-full">{t('table.status_failed')}</span>;
    };

    const renderGatewayBadge = (gateway: string) => {
        const lower = gateway.toLowerCase();
        let classes = 'bg-slate-50 text-slate-500 border border-slate-100';
        if (lower === 'momo') classes = 'bg-[#D82D8F]/10 text-[#D82D8F] border border-[#D82D8F]/20';
        else if (lower === 'vnpay') classes = 'bg-blue-50 text-[#3A5A9F] border border-blue-100';
        else if (lower === 'zalopay') classes = 'bg-emerald-50 text-[#0084FF] border border-emerald-100';
        return <span className={`inline-flex items-center font-black text-[10px] px-2 py-0.5 rounded-md uppercase ${classes}`}>{gateway}</span>;
    };

    return (
        <div className="bg-white border border-[#E2E8F0] rounded-[16px] shadow-sm overflow-hidden flex flex-col group/card min-w-0 mb-6">
            {/* Toolbar */}
            <div className="px-[24px] py-[16px] border-b border-[#E2E8F0] flex flex-col sm:flex-row gap-3 justify-between sm:items-center bg-[#F8FAFC]/50 shrink-0">
                <div>
                    <h3 className="text-[15px] font-black text-slate-800 leading-tight">{t('table.title')}</h3>
                    <p className="text-[11px] font-bold text-slate-400 mt-1">{t('table.subtitle')}</p>
                </div>
                {pagination && pagination.total > 0 && (
                    <span className="text-xs font-black text-slate-600 bg-[#F8FAFC] px-3 py-1.5 rounded-lg border border-[#E2E8F0]">
                        {t('table.total_count', { total: pagination.total.toLocaleString() })}
                    </span>
                )}
            </div>

            {/* Table */}
            <div className="overflow-x-auto flex-1">
                <table className="w-full border-collapse text-left">
                    <thead>
                        <tr className="bg-[#F8FAFC]/60 border-b border-[#E2E8F0]">
                            <th className="px-6 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[140px]">{t('table.header_tx_code')}</th>
                            <th className="px-6 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[140px]">{t('table.header_booking_code')}</th>
                            <th className="px-6 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('table.header_customer')}</th>
                            <th className="px-6 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('table.header_tour')}</th>
                            <th className="px-6 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[150px]">{t('table.header_amount')}</th>
                            <th className="px-6 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[130px]">{t('table.header_gateway')}</th>
                            <th className="px-6 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[130px]">{t('table.header_date')}</th>
                            <th className="px-6 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[110px]">{t('table.header_status')}</th>
                            <th className="px-6 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[80px] text-right">Detail</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {isLoading ? (
                            <tr>
                                <td colSpan={9} className="py-16 text-center">
                                    <div className="flex flex-col items-center justify-center gap-3">
                                        <RefreshCw size={24} className="animate-spin text-[#14b8a6]" />
                                        <span className="text-sm font-bold text-slate-400">Đang tải dữ liệu...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : items.length === 0 ? (
                            <tr>
                                <td colSpan={9} className="py-16 text-center">
                                    <div className="flex flex-col items-center justify-center gap-3">
                                        <CreditCard size={32} className="text-slate-200" />
                                        <p className="text-sm font-black text-slate-500">{t('table.no_data_title')}</p>
                                        <p className="text-xs font-bold text-slate-400 max-w-sm">{t('table.no_data_desc')}</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            items.map((item) => (
                                <tr key={item.id} className="hover:bg-[#14b8a6]/3 hover:text-slate-900 transition-colors duration-200 group/row">
                                    <td className="px-6 py-4">
                                        <span className="text-[12px] font-black text-slate-800 select-all leading-none font-mono">{item.transactionCode || 'N/A'}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {item.bookingId ? (
                                            <Link to={ROUTES.BOOKINGS_DETAIL.replace(':id', String(item.bookingId))} className="text-[13px] font-black text-[#14b8a6] hover:underline inline-flex items-center gap-1 leading-none">
                                                #{item.bookingCode}
                                                <ExternalLink size={10} className="opacity-0 group-hover/row:opacity-100 transition-opacity" />
                                            </Link>
                                        ) : (
                                            <span className="text-[13px] font-bold text-slate-400">N/A</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2.5">
                                            {item.customerAvatar ? (
                                                <img src={item.customerAvatar} alt={item.customerName} className="w-7 h-7 rounded-full object-cover border border-slate-100" />
                                            ) : (
                                                <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                                                    {item.customerName.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <span className="text-[13px] font-bold text-slate-800 line-clamp-1 max-w-[140px]" title={item.customerName}>{item.customerName}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-[13px] font-bold text-slate-700 line-clamp-1 max-w-[200px]" title={item.tourName}>{item.tourName}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-[13px] font-extrabold text-slate-900">
                                            {item.amount.toLocaleString()} <span className="text-[10px] font-bold text-slate-400">đ</span>
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">{renderGatewayBadge(item.gateway)}</td>
                                    <td className="px-6 py-4">
                                        <span className="text-[12px] font-bold text-slate-700 leading-none whitespace-nowrap">
                                            {item.time ? `${item.time} ${item.date}` : item.date}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">{renderStatusBadge(item.status)}</td>
                                    <td className="px-6 py-4 text-right">
                                        {item.bookingId ? (
                                            <Link to={ROUTES.BOOKINGS_DETAIL.replace(':id', String(item.bookingId))} className="p-1.5 inline-flex rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer" title="View Booking Detail">
                                                <Eye size={15} />
                                            </Link>
                                        ) : (
                                            <span className="text-slate-300">-</span>
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
                <div className="px-[24px] py-[16px] border-t border-[#E2E8F0] flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50 shrink-0">
                    <div className="flex flex-col sm:flex-row gap-3 items-center">
                        <span className="text-[12px] font-bold text-slate-500">
                            {t('table.pagination_showing', { from: startIndex, to: endIndex, total: pagination.total.toLocaleString() })}
                        </span>
                        {onPerPageChange && (
                            <ReportPerPageSelector
                                value={pagination.perPage}
                                onChange={onPerPageChange}
                                testId="revenue-report-per-page"
                            />
                        )}
                    </div>
                    <div className="flex gap-1.5 items-center">
                        <button type="button" onClick={() => onPageChange(pagination.currentPage - 1)} disabled={pagination.currentPage <= 1}
                            className="px-3.5 py-1.5 rounded-lg text-xs font-bold border border-slate-100 bg-white text-slate-600 hover:bg-[#14b8a6]/5 hover:text-[#14b8a6] hover:border-[#14b8a6]/20 active:scale-95 disabled:opacity-50 disabled:active:scale-100 transition-all cursor-pointer select-none">
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
                                    className={`w-8 h-8 rounded-lg text-xs font-black transition-all flex items-center justify-center cursor-pointer select-none ${isActive ? 'bg-[#14b8a6] text-white shadow-xs' : 'bg-white border border-slate-100 text-slate-600 hover:bg-[#14b8a6]/5 hover:text-[#14b8a6] hover:border-[#14b8a6]/20'}`}>
                                    {pageNum}
                                </button>
                            );
                        })}
                        <button type="button" onClick={() => onPageChange(pagination.currentPage + 1)} disabled={pagination.currentPage >= pagination.lastPage}
                            className="px-3.5 py-1.5 rounded-lg text-xs font-bold border border-slate-100 bg-white text-slate-600 hover:bg-[#14b8a6]/5 hover:text-[#14b8a6] hover:border-[#14b8a6]/20 active:scale-95 disabled:opacity-50 disabled:active:scale-100 transition-all cursor-pointer select-none">
                            {t('table.btn_next')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RevenueReportTable;
