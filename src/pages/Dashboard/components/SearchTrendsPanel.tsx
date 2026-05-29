import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { ExternalLink, MapPin, RefreshCw, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { SearchTrendsData } from '@/dataHelper/dashboard.dataHelper';
import { Skeleton } from '@/components/ui/Skeleton';
import EmptyState from '@/components/common/EmptyState';
import ErrorWidget from '@/components/common/ErrorWidget';

interface Props {
    data?: SearchTrendsData;
    onRefresh?: () => void;
    isRefreshing?: boolean;
    isLoading?: boolean;
    isError?: boolean;
}

const SearchTrendsPanel = ({ data, onRefresh, isRefreshing, isLoading, isError }: Props) => {
    const { t } = useTranslation('dashboard');

    const keywords = data?.keywords ?? [];
    const clickedQueries = data?.clicked_queries ?? [];
    const zeroResultKeywords = data?.zero_result_keywords ?? [];
    const locations = data?.locations ?? [];
    const isEmpty = !isLoading && !isError && keywords.length === 0 && clickedQueries.length === 0 && zeroResultKeywords.length === 0 && locations.length === 0;

    return (
        <div className="bg-white rounded-[32px] border border-slate-200/60 shadow-sm overflow-hidden transition-all duration-300">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-base font-black text-slate-900 tracking-tighter">
                                {t('search_trends.title')}
                            </h3>
                        </div>
                        <p className="text-slate-400 text-[12px] font-bold">
                            {t('search_trends.subtitle', { days: data?.days ?? 7 })}
                        </p>
                    </div>
                    {onRefresh && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onRefresh(); }}
                            disabled={isRefreshing}
                            title={t('charts.refresh_chart')}
                            aria-label={t('charts.refresh_chart')}
                            className={`p-2 rounded-xl bg-slate-50 hover:bg-[#dff7f4] transition-all ${isRefreshing ? 'opacity-100 text-[#14b8a6] cursor-not-allowed' : 'text-slate-400 hover:text-[#14b8a6] active:scale-90'}`}
                        >
                            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
                        </button>
                    )}
                </div>

                <Link
                    to="/admin/locations"
                    className="text-xs font-black text-[#14b8a6] flex items-center gap-1 hover:underline whitespace-nowrap"
                >
                    {t('tables.view_all')} <ExternalLink size={12} />
                </Link>
            </div>

            <div className="p-6 min-h-[220px]">
                {isError ? (
                    <ErrorWidget
                        title={t('error_states.title')}
                        message={t('error_states.desc')}
                        onRetry={onRefresh}
                        className="rounded-4xl"
                    />
                ) : isEmpty ? (
                    <EmptyState
                        title={t('search_trends.empty')}
                        description={t('empty_states.no_data_desc')}
                        className="py-12"
                    />
                ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        <section className="rounded-3xl border border-slate-100 bg-slate-50/40 p-5">
                            <div className="flex items-center gap-2 mb-4">
                                <Search size={14} className="text-[#14b8a6]" />
                                <h4 className="text-sm font-black text-slate-900">
                                    {t('search_trends.keywords')}
                                </h4>
                            </div>

                            <div className="space-y-3">
                                {isLoading && keywords.length === 0 ? (
                                    Array.from({ length: 5 }).map((_, index) => (
                                        <div key={index} className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 border border-slate-100">
                                            <Skeleton className="h-4 w-32 rounded-md" />
                                            <Skeleton className="h-6 w-16 rounded-full" />
                                        </div>
                                    ))
                                ) : keywords.length > 0 ? (
                                    keywords.map((item, index) => (
                                        <div key={`${item.query}-${index}`} className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 border border-slate-100">
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-slate-900 truncate">{item.query}</p>
                                            </div>
                                            <span className="shrink-0 inline-flex items-center rounded-full bg-[#dff7f4] px-2.5 py-1 text-[11px] font-black text-[#0f766e]">
                                                {item.count.toLocaleString('vi-VN')} {t('search_trends.searches')}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm font-medium text-slate-400">{t('search_trends.empty_keywords')}</p>
                                )}
                            </div>
                        </section>

                        <section className="rounded-3xl border border-slate-100 bg-slate-50/40 p-5">
                            <div className="flex items-center gap-2 mb-4">
                                <Search size={14} className="text-[#14b8a6]" />
                                <h4 className="text-sm font-black text-slate-900">
                                    {t('search_trends.clicked_keywords')}
                                </h4>
                            </div>

                            <div className="space-y-3">
                                {isLoading && clickedQueries.length === 0 ? (
                                    Array.from({ length: 5 }).map((_, index) => (
                                        <div key={index} className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 border border-slate-100">
                                            <Skeleton className="h-4 w-32 rounded-md" />
                                            <Skeleton className="h-6 w-16 rounded-full" />
                                        </div>
                                    ))
                                ) : clickedQueries.length > 0 ? (
                                    clickedQueries.map((item, index) => (
                                        <div key={`${item.query}-${index}`} className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 border border-slate-100">
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-slate-900 truncate">{item.query}</p>
                                            </div>
                                            <span className="shrink-0 inline-flex items-center rounded-full bg-[#dff7f4] px-2.5 py-1 text-[11px] font-black text-[#0f766e]">
                                                {item.count.toLocaleString('vi-VN')} {t('search_trends.clicks')}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm font-medium text-slate-400">{t('search_trends.empty_clicked_keywords')}</p>
                                )}
                            </div>
                        </section>

                        <section className="rounded-3xl border border-slate-100 bg-slate-50/40 p-5">
                            <div className="flex items-center gap-2 mb-4">
                                <Search size={14} className="text-amber-500" />
                                <h4 className="text-sm font-black text-slate-900">
                                    {t('search_trends.zero_result_keywords')}
                                </h4>
                            </div>

                            <div className="space-y-3">
                                {isLoading && zeroResultKeywords.length === 0 ? (
                                    Array.from({ length: 5 }).map((_, index) => (
                                        <div key={index} className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 border border-slate-100">
                                            <Skeleton className="h-4 w-32 rounded-md" />
                                            <Skeleton className="h-6 w-16 rounded-full" />
                                        </div>
                                    ))
                                ) : zeroResultKeywords.length > 0 ? (
                                    zeroResultKeywords.map((item, index) => (
                                        <div key={`${item.query}-${index}`} className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 border border-slate-100">
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-slate-900 truncate">{item.query}</p>
                                            </div>
                                            <span className="shrink-0 inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-black text-amber-700">
                                                {item.count.toLocaleString('vi-VN')} {t('search_trends.searches')}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm font-medium text-slate-400">{t('search_trends.empty_zero_result_keywords')}</p>
                                )}
                            </div>
                        </section>

                        <section className="rounded-3xl border border-slate-100 bg-slate-50/40 p-5">
                            <div className="flex items-center gap-2 mb-4">
                                <MapPin size={14} className="text-[#14b8a6]" />
                                <h4 className="text-sm font-black text-slate-900">
                                    {t('search_trends.locations')}
                                </h4>
                            </div>

                            <div className="space-y-3">
                                {isLoading && locations.length === 0 ? (
                                    Array.from({ length: 5 }).map((_, index) => (
                                        <div key={index} className="rounded-2xl bg-white px-4 py-3 border border-slate-100">
                                            <Skeleton className="h-4 w-28 rounded-md mb-2" />
                                            <Skeleton className="h-3 w-24 rounded-md mb-3" />
                                            <Skeleton className="h-6 w-20 rounded-full" />
                                        </div>
                                    ))
                                ) : locations.length > 0 ? (
                                    locations.map((item) => (
                                        <div key={item.id} className="rounded-2xl bg-white px-4 py-3 border border-slate-100">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold text-slate-900 truncate">{item.name}</p>
                                                    <p className="text-xs font-semibold text-slate-400 mt-1 truncate">
                                                        {item.district || t('search_trends.no_district')}
                                                    </p>
                                                </div>
                                                <span className="shrink-0 inline-flex items-center rounded-full bg-[#dff7f4] px-2.5 py-1 text-[11px] font-black text-[#0f766e]">
                                                    {item.view_count.toLocaleString('vi-VN')} {t('search_trends.views')}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm font-medium text-slate-400">{t('search_trends.empty_locations')}</p>
                                )}
                            </div>
                        </section>
                    </div>
                )}
            </div>
        </div>
    );
};

export default memo(SearchTrendsPanel);
