import React from 'react';
import { Users, UserCheck, ShieldAlert } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import { useTranslation } from 'react-i18next';

interface UsersStatsCardsProps {
    totalNewUsers: number;
    totalUsers: number;
    activeRate: number;
    isLoading?: boolean;
}

const UsersStatsCards: React.FC<UsersStatsCardsProps> = ({
    totalNewUsers,
    totalUsers,
    activeRate,
    isLoading = false,
}) => {
    const { t } = useTranslation('users_report');

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {[...Array(3)].map((_, idx) => (
                    <div key={idx} className="p-[1px] rounded-3xl bg-gradient-to-br from-slate-200/20 via-slate-200/15 to-slate-100/10 shadow-xs animate-pulse">
                        <div className="bg-white/95 backdrop-blur-md rounded-[23px] p-6">
                            <Skeleton className="w-10 h-10 rounded-xl mb-4" />
                            <Skeleton className="w-24 h-8 mb-2" />
                            <Skeleton className="w-32 h-4" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="p-[1px] rounded-3xl bg-gradient-to-br from-[#14b8a6]/20 via-slate-200/25 to-slate-100/10 shadow-xs hover:shadow-md hover:from-[#14b8a6]/30 transition-all duration-300">
                <div className="bg-white/95 backdrop-blur-md rounded-[23px] p-6 relative overflow-hidden group h-full">
                    <div className="absolute top-0 left-0 w-1 h-full bg-[#14b8a6]" />
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 rounded-xl bg-[#14b8a6]/10 flex items-center justify-center text-[#14b8a6] group-hover:scale-110 transition-transform">
                            <Users size={20} />
                        </div>
                        <span className="text-[10px] font-black text-[#14b8a6] bg-[#14b8a6]/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
                            {t('stats.active_year')}
                        </span>
                    </div>
                    <h3 className="text-3xl font-black text-slate-800 leading-tight mb-1">{totalNewUsers.toLocaleString()}</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('stats.new_users')}</p>
                </div>
            </div>

            <div className="p-[1px] rounded-3xl bg-gradient-to-br from-amber-500/20 via-slate-200/25 to-slate-100/10 shadow-xs hover:shadow-md hover:from-amber-500/30 transition-all duration-300">
                <div className="bg-white/95 backdrop-blur-md rounded-[23px] p-6 relative overflow-hidden group h-full">
                    <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                            <UserCheck size={20} />
                        </div>
                    </div>
                    <h3 className="text-3xl font-black text-slate-800 leading-tight mb-1">{totalUsers.toLocaleString()}</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('stats.total_users')}</p>
                </div>
            </div>

            <div className="p-[1px] rounded-3xl bg-gradient-to-br from-slate-500/20 via-slate-200/25 to-slate-100/10 shadow-xs hover:shadow-md hover:from-slate-500/30 transition-all duration-300">
                <div className="bg-white/95 backdrop-blur-md rounded-[23px] p-6 relative overflow-hidden group h-full">
                    <div className="absolute top-0 left-0 w-1 h-full bg-slate-400" />
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:scale-110 transition-transform">
                            <ShieldAlert size={20} />
                        </div>
                    </div>
                    <h3 className="text-3xl font-black text-slate-800 leading-tight mb-1">{activeRate}%</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('stats.active_rate')}</p>
                </div>
            </div>
        </div>
    );
};

export default UsersStatsCards;
