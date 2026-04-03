import React from 'react';
import {
    FileText,
    UserPlus,
    MapPin,
    BarChart2,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';
import type { StatsCardsProps } from '@/dataHelper/dashboard.dataHelper';
import { useTranslation } from 'react-i18next';


const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
    const { t } = useTranslation('dashboard');

    const cardData = [
        {
            title: t('dashboard:stats.pending_articles'),
            value: stats.totalPendingArticles,
            subValue: t('dashboard:stats.need_process'),
            icon: FileText,
            color: 'blue',
            change: null
        },
        {
            title: t('dashboard:stats.new_users'),
            value: stats.newUsers.count,
            subValue: `+${stats.newUsers.percentChange}% ${t('dashboard:stats.vs_last_week')}`,
            icon: UserPlus,
            color: 'emerald',
            change: stats.newUsers.percentChange
        },
        {
            title: t('stats.new_locations'),
            value: stats.newLocations.count,
            subValue: `+${stats.newLocations.changeCount} ${t('stats.locations_added')}`,
            icon: MapPin,
            color: 'orange',
            change: stats.newLocations.changeCount
        },
        {
            title: t('stats.points_revenue'),
            value: stats.totalPointsRevenue.amount,
            subValue: `+${stats.totalPointsRevenue.percentChange}% ${t('stats.revenue_up')}`,
            icon: BarChart2,
            color: 'indigo',
            change: stats.totalPointsRevenue.percentChange
        }
    ];

    const getColorClasses = (color: string) => {
        const variants: Record<string, string> = {
            blue: 'bg-blue-50 text-blue-600 border-blue-100',
            emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
            orange: 'bg-orange-50 text-orange-600 border-orange-100',
            indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100'
        };
        return variants[color] || variants.blue;
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cardData.map((card, index) => (
                <div
                    key={index}
                    className="bg-white p-6 rounded-4xl border border-slate-200/60 shadow-sm hover:shadow-xl hover:shadow-slate-200/40 hover:-translate-y-1 transition-all duration-300 group"
                >
                    <div className="flex items-start justify-between mb-4">
                        <div className={`p-3.5 rounded-2xl border ${getColorClasses(card.color)} transition-transform group-hover:scale-110 duration-300`}>
                            <card.icon size={22} />
                        </div>
                        {card.change !== null && (
                            <div className={`flex items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${card.change >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                {card.change >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                {Math.abs(card.change)}%
                            </div>
                        )}
                    </div>

                    <div>
                        <p className="text-slate-500 text-sm font-bold mb-1 tracking-tight">{card.title}</p>
                        <h3 className="text-3xl font-black text-slate-900 tracking-tighter mb-1.5">{card.value}</h3>
                        <p className="text-[12px] text-slate-400 font-bold leading-none">{card.subValue}</p>
                    </div>

                    {/* Decorative element */}
                    <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{t('stats.updated_now')}</span>
                        <div className="flex -space-x-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="w-5 h-5 rounded-full border-2 border-white bg-slate-200"></div>
                            ))}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default React.memo(StatsCards);
