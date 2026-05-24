import { Users, CheckCircle, Ban, ShieldAlert } from "lucide-react";
import { useTranslation } from "react-i18next";
import StatCard from "@/components/common/StatCard";

interface UserStatsRowProps {
    total: number;
    active: number;
    banned: number;
    admin: number;
    isLoading?: boolean;
    isError?: boolean;
}

export const UserStatsRow = ({
    total,
    active,
    banned,
    admin,
    isLoading = false,
    isError = false,
}: UserStatsRowProps) => {
    const { t, i18n } = useTranslation("user");
    const locale = i18n.language === "vi" ? "vi-VN" : "en-US";

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatCard
                title={t("stats.total")}
                value={total.toLocaleString(locale)}
                icon={Users}
                isLoading={isLoading}
                isError={isError}
                accent="secondary"
            />
            <StatCard
                title={t("stats.active")}
                value={active.toLocaleString(locale)}
                icon={CheckCircle}
                isLoading={isLoading}
                isError={isError}
                accent="teal"
            />
            <StatCard
                title={t("stats.banned")}
                value={banned.toLocaleString(locale)}
                icon={Ban}
                isLoading={isLoading}
                isError={isError}
                accent="rose"
            />
            <StatCard
                title={t("stats.admin")}
                value={admin.toLocaleString(locale)}
                icon={ShieldAlert}
                isLoading={isLoading}
                isError={isError}
                accent="tealSoft"
            />
        </div>
    );
};

export default UserStatsRow;
