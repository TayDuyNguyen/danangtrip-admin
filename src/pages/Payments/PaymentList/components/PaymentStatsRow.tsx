import { DollarSign, CheckCircle2, Clock, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";

interface PaymentStatsRowProps {
    stats?: {
        totalRevenue: number;
        successCount: number;
        pendingCount: number;
        refundedAmount: number;
    };
    isLoading?: boolean;
}

export const PaymentStatsRow = ({ stats, isLoading }: PaymentStatsRowProps) => {
    const { t } = useTranslation("payment");

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(val);
    };

    const cards = [
        {
            title: t("stats.revenue", "Tổng Doanh thu"),
            value: formatCurrency(stats?.totalRevenue || 0),
            icon: DollarSign,
            color: "text-teal-600 bg-teal-50 border-teal-100",
            glow: "group-hover:shadow-teal-500/10",
            gradient: "from-teal-500/5 to-transparent",
        },
        {
            title: t("stats.success_count", "Giao dịch Thành công"),
            value: stats?.successCount || 0,
            icon: CheckCircle2,
            color: "text-emerald-600 bg-emerald-50 border-emerald-100",
            glow: "group-hover:shadow-emerald-500/10",
            gradient: "from-emerald-500/5 to-transparent",
        },
        {
            title: t("stats.pending_count", "Giao dịch Đang chờ"),
            value: stats?.pendingCount || 0,
            icon: Clock,
            color: "text-amber-600 bg-amber-50 border-amber-100",
            glow: "group-hover:shadow-amber-500/10",
            gradient: "from-amber-500/5 to-transparent",
        },
        {
            title: t("stats.refunded_amount", "Số tiền Hoàn trả"),
            value: formatCurrency(stats?.refundedAmount || 0),
            icon: RefreshCw,
            color: "text-rose-600 bg-rose-50 border-rose-100",
            glow: "group-hover:shadow-rose-500/10",
            gradient: "from-rose-500/5 to-transparent",
        },
    ];

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <div
                        key={i}
                        className="bg-white border border-slate-100 rounded-2xl p-6 h-28 animate-pulse flex flex-col justify-between"
                    >
                        <div className="flex items-center justify-between">
                            <div className="h-4 bg-slate-100 rounded-md w-1/2"></div>
                            <div className="w-10 h-10 bg-slate-100 rounded-xl"></div>
                        </div>
                        <div className="h-6 bg-slate-100 rounded-md w-3/4 mt-2"></div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cards.map((card, i) => {
                const Icon = card.icon;
                return (
                    <div
                        key={i}
                        className={`group relative bg-white/80 backdrop-blur-md border border-slate-100 rounded-2xl p-6 hover:-translate-y-1 transition-all duration-300 shadow-xs hover:shadow-xl ${card.glow} overflow-hidden`}
                    >
                        {/* Background Gradient Glow */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                        
                        <div className="relative flex items-center justify-between">
                            <span className="text-slate-400 font-bold text-xs uppercase tracking-wider">{card.title}</span>
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${card.color}`}>
                                <Icon size={20} className="transition-transform duration-300 group-hover:scale-110" />
                            </div>
                        </div>
                        <div className="relative mt-4">
                            <span className="text-slate-900 text-2xl font-black tracking-tight">{card.value}</span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default PaymentStatsRow;
