import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshCcw, Filter, Calendar } from 'lucide-react';
import type { DashboardData } from '@/dataHelper';
import StatsCards from './components/StatsCards';
import DashboardCharts from './components/DashboardCharts';
import RecentActivityTable from './components/RecentActivityTable';
import LoadingReact from '@/components/loading';

const Dashboard: React.FC = () => {
    const { t } = useTranslation(['dashboard', 'common']);
    const [data, setData] = useState<DashboardData | null>(null);
    const [period, setPeriod] = useState(7);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchDashboardData = async (isRefresh = false, days = period) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        try {
            const result = await dashboardApi.getDashboardData(days);
            setData(result);
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchDashboardData(false, period);
    }, [period]);

    if (loading && !data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <LoadingReact />
                <p className="text-slate-500 font-bold animate-pulse text-sm tracking-widest uppercase">{t('status.loading_dashboard')}</p>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in duration-700 slide-in-from-bottom-4">
            {/* Dashboard Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200/60">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-1.5">
                        {t('common:title.welcome')}, <span className="text-blue-600">Admin</span>
                    </h1>
                    <p className="text-slate-500 font-bold tracking-tight flex items-center gap-2">
                        <Calendar size={16} className="text-blue-500" />
                        {t('common:title.subtitle')}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        className="px-5 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm"
                    >
                        <Filter size={16} />
                        {t('dashboard:common.filter')}
                    </button>
                    <button
                        onClick={() => fetchDashboardData(true)}
                        disabled={refreshing}
                        className={`px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-sm font-bold transition-all flex items-center gap-2 shadow-lg shadow-blue-600/30 active:scale-95 disabled:opacity-50 ${refreshing ? 'animate-pulse' : ''}`}
                    >
                        <RefreshCcw size={16} className={refreshing ? 'animate-spin' : ''} />
                        {refreshing ? t('dashboard:common.refreshing') : t('dashboard:common.refresh')}
                    </button>
                </div>
            </div>

            {/* Main Content Sections */}
            {data && (
                <>
                    {/* Stats Section */}
                    <section>
                        <StatsCards stats={data.stats} />
                    </section>

                    {/* Charts Section */}
                    <section>
                        <DashboardCharts
                            ratings={data.ratings}
                            categories={data.categories}
                            currentPeriod={period}
                            onPeriodChange={setPeriod}
                        />
                    </section>

                    {/* Activity Section */}
                    <section>
                        <RecentActivityTable activities={data.recentActivities} />
                    </section>
                </>
            )}
        </div>
    );
};

export default Dashboard;
