import { Mail, MailOpen, Send, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Skeleton } from "@/components/ui/Skeleton";
import EmptyState from "@/components/common/EmptyState";

interface StatsCardProps {
    title: string;
    value: number;
    icon: React.ComponentType<{ className?: string; size?: number }>;
    bgClass: string;
    iconClass: string;
    textClass: string;
    pulse?: boolean;
    isLoading?: boolean;
}

const StatsCard = ({
    title,
    value,
    icon: Icon,
    bgClass,
    iconClass,
    textClass,
    pulse = false,
    isLoading = false,
}: StatsCardProps) => {
    if (isLoading) {
        return (
            <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-slate-100 shadow-2xs flex items-center justify-between">
                <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-28 rounded-md" />
                    <Skeleton className="h-8 w-16 rounded-md" />
                </div>
                <Skeleton className="h-12 w-12 rounded-2xl" />
            </div>
        );
    }

    return (
        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-slate-100 shadow-2xs hover:shadow-md transition-all duration-300 group flex items-center justify-between cursor-default">
            <div className="min-w-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    {title}
                </span>
                <span className={`text-3xl font-black ${textClass} tracking-tight leading-none`}>
                    {value}
                </span>
            </div>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-108 relative ${bgClass}`}>
                {pulse && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                )}
                <Icon className={iconClass} size={20} />
            </div>
        </div>
    );
};

interface ContactStatsRowProps {
    total: number;
    newCount: number;
    readCount: number;
    repliedCount: number;
    isLoading?: boolean;
    isError?: boolean;
    onRetry?: () => void;
}

export const ContactStatsRow = ({
    total,
    newCount,
    readCount,
    repliedCount,
    isLoading = false,
    isError = false,
    onRetry,
}: ContactStatsRowProps) => {
    const { t } = useTranslation(["contact", "common"]);

    if (isError) {
        return (
            <div
                className="bg-white border border-slate-100 rounded-3xl p-8 flex flex-col items-center text-center mb-2"
                data-testid="contact-stats-error"
            >
                <EmptyState
                    title={t("errors.stats_load_failed")}
                    description={t("errors.stats_load_failed_desc")}
                />
                {onRetry && (
                    <button
                        type="button"
                        onClick={() => void onRetry()}
                        className="mt-2 px-6 py-2.5 bg-[#14b8a6] text-white rounded-xl text-[13px] font-bold hover:bg-[#0f766e] transition-colors inline-flex items-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4" />
                        {t("actions.retry", { ns: "common", defaultValue: "Thử lại" })}
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-2">
            <StatsCard
                title={t("stats.total")}
                value={total}
                icon={Mail}
                bgClass="bg-blue-50"
                iconClass="text-blue-500"
                textClass="text-slate-900"
                isLoading={isLoading}
            />
            <StatsCard
                title={t("stats.new")}
                value={newCount}
                icon={Mail}
                bgClass="bg-rose-50"
                iconClass="text-rose-500"
                textClass="text-rose-600"
                pulse={newCount > 0}
                isLoading={isLoading}
            />
            <StatsCard
                title={t("stats.read")}
                value={readCount}
                icon={MailOpen}
                bgClass="bg-amber-50"
                iconClass="text-amber-500"
                textClass="text-amber-600"
                isLoading={isLoading}
            />
            <StatsCard
                title={t("stats.replied")}
                value={repliedCount}
                icon={Send}
                bgClass="bg-emerald-50"
                iconClass="text-emerald-500"
                textClass="text-emerald-600"
                isLoading={isLoading}
            />
        </div>
    );
};

export default ContactStatsRow;
