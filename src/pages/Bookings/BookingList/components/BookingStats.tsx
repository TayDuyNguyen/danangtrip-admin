import { useTranslation } from 'react-i18next';
import { ShoppingCart, Clock, CheckCircle2, XCircle } from 'lucide-react';
import type { AdminBookingStatusCounts } from '@/dataHelper/booking.dataHelper';

interface Props {
    stats?: AdminBookingStatusCounts;
    isLoading?: boolean;
}

const BookingStats = ({ stats, isLoading }: Props) => {
    const { t } = useTranslation('booking');

    const totalBookings = (stats?.pending || 0) + (stats?.confirmed || 0) + (stats?.completed || 0) + (stats?.cancelled || 0);

    const statCards = [
        {
            label: t('stats.total_label'),
            value: totalBookings,
            icon: <ShoppingCart size={20} className="text-[#3B82F6]" />,
            iconBg: 'bg-[#EFF6FF]',
            color: 'text-[#1E293B]',
        },
        {
            label: t('stats.pending_label'),
            value: stats?.pending || 0,
            icon: <Clock size={20} className="text-[#F59E0B]" />,
            iconBg: 'bg-[#FEF3C7]',
            color: 'text-[#F59E0B]',
        },
        {
            label: t('stats.confirmed_label'),
            value: stats?.confirmed || 0,
            icon: <CheckCircle2 size={20} className="text-[#10B981]" />,
            iconBg: 'bg-[#D1FAE5]',
            color: 'text-[#10B981]',
        },
        {
            label: t('stats.cancelled_label'),
            value: stats?.cancelled || 0,
            icon: <XCircle size={20} className="text-[#EF4444]" />,
            iconBg: 'bg-[#FEE2E2]',
            color: 'text-[#EF4444]',
        }
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-24">
            {statCards.map((card, idx) => (
                <div 
                    key={idx}
                    className="bg-white border border-[#E2E8F0] p-4 flex items-center gap-[12px] shadow-sm hover:shadow-md transition-all rounded-2xl group"
                >
                    <div className={`w-[40px] h-[40px] ${card.iconBg} rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 duration-300`}>
                        {card.icon}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-sans">
                            {card.label}
                        </span>
                        {isLoading ? (
                            <div className="h-6 w-12 bg-slate-100 animate-pulse rounded mt-1" />
                        ) : (
                            <span className={`text-[20px] font-black ${card.color} leading-none font-sans mt-0.5`}>
                                {card.value.toLocaleString()}
                            </span>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default BookingStats;
