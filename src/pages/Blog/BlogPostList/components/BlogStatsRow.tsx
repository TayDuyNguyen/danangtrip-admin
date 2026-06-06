import { FileText, CheckCircle, Edit, Archive } from "lucide-react";
import { useTranslation } from "react-i18next";
import StatCard from "@/components/common/StatCard";

interface BlogStatsRowProps {
    total: number;
    published: number;
    draft: number;
    archived: number;
    isLoading?: boolean;
    isError?: boolean;
}

export const BlogStatsRow = ({
    total,
    published,
    draft,
    archived,
    isLoading = false,
    isError = false,
}: BlogStatsRowProps) => {
    const { t } = useTranslation("blog");

    if (isError) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-2">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-rose-50 border border-rose-100 rounded-3xl p-6 text-center text-rose-600 font-bold text-sm">
                        {t("toast.network_error")}
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-2">
            <StatCard
                title={t("stats.total")}
                value={total}
                icon={FileText}
                accent="secondary"
                isLoading={isLoading}
                isError={isError}
            />
            <StatCard
                title={t("stats.published")}
                value={published}
                icon={CheckCircle}
                accent="teal"
                isLoading={isLoading}
                isError={isError}
            />
            <StatCard
                title={t("stats.draft")}
                value={draft}
                icon={Edit}
                accent="tealSoft"
                isLoading={isLoading}
                isError={isError}
            />
            <StatCard
                title={t("stats.archived")}
                value={archived}
                icon={Archive}
                accent="slate"
                isLoading={isLoading}
                isError={isError}
            />
        </div>
    );
};

export default BlogStatsRow;
