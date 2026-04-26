import { useTranslation } from 'react-i18next';
import { ShoppingBag, UserPlus, Star, Package, Info, AlertCircle, CheckCircle } from 'lucide-react';

const TYPE_ICONS = {
    booking: { icon: <ShoppingBag size={14} />, color: 'text-[#14b8a6]', bg: 'bg-[#dff7f4]' },
    user: { icon: <UserPlus size={14} />, color: 'text-[#0f766e]', bg: 'bg-blue-100' },
    review: { icon: <Star size={14} />, color: 'text-[#0f766e]', bg: 'bg-[#f4fce3]' },
    tour: { icon: <Package size={14} />, color: 'text-[#0f766e]', bg: 'bg-[#ccfbf1]' },
    system: { icon: <Info size={14} />, color: 'text-slate-500', bg: 'bg-slate-50' },
};

const STATUS_ICONS = {
    success: <CheckCircle size={12} className="text-[#14b8a6]" />,
    warning: <AlertCircle size={12} className="text-[#b45309]" />,
    info: <Info size={12} className="text-[#14b8a6]" />,
    error: <AlertCircle size={12} className="text-red-500" />,
};

interface RecentActivitiesProps {
    activities: Array<{
        id: string;
        type: keyof typeof TYPE_ICONS;
        description: string;
        time: string;
        status?: keyof typeof STATUS_ICONS;
    }>;
}

const RecentActivities = ({ activities }: RecentActivitiesProps) => {
    const { t } = useTranslation('dashboard');

    return (
        <div className="bg-white border border-slate-200 rounded-[32px] p-6 shadow-sm overflow-hidden flex flex-col h-full min-h-[450px]">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">{t('activities.title')}</h3>
                <button className="text-[10px] font-black text-[#14b8a6] hover:text-[#0f766e] uppercase tracking-tighter">{t('activities.view_all')}</button>
            </div>

            <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar flex-1">
                {activities && activities.length > 0 ? (
                    activities.map((activity, index) => {
                        const typeConfig = TYPE_ICONS[activity.type] || TYPE_ICONS.system;
                        return (
                            <div key={activity.id} className="relative flex gap-4 group">
                                {/* Connection Line */}
                                {index !== activities.length - 1 && (
                                    <div className="absolute left-[17px] top-[34px] bottom-[-24px] w-[2px] bg-slate-100 group-last:hidden" />
                                )}

                                {/* Icon Wrapper */}
                                <div className={`relative z-10 w-9 h-9 rounded-xl ${typeConfig.bg} flex items-center justify-center ${typeConfig.color} shadow-sm border border-white`}>
                                    {typeConfig.icon}
                                    {/* Small status indicator */}
                                    {activity.status && (
                                        <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                                            {STATUS_ICONS[activity.status]}
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex flex-col gap-1 pb-2">
                                    <p className="text-xs font-bold text-slate-900 leading-relaxed group-hover:text-[#14b8a6] transition-colors">
                                        {activity.description}
                                    </p>
                                    <span className="text-[10px] font-medium text-slate-400">
                                        {activity.time}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
                        <Info size={24} className="opacity-20" />
                        <p className="text-[10px] font-bold uppercase tracking-widest">{t('activities.no_activities')}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecentActivities;
