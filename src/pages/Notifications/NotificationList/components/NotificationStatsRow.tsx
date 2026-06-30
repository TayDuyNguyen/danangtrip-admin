import { Bell, MailOpen, Mail } from "lucide-react";
import { useTranslation } from "react-i18next";
import StatCard from "@/components/common/StatCard";

interface NotificationStatsRowProps {
    total: number;
    readCount: number;
    unreadCount: number;
    isLoading?: boolean;
    isError?: boolean;
    isFiltered?: boolean;
}

export const NotificationStatsRow = ({
    total,
    readCount,
    unreadCount,
    isLoading = false,
    isError = false,
    isFiltered = false,
}: NotificationStatsRowProps) => {
    const { t } = useTranslation("notification");

    const totalTitle = isFiltered ? t("stats.total_filtered") : t("stats.total");
    const readTitle = isFiltered ? t("stats.read_filtered") : t("stats.read");
    const unreadTitle = isFiltered ? t("stats.unread_filtered") : t("stats.unread");

    if (isError) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-rose-50 border border-rose-100 rounded-3xl p-6 text-center text-rose-600 font-bold text-sm">
                        {t("toast.network_error")}
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
            <StatCard
                title={totalTitle}
                value={total}
                icon={Bell}
                accent="secondary"
                isLoading={isLoading}
                isError={isError}
            />
            <StatCard
                title={readTitle}
                value={readCount}
                icon={MailOpen}
                accent="teal"
                isLoading={isLoading}
                isError={isError}
            />
            <StatCard
                title={unreadTitle}
                value={unreadCount}
                icon={Mail}
                accent="rose"
                isLoading={isLoading}
                isError={isError}
            />
        </div>
    );
};

export default NotificationStatsRow;
