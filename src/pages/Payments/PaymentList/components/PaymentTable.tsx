import { useAuth } from "@/store";
import { useTranslation } from "react-i18next";
import type { PaymentItem } from "@/dataHelper";
import PaymentStatusBadge from "./PaymentStatusBadge";
import PaymentGatewayBadge from "./PaymentGatewayBadge";
import { Link } from "react-router-dom";
import { ROUTES } from "@/routes/routes";
import { RefreshCw, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import clsx from "clsx";
import LoadingReact from "@/components/loading";
import CustomSelect, { type Option } from "@/components/ui/CustomSelect";
import { formatAdminTableDateTime } from "@/utils";

interface PaymentTableProps {
    payments: PaymentItem[];
    isLoading?: boolean;
    isRefreshing?: boolean;
    page: number;
    limit: number;
    total: number;
    onPageChange: (page: number) => void;
    onLimitChange: (limit: number) => void;
    onRefresh?: () => void;
    onRefundClick: (payment: PaymentItem) => void;
}

export const PaymentTable = ({
    payments,
    isLoading,
    isRefreshing,
    page,
    limit,
    total,
    onPageChange,
    onLimitChange,
    onRefresh,
    onRefundClick,
}: PaymentTableProps) => {
    const { user } = useAuth();
    const { t } = useTranslation(["payment", "tour", "common"]);
    const isAdmin = user?.role === "admin";
    const lastPage = Math.max(1, Math.ceil(total / limit));

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(val);
    };

    return (
        <div className="bg-white border border-[#E2E8F0] rounded-[16px] shadow-sm overflow-hidden flex flex-col group/card min-w-0">
            {/* Table Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-center px-[24px] py-[16px] border-b border-[#E2E8F0] gap-4">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="flex items-center gap-2">
                        <h2 className="text-[14px] font-bold text-[#1E293B] uppercase tracking-wider">
                            {t("title", "Danh sách Giao dịch")}
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
                                aria-label={t("common:actions.refresh", "Làm mới")}
                                title={t("common:actions.refresh", "Làm mới")}
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

            {/* Responsive Table Wrapper */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                    <thead>
                        <tr className="bg-surface border-b border-[#E2E8F0] select-none text-[11px] uppercase font-bold text-text-secondary tracking-wider">
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
                        {isLoading ? (
                            <tr>
                                <td colSpan={8} className="py-[100px] text-center bg-white">
                                    <LoadingReact />
                                </td>
                            </tr>
                        ) : payments.length > 0 ? (
                            payments.map((payment) => {
                                const isSuccess = payment.status === "success";
                                const showRefundAction = isSuccess;

                                return (
                                    <tr
                                        key={payment.id}
                                        className={clsx(
                                            "group transition-all duration-150 border-b border-border last:border-0 hover:bg-surface",
                                            isRefreshing && "opacity-60"
                                        )}
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
                                            {formatAdminTableDateTime(payment.transactionDate)}
                                        </td>

                                        {/* Actions */}
                                        <td className="py-4 px-6 text-right">
                                            <div className="flex justify-end items-center gap-2">
                                                <Link
                                                    to={ROUTES.PAYMENTS_DETAIL.replace(':id', String(payment.id))}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-surface border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all duration-200 shadow-xs"
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
                            })
                        ) : (
                            <tr>
                                <td colSpan={8} className="py-[80px] text-center bg-white">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
                                            <RefreshCw size={32} className="text-[#E2E8F0]" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[#1E293B] font-bold text-[16px]">{t("table.empty_title", "Không tìm thấy giao dịch")}</p>
                                            <p className="text-text-secondary text-[14px]">{t("table.empty_desc", "Không có dữ liệu giao dịch nào khớp với bộ lọc hiện tại của bạn.")}</p>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {total > 0 && (
                <div className="px-6 py-4 border-t border-[#E2E8F0] bg-surface flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-[13px] font-medium text-[#64748B] font-sans">
                        {t('common:pagination.showing_summary', {
                            start: total > 0 ? (page - 1) * limit + 1 : 0,
                            end: Math.min(page * limit, total),
                            total: total,
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
                            onClick={() => onPageChange(page + 1)}
                            disabled={page >= lastPage}
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
