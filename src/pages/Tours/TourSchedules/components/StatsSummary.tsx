import type { ScheduleStats } from '@/dataHelper/schedule.dataHelper';
import { Calendar, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface StatsSummaryProps {
    stats?: ScheduleStats;
    loading?: boolean;
}

const StatsSummary = ({ stats, loading }: StatsSummaryProps) => {
    const { t } = useTranslation(['schedules', 'common']);

    const items = [
        {
            label: t('schedules:stats.total'),
            value: stats?.total_schedules || 0,
            icon: Calendar,
            color: 'text-[#14b8a6]',
            bg: 'bg-[#dff7f4]',
            border: 'border-[#ccfbf1]',
        },
        {
            label: t('schedules:stats.available'),
            value: stats?.available_schedules || 0,
            icon: CheckCircle,
            color: 'text-[#0f766e]',
            bg: 'bg-[#dff7f4]',
            border: 'border-[#ccfbf1]',
        },
        {
            label: t('schedules:stats.full'),
            value: stats?.full_schedules || 0,
            icon: XCircle,
            color: 'text-red-600',
            bg: 'bg-red-50',
            border: 'border-red-100',
        },
        {
            label: t('schedules:stats.cancelled'),
            value: stats?.cancelled_schedules || 0,
            icon: AlertTriangle,
            color: 'text-slate-600',
            bg: 'bg-slate-50',
            border: 'border-slate-100',
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {items.map((item, index) => (
                <div 
                    key={index}
                    className={`p-4 rounded-2xl border ${item.border} ${item.bg} flex items-center gap-4`}
                >
                    <div className={`w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center ${item.color}`}>
                        <item.icon className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-0.5">
                            {item.label}
                        </p>
                        <p className={`text-2xl font-bold ${item.color}`}>
                            {loading ? '...' : item.value}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default StatsSummary;
