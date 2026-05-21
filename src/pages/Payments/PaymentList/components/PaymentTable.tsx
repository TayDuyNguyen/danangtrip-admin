import { useAuth } from "@/store";
import { useTranslation } from "react-i18next";
import type { PaymentItem } from "@/dataHelper";
import PaymentStatusBadge from "./PaymentStatusBadge";
import PaymentGatewayBadge from "./PaymentGatewayBadge";
import { Link } from "react-router-dom";
import { ROUTES } from "@/routes/routes";
import { RefreshCw, ExternalLink, HelpCircle, ChevronLeft, ChevronRight } from "lucide-react";
import clsx from "clsx";

interface PaymentTableProps {
    payments: PaymentItem[];
    isLoading?: boolean;
    meta?: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    onPageChange: (page: number) => void;
    onRefundClick: (payment: PaymentItem) => void;
}

export const PaymentTable = ({
    payments,
    isLoading,
    meta,
    onPageChange,
    onRefundClick,
}: PaymentTableProps) => {
    const { user } = useAuth();
    const { t } = useTranslation("payment");
    const isAdmin = user?.role === "admin";

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(val);
    };

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return new Intl.DateTimeFormat("vi-VN", {
                dateStyle: "medium",
                timeStyle: "short",
            }).format(date);
        } catch {
            return dateString;
        }
    };

    if (isLoading) {
        return (
            <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-xs">
                <div className="p-6 space-y-4">
                    <div className="h-6 bg-slate-100 rounded-md w-1/4 animate-pulse"></div>
                    <div className="space-y-3">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="flex gap-4 items-center">
                                <div className="h-10 bg-slate-100 rounded-md flex-1 animate-pulse"></div>
                                <div className="h-10 bg-slate-100 rounded-md w-24 animate-pulse"></div>
                                <div className="h-10 bg-slate-100 rounded-md w-20 animate-pulse"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!payments.length) {
        return (
            <div className="bg-white border border-slate-100 rounded-2xl p-16 flex flex-col items-center justify-center text-center shadow-xs">
                <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 mb-4 animate-bounce">
                    <HelpCircle size={28} />
                </div>
                <h3 className="text-slate-900 text-lg font-bold">{t("table.empty_title", "Không tìm thấy giao dịch")}</h3>
                <p className="text-slate-400 text-sm mt-1 max-w-sm">
                    {t("table.empty_desc", "Không có dữ liệu giao dịch nào khớp với bộ lọc hiện tại của bạn.")}
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-xs">
            {/* Responsive Table Wrapper */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-wider">
                            <th className="py-4 px-6">{t("table.transaction_code", "Mã Giao dịch")}</th>
                            <th className="py-4 px-6">{t("table.booking_code", "Đơn hàng")}</th>
                            <th className="py-4 px-6">{t("table.customer", "Khách hàng")}</th>
                            <th className="py-4 px-6">{t("table.amount", "Số tiền")}</th>
                            <th className="py-4 px-6">{t("table.gateway", "Cổng thanh toán")}</th>
                            <th className="py-4 px-6">{t("table.status", "Trạng thái")}</th>
                            <th className="py-4 px-6">{t("table.date", "Thời gian")}</th>
                            <th className="py-4 px-6 text-right">{t("table.actions", "Hành động")}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-600">
                        {payments.map((payment) => {
                            const isSuccess = payment.status === "success";
                            const showRefundAction = isSuccess;

                            return (
                                <tr
                                    key={payment.id}
                                    className="hover:bg-slate-50/50 transition-colors duration-150"
                                >
                                    {/* Transaction Code */}
                                    <td className="py-4 px-6">
                                        <Link
                                            to={ROUTES.PAYMENTS_DETAIL.replace(':id', String(payment.id))}
                                            className="text-slate-900 font-bold tracking-tight hover:text-[#14B8A6] transition-colors"
                                        >
                                            {payment.transactionCode}
                                        </Link>
                                    </td>

                                    {/* Booking Code Link */}
                                    <td className="py-4 px-6">
                                        {payment.bookingCode && payment.bookingId ? (
                                            <Link
                                                to={ROUTES.BOOKINGS_DETAIL.replace(':id', String(payment.bookingId))}
                                                className="inline-flex items-center gap-1 text-[#14B8A6] hover:text-[#0f766e] font-bold group"
                                            >
                                                <span>{payment.bookingCode}</span>
                                                <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </Link>
                                        ) : payment.bookingCode ? (
                                            <span className="text-slate-900 font-bold">{payment.bookingCode}</span>
                                        ) : (
                                            <span className="text-slate-400">—</span>
                                        )}
                                    </td>

                                    {/* Customer info */}
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 font-bold shrink-0 overflow-hidden">
                                                {payment.customerAvatar ? (
                                                    <img
                                                        src={payment.customerAvatar}
                                                        alt={payment.customerName}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    payment.customerName.charAt(0).toUpperCase()
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-slate-900 font-bold truncate max-w-[150px]">
                                                    {payment.customerName}
                                                </p>
                                                <p className="text-slate-400 text-xs truncate max-w-[150px]">
                                                    {payment.customerEmail}
                                                </p>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Amount */}
                                    <td className="py-4 px-6">
                                        <span className="text-slate-950 font-black">
                                            {formatCurrency(payment.amount)}
                                        </span>
                                    </td>

                                    {/* Gateway */}
                                    <td className="py-4 px-6">
                                        <PaymentGatewayBadge gateway={payment.gateway} />
                                    </td>

                                    {/* Status */}
                                    <td className="py-4 px-6">
                                        <PaymentStatusBadge status={payment.status} />
                                    </td>

                                    {/* Date */}
                                    <td className="py-4 px-6 text-xs text-slate-400">
                                        {formatDate(payment.transactionDate)}
                                    </td>

                                    {/* Actions */}
                                    <td className="py-4 px-6 text-right">
                                        <div className="flex justify-end items-center gap-2">
                                            <Link
                                                to={ROUTES.PAYMENTS_DETAIL.replace(':id', String(payment.id))}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all duration-200 shadow-xs"
                                            >
                                                <span>{t("action.detail", "Chi tiết")}</span>
                                            </Link>

                                            {showRefundAction && (
                                                <div className="relative inline-block group/btn">
                                                    <button
                                                        onClick={() => onRefundClick(payment)}
                                                        disabled={!isAdmin}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-rose-50 border border-rose-100 text-rose-600 disabled:opacity-50 disabled:bg-slate-50 disabled:border-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed hover:bg-rose-600 hover:text-white transition-all duration-200 shadow-xs shadow-rose-100/50 hover:shadow-lg hover:shadow-rose-500/20"
                                                    >
                                                        <RefreshCw size={12} />
                                                        <span>{t("action.refund", "Hoàn tiền")}</span>
                                                    </button>

                                                    {/* Tooltip for Staff */}
                                                    {!isAdmin && (
                                                        <div className="absolute right-0 bottom-full mb-2 w-48 hidden group-hover/btn:block bg-slate-900/95 backdrop-blur-xs text-white text-[10px] font-bold py-1.5 px-3 rounded-lg shadow-xl leading-normal text-center z-50">
                                                            {t("action.refund_tooltip_staff", "Chỉ người quản trị mới có quyền thực hiện hoàn tiền")}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {meta && meta.last_page > 0 && (
                <div className="px-6 py-4 border-t border-[#E2E8F0] bg-surface flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-[13px] font-medium text-[#64748B] font-sans">
                        {t('common:pagination.showing_summary', {
                            start: meta.total > 0 ? (meta.current_page - 1) * meta.per_page + 1 : 0,
                            end: Math.min(meta.current_page * meta.per_page, meta.total),
                            total: meta.total,
                        })}
                    </div>
                    <div className="flex items-center gap-1.5">
                        <button
                            type="button"
                            onClick={() => onPageChange(meta.current_page - 1)}
                            disabled={meta.current_page === 1}
                            className="w-[32px] h-[32px] flex items-center justify-center rounded-md bg-white border border-[#E2E8F0] text-[#64748B] hover:border-[#14b8a6] hover:text-[#14b8a6] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 shadow-sm active:scale-90"
                        >
                            <ChevronLeft size={16} />
                        </button>

                        <div className="flex items-center gap-1.5">
                            {Array.from({ length: meta.last_page }, (_, i) => i + 1)
                                .filter(p => p === 1 || p === meta.last_page || Math.abs(p - meta.current_page) <= 1)
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
                                                p === meta.current_page
                                                    ? 'bg-[#14b8a6] text-white border-[#14b8a6]'
                                                    : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:border-[#14b8a6] hover:text-[#14b8a6] active:scale-95',
                                            )}
                                        >
                                            {p}
                                        </button>
                                    </div>
                                ))}
                        </div>

                        <button
                            type="button"
                            onClick={() => onPageChange(meta.current_page + 1)}
                            disabled={meta.current_page >= meta.last_page}
                            className="w-[32px] h-[32px] flex items-center justify-center rounded-md bg-white border border-[#E2E8F0] text-[#64748B] hover:border-[#14b8a6] hover:text-[#14b8a6] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 shadow-sm active:scale-90"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentTable;
