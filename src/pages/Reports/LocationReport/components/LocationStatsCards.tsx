import React from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Eye, Star, Bookmark } from 'lucide-react';
import type { LocationReportViewModel } from '@/dataHelper/report.dataHelper';

interface LocationStatsCardsProps {
    stats: LocationReportViewModel['stats'] | undefined;
    isLoading: boolean;
}

const SkeletonCard = () => (
    <div className="p-[1px] rounded-3xl bg-gradient-to-br from-slate-200/20 via-slate-100/10 to-transparent">
        <div className="bg-white rounded-[23px] p-5 shadow-xs animate-pulse">
            <div className="flex items-center justify-between mb-4">
                <div className="w-9 h-9 bg-slate-100 rounded-xl" />
                <div className="w-16 h-4 bg-slate-100 rounded-full" />
            </div>
            <div className="w-24 h-8 bg-slate-100 rounded-lg mb-2" />
            <div className="w-32 h-3 bg-slate-100 rounded-full" />
        </div>
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
            color: 'text-teal-600',
            bg: 'bg-teal-50',
            border: 'border-teal-100',
        },
        {
            id: 'stat-active',
            label: t('stats.active'),
            value: (stats?.active ?? 0).toLocaleString('vi-VN'),
            icon: Eye,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            border: 'border-blue-100',
        },
        {
            id: 'stat-featured',
            label: t('stats.featured'),
            value: (stats?.featured ?? 0).toLocaleString('vi-VN'),
            icon: Bookmark,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
            border: 'border-amber-100',
        },
        {
            id: 'stat-views',
            label: t('stats.total_views'),
            value: (stats?.totalViews ?? 0).toLocaleString('vi-VN'),
            icon: Star,
            color: 'text-purple-600',
            bg: 'bg-purple-50',
            border: 'border-purple-100',
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
                        className="p-[1px] rounded-3xl bg-gradient-to-br from-[#14b8a6]/20 via-slate-200/25 to-slate-100/10 shadow-xs hover:shadow-md hover:from-[#14b8a6]/30 transition-all duration-300 group h-full"
                    >
                        <div className="bg-white rounded-[23px] p-5 relative overflow-hidden h-full flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`w-9 h-9 ${card.bg} border ${card.border} rounded-xl flex items-center justify-center ${card.color} group-hover:scale-110 transition-transform duration-200`}>
                                        <Icon size={16} />
                                    </div>
                                </div>
                                <p className="text-2xl font-black text-[#0F172A] leading-tight mb-1 select-all">{card.value}</p>
                            </div>
                            <p className="text-xs font-black text-[#94A3B8] uppercase tracking-widest">{card.label}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default LocationStatsCards;
