import type { PaymentStatus } from "@/dataHelper/payment.dataHelper";
import { useTranslation } from "react-i18next";

interface PaymentStatusBadgeProps {
    status: PaymentStatus;
}

export const PaymentStatusBadge = ({ status }: PaymentStatusBadgeProps) => {
    const { t } = useTranslation("payment");

    const config = {
        pending: {
            bg: "bg-amber-50/70 border-amber-200/50 text-amber-700",
            dot: "bg-amber-500 shadow-xs shadow-amber-500/50",
            label: t("status.pending", "Đang chờ"),
        },
        partially_paid: {
            bg: "bg-orange-50/70 border-orange-200/50 text-orange-700",
            dot: "bg-orange-500 shadow-xs shadow-orange-500/50",
            label: t("status.partially_paid", "Thanh toán một phần"),
        },
        success: {
            bg: "bg-emerald-50/70 border-emerald-200/50 text-emerald-700",
            dot: "bg-emerald-500 shadow-xs shadow-emerald-500/50 animate-pulse",
            label: t("status.success", "Thành công"),
        },
        failed: {
            bg: "bg-slate-50/70 border-slate-200/50 text-slate-600",
            dot: "bg-slate-400",
            label: t("status.failed", "Lỗi"),
        },
        refunded: {
            bg: "bg-rose-50/70 border-rose-200/50 text-rose-700",
            dot: "bg-rose-500 shadow-xs shadow-rose-500/50",
            label: t("status.refunded", "Đã hoàn tiền"),
        },
    };

    const current = config[status] || config.pending;

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full border backdrop-blur-xs transition-all duration-200 ${current.bg}`}
        >
            <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`}></span>
            {current.label}
        </span>
    );
};

export default PaymentStatusBadge;
