import React from 'react';
import { Users, UserCheck, ShieldAlert } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import { useTranslation } from 'react-i18next';

interface UsersStatsCardsProps {
    totalNewUsers: number;
    isLoading?: boolean;
}

const UsersStatsCards: React.FC<UsersStatsCardsProps> = ({ totalNewUsers, isLoading = false }) => {
    const { t } = useTranslation('users_report');

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {[...Array(3)].map((_, idx) => (
                    <div key={idx} className="bg-white/80 backdrop-blur-md border border-slate-100 rounded-2xl p-6 shadow-xs">
                        <div className="flex justify-between items-start mb-4">
                            <Skeleton className="w-10 h-10 rounded-xl" />
                        </div>
                        <Skeleton className="w-24 h-8 mb-2" />
                        <Skeleton className="w-32 h-4" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* 1. New Users */}
            <div className="bg-white/80 backdrop-blur-md border border-slate-100 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all duration-300 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 bg-[#14b8a6]"></div>
                <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-[#14b8a6] group-hover:scale-110 transition-transform">
                        <Users size={20} />
                    </div>
                    <span className="text-[10px] font-black text-[#14b8a6] bg-teal-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                        {t('stats.active_year')}
                    </span>
                </div>
                <h3 className="text-3xl font-black text-slate-800 leading-tight mb-1 select-all">
                    {totalNewUsers.toLocaleString()}
                </h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    {t('stats.new_users')}
                </p>
            </div>

            {/* 2. Total System Users (Gap Placeholder) */}
            <div className="bg-white/80 backdrop-blur-md border border-slate-100 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all duration-300 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 bg-amber-500"></div>
                <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                        <UserCheck size={20} />
                    </div>
                    <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full uppercase tracking-wider" title={t('stats.gap_tooltip')}>
                        {t('stats.status_na')}
                    </span>
                </div>
                <h3 className="text-3xl font-black text-slate-400 leading-tight mb-1">
                    {t('stats.na_label')}
                </h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1" title={t('stats.gap_tooltip')}>
                    {t('stats.total_users')}
                </p>
            </div>

            {/* 3. Active Status Rate (Gap Placeholder) */}
            <div className="bg-white/80 backdrop-blur-md border border-slate-100 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all duration-300 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 bg-slate-400"></div>
                <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:scale-110 transition-transform">
                        <ShieldAlert size={20} />
                    </div>
                    <span className="text-[10px] font-black text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full uppercase tracking-wider" title={t('stats.gap_tooltip')}>
                        {t('stats.status_na')}
                    </span>
                </div>
                <h3 className="text-3xl font-black text-slate-400 leading-tight mb-1">
                    {t('stats.na_label')}
                </h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest" title={t('stats.gap_tooltip')}>
                    {t('stats.active_rate')}
                </p>
            </div>
        </div>
    );
};

export default UsersStatsCards;
