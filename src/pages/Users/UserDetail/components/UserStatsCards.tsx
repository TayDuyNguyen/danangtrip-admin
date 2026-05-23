import { ShoppingBag, MessageSquare, Heart, CreditCard } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '@/utils/pricing';

interface UserStatsCardsProps {
    bookingsCount: number;
    ratingsCount: number;
    favoritesCount: number;
    totalSpend: number;
}

export const UserStatsCards = ({
    bookingsCount,
    ratingsCount,
    favoritesCount,
    totalSpend,
}: UserStatsCardsProps) => {
    const { t } = useTranslation('user');

    const stats = [
        {
            key: 'bookings',
            value: bookingsCount.toLocaleString(),
            label: t('stats.bookings', 'ĐƠN HÀNG'),
            icon: ShoppingBag,
            color: 'text-amber-600 bg-amber-50 border-amber-200/50',
        },
        {
            key: 'ratings',
            value: ratingsCount.toLocaleString(),
            label: t('stats.ratings', 'ĐÁNH GIÁ'),
            icon: MessageSquare,
            color: 'text-indigo-600 bg-indigo-50 border-indigo-200/50',
        },
        {
            key: 'favorites',
            value: favoritesCount.toLocaleString(),
            label: t('stats.favorites', 'YÊU THÍCH'),
            icon: Heart,
            color: 'text-rose-600 bg-rose-50 border-rose-200/50',
        },
        {
            key: 'spend',
            value: formatCurrency(totalSpend) + 'đ',
            label: t('stats.total_spend', 'TỔNG CHI'),
            icon: CreditCard,
            color: 'text-[#14b8a6] bg-teal-50 border-teal-200/50',
            isCurrency: true,
        },
    ];

    return (
        // ─── Gradient border shell ───
        <div className="p-[1px] rounded-3xl bg-gradient-to-br from-[#14b8a6]/20 via-slate-200/25 to-slate-100/10 shadow-xs hover:shadow-md hover:from-[#14b8a6]/30 transition-all duration-300">
            <div className="bg-white rounded-[23px] p-5">
                <div className="grid grid-cols-2 gap-3.5">
                    {stats.map((item) => {
                        const IconComponent = item.icon;
                        return (
                            <div
                                key={item.key}
                                className="bg-slate-50/40 border border-slate-100/80 rounded-2xl p-4 flex flex-col items-center justify-center text-center transition-all duration-200 hover:bg-white hover:shadow-sm hover:border-[#14b8a6]/30 group"
                            >
                                <span className={`p-2.5 rounded-xl mb-3 transition-all duration-200 group-hover:scale-110 border ${item.color.split(' ').slice(1).join(' ')}`}>
                                    <IconComponent className={item.color.split(' ')[0]} size={16} />
                                </span>
                                <span className={`text-[18px] font-black leading-tight tracking-tight truncate max-w-full ${item.isCurrency ? 'text-[#14b8a6]' : 'text-[#0F172A]'}`}>
                                    {item.value}
                                </span>
                                <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest mt-1.5 leading-none">
                                    {item.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
