import { useTranslation } from 'react-i18next';
import { Package, CheckCircle2, Star, Ban } from 'lucide-react';
import type { TourStats as TourStatsType } from '@/dataHelper/tour.dataHelper';

interface Props {
    stats?: TourStatsType;
    isLoading?: boolean;
}

const TourStats = ({ stats, isLoading }: Props) => {
    const { t } = useTranslation('tour');

    const statCards = [
        {
            label: t('stats.total_label'),
            value: stats?.total_tours || 0,
            icon: <Package size={20} className="text-[#0066CC]" />,
            iconBg: 'bg-[#EFF6FF]',
            color: 'text-[#1E293B]',
            materialIcon: 'inventory_2'
        },
        {
            label: t('stats.active_label'),
            value: stats?.active_tours || 0,
            icon: <CheckCircle2 size={20} className="text-[#10B981]" />,
            iconBg: 'bg-[#D1FAE5]',
            color: 'text-[#10B981]',
            materialIcon: 'check_circle'
        },
        {
            label: t('stats.featured_label'),
            value: stats?.featured_tours || 0,
            icon: <Star size={20} className="text-[#F59E0B]" />,
            iconBg: 'bg-[#FEF3C7]',
            color: 'text-[#F59E0B]',
            materialIcon: 'star'
        },
        {
            label: t('stats.sold_out_label'),
            value: stats?.sold_out_tours || 0,
            icon: <Ban size={20} className="text-[#F59E0B]" />,
            iconBg: 'bg-[#FEF3C7]',
            color: 'text-[#F59E0B]',
            materialIcon: 'block'
        }
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-24">
            {statCards.map((card, idx) => (
                <div 
                    key={idx}
                    className="bg-white border border-[#E2E8F0] radius-12 p-4 flex items-center gap-[12px] shadow-sm hover:shadow-md transition-all active:scale-[0.98] group rounded-[12px]"
                >
                    <div className={`w-[36px] h-[36px] ${card.iconBg} rounded-[8px] flex items-center justify-center shrink-0 transition-transform group-hover:rotate-12 duration-300`}>
                        {/* We use Lucide icons as fallback for Material icons */}
                        {card.icon}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[12px] font-bold text-[#94A3B8] uppercase tracking-wider font-inter">
                            {card.label}
                        </span>
                        {isLoading ? (
                            <div className="h-6 w-12 bg-slate-100 animate-pulse rounded mt-1" />
                        ) : (
                            <span className={`text-[20px] font-bold ${card.color} leading-none font-inter mt-0.5`}>
                                {card.value.toLocaleString()}
                            </span>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default TourStats;
