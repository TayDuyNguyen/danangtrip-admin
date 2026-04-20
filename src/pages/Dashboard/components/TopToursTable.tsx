import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';
import { ExternalLink, Star, RefreshCw } from 'lucide-react';
import type { TopTour } from '@/dataHelper/dashboard.dataHelper';
import { Skeleton } from '@/components/ui/Skeleton';

interface Props {
    topTours: TopTour[];
    onRefresh?: () => void;
    isRefreshing?: boolean;
    isLoading?: boolean;
}

const TopToursTable = ({ topTours, onRefresh, isRefreshing, isLoading }: Props) => {
    const { t } = useTranslation('dashboard');
    return (
        <div className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-sm overflow-hidden group/card transition-all duration-300">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div>
                        <h3 className="text-base font-black text-slate-900 tracking-tighter">{t('tables.top_tours')}</h3>
                        <p className="text-slate-400 text-[12px] font-bold">{t('tables.subtitle_top_tours')}</p>
                    </div>
                    {onRefresh && (
                        <button 
                            onClick={(e) => { e.stopPropagation(); onRefresh(); }}
                            disabled={isRefreshing}
                            title={t('charts.refresh_chart')}
                            aria-label={t('charts.refresh_chart')}
                            className={`p-2 rounded-xl bg-slate-50 hover:bg-blue-50 transition-all ${isRefreshing ? 'opacity-100 text-blue-600 cursor-not-allowed' : 'text-slate-400 hover:text-blue-600 active:scale-90 group-hover/card:opacity-100 opacity-0 lg:opacity-0'}`}
                        >
                            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
                        </button>
                    )}
                </div>
                <button className="text-xs font-black text-blue-600 flex items-center gap-1 hover:underline">
                    {t('tables.view_all')} <ExternalLink size={12} />
                </button>
            </div>

            <div className="max-w-full overflow-x-auto custom-scrollbar-horizontal">
                <table className="w-full min-w-[860px] text-left">
                    <thead className="bg-slate-50/50">
                        <tr>
                            <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('tables.header_rank')}</th>
                            <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('tables.header_tour')}</th>
                            <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">{t('tables.header_sales')}</th>
                            <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">{t('tables.header_revenue')}</th>
                            <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">{t('tables.header_rating')}</th>
                            <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">{t('tables.header_status')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i}>
                                    <td className="px-6 py-4"><Skeleton className="w-7 h-7 rounded-xl" /></td>
                                    <td className="px-6 py-4 flex gap-3">
                                        <Skeleton className="w-12 h-9 rounded-xl" />
                                        <div className="flex flex-col gap-1">
                                            <Skeleton className="w-32 h-4 rounded-md" />
                                            <Skeleton className="w-16 h-3 rounded-md" />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4"><Skeleton className="w-10 h-4 rounded-md mx-auto" /></td>
                                    <td className="px-6 py-4"><Skeleton className="w-20 h-4 rounded-md ml-auto" /></td>
                                    <td className="px-6 py-4"><Skeleton className="w-12 h-6 rounded-lg mx-auto" /></td>
                                    <td className="px-6 py-4"><Skeleton className="w-16 h-6 rounded-lg mx-auto" /></td>
                                </tr>
                            ))
                        ) : (
                            topTours.map((tour, index) => (
                                <tr key={tour.id} className="hover:bg-slate-50/40 transition-colors group">
                                    <td className="px-6 py-4">
                                        <span className={`w-7 h-7 flex items-center justify-center rounded-xl text-[12px] font-black 
                                            ${index === 0 ? 'bg-amber-50 text-amber-600' : 
                                              index === 1 ? 'bg-slate-100 text-slate-600' :
                                              index === 2 ? 'bg-orange-50 text-orange-600' : 'bg-slate-50 text-slate-400'}`}>
                                            {index + 1}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-9 rounded-xl overflow-hidden border border-slate-100 shrink-0">
                                                <img src={tour.thumbnail || tour.image} alt={tour.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                            </div>
                                            <div>
                                                <p className="text-[13px] font-black text-slate-900 line-clamp-1">{tour.title}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{tour.category || '-'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="text-[13px] font-black text-slate-700">{tour.sales_count.toLocaleString(i18n.language === 'vi' ? 'vi-VN' : 'en-US')}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="text-[13px] font-black text-slate-900">{tour.revenue.toLocaleString(i18n.language === 'vi' ? 'vi-VN' : 'en-US')} {t('currency', { ns: 'common' })}</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {tour.rating ? (
                                            <span className="inline-flex items-center gap-0.5 text-[11px] font-black px-2 py-1 rounded-lg bg-amber-50 text-amber-600">
                                                <Star size={12} className="fill-current" />
                                                {tour.rating}
                                            </span>
                                        ) : (
                                            <span className="text-slate-300 font-bold">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {tour.status ? (
                                            <span className={`px-2 py-1 text-[10px] font-black rounded-lg uppercase tracking-wider
                                                ${tour.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 
                                                  tour.status === 'full' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                                                {t(`status.${tour.status}`)}
                                            </span>
                                        ) : (
                                            <span className="text-slate-300">-</span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default memo(TopToursTable);
