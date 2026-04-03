import React from 'react';
import type { RecentActivityItem, RecentActivityTableProps } from '@/dataHelper/dashboard.dataHelper';
import { useTranslation } from 'react-i18next';
import { ExternalLink, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { StandardPagination } from '@/components/pagination';


const RecentActivityTable: React.FC<RecentActivityTableProps> = ({ activities }) => {
    const { t } = useTranslation('dashboard');

    const getStatusStyle = (status: RecentActivityItem['status']) => {
        const variants: Record<string, string> = {
            approved: 'bg-emerald-50 text-emerald-600 border-emerald-100/60',
            pending: 'bg-orange-50 text-orange-600 border-orange-100/60',
            rejected: 'bg-red-50 text-red-600 border-red-100/60',
        };
        return variants[status] || variants.pending;
    };

    const getStatusIcon = (status: RecentActivityItem['status']) => {
        switch (status) {
            case 'approved': return <CheckCircle size={14} />;
            case 'pending': return <Clock size={14} />;
            case 'rejected': return <AlertCircle size={14} />;
            default: return null;
        }
    };

    return (
        <div className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tighter">{t('activity.title')}</h3>
                    <p className="text-slate-500 text-sm font-bold tracking-tight">{t('activity.subtitle')}</p>
                </div>
                <button className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-slate-900/20 active:scale-95 flex items-center gap-2">
                    {t('common.view_all')}
                    <ExternalLink size={14} />
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50/50 border-b border-slate-100">
                        <tr>
                            <th className="px-8 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">{t('activity.header_title')}</th>
                            <th className="px-8 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">{t('activity.header_author')}</th>
                            <th className="px-8 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">{t('activity.header_category')}</th>
                            <th className="px-8 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">{t('activity.header_status')}</th>
                            <th className="px-8 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">{t('activity.header_time')}</th>
                            <th className="px-8 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">{t('common.actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {activities.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-8 py-5">
                                    <span className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors cursor-pointer">{item.title}</span>
                                </td>
                                <td className="px-8 py-5">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600">
                                            {item.author.charAt(0)}
                                        </div>
                                        <span className="text-sm font-bold text-slate-700">{item.author}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-5">
                                    <span className="inline-flex px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold">{item.category}</span>
                                </td>
                                <td className="px-8 py-5">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-bold ${getStatusStyle(item.status)}`}>
                                        {getStatusIcon(item.status)}
                                        {t(`status.${item.status}`)}
                                    </span>
                                </td>
                                <td className="px-8 py-5 text-sm font-medium text-slate-500 italic">
                                    {item.timestamp}
                                </td>
                                <td className="px-8 py-5 text-right">
                                    <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                                        <ExternalLink size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <StandardPagination
                    currentPage={1}
                    totalPages={10}
                    onPageChange={() => { }}
                />
            </div>
        </div>
    );
};

export default React.memo(RecentActivityTable);
