import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, CheckCircle, Star, Eye } from 'lucide-react';
import StatCard from '@/components/common/StatCard';
import type { LocationStats as ILocationStats } from '@/dataHelper/location.dataHelper';

interface LocationStatsProps {
    stats?: ILocationStats;
    isLoading?: boolean;
    isError?: boolean;
}

const LocationStats = ({ stats, isLoading, isError }: LocationStatsProps) => {
    const { t } = useTranslation('location');

    const statConfig = [
        {
            title: t('stats.total'),
            value: stats?.total,
            icon: MapPin,
            accent: 'indigo' as const,
        },
        {
            title: t('stats.active'),
            value: stats?.active,
            icon: CheckCircle,
            accent: 'teal' as const,
        },
        {
            title: t('stats.featured'),
            value: stats?.featured,
            icon: Star,
            accent: 'amber' as const,
        },
        {
            title: t('stats.views'),
            value: stats?.views,
            icon: Eye,
            accent: 'indigo' as const,
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {statConfig.map((item, index) => (
                <StatCard
                    key={index}
                    title={item.title}
                    value={item.value ?? 0}
                    icon={item.icon}
                    isLoading={isLoading}
                    isError={isError}
                    accent={item.accent}
                />
            ))}
        </div>
    );
};

export default memo(LocationStats);
