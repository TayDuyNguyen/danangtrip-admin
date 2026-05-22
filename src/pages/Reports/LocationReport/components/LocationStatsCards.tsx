import React from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Eye, Star, Bookmark } from 'lucide-react';
import type { LocationReportViewModel } from '@/dataHelper/report.dataHelper';

interface LocationStatsCardsProps {
    stats: LocationReportViewModel['stats'] | undefined;
    isLoading: boolean;
}

const SkeletonCard = () => (
    <div className="bg-white/80 backdrop-blur-md border border-slate-100 rounded-2xl p-5 shadow-xs animate-pulse">
        <div className="flex items-center justify-between mb-4">
            <div className="w-9 h-9 bg-slate-100 rounded-xl" />
            <div className="w-16 h-4 bg-slate-100 rounded-full" />
        </div>
        <div className="w-24 h-8 bg-slate-100 rounded-lg mb-2" />
        <div className="w-32 h-3 bg-slate-100 rounded-full" />
    </div>
);

const LocationStatsCards: React.FC<LocationStatsCardsProps> = ({ stats, isLoading }) => {
    const { t } = useTranslation('location_report');

    if (isLoading) {
        return (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[0, 1, 2, 3].map(i => <SkeletonCard key={i} />)}
            </div>
        );
    }

    const cards = [
        {
            id: 'stat-total',
            label: t('stats.total'),
            value: (stats?.total ?? 0).toLocaleString('vi-VN'),
            icon: MapPin,
            color: 'text-teal-500',
            bg: 'bg-teal-500/10',
            border: 'border-teal-500/10',
        },
        {
            id: 'stat-active',
            label: t('stats.active'),
            value: (stats?.active ?? 0).toLocaleString('vi-VN'),
            icon: Eye,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10',
            border: 'border-blue-500/10',
        },
        {
            id: 'stat-featured',
            label: t('stats.featured'),
            value: (stats?.featured ?? 0).toLocaleString('vi-VN'),
            icon: Bookmark,
            color: 'text-amber-500',
            bg: 'bg-amber-500/10',
            border: 'border-amber-500/10',
        },
        {
            id: 'stat-views',
            label: t('stats.total_views'),
            value: (stats?.totalViews ?? 0).toLocaleString('vi-VN'),
            icon: Star,
            color: 'text-purple-500',
            bg: 'bg-purple-500/10',
            border: 'border-purple-500/10',
        },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map(card => {
                const Icon = card.icon;
                return (
                    <div
                        key={card.id}
                        id={card.id}
                        className="bg-white/80 backdrop-blur-md border border-slate-100 rounded-2xl p-5 shadow-xs hover:-translate-y-0.5 hover:border-slate-200 transition-all duration-150 group"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-9 h-9 ${card.bg} border ${card.border} rounded-xl flex items-center justify-center ${card.color}`}>
                                <Icon size={16} />
                            </div>
                        </div>
                        <p className="text-2xl font-black text-slate-800 leading-tight mb-1">{card.value}</p>
                        <p className="text-xs font-bold text-slate-400">{card.label}</p>
                    </div>
                );
            })}
        </div>
    );
};

export default LocationStatsCards;
