import React, { useState } from 'react';
import { 
    Search, 
    RotateCcw, 
    ThumbsUp, 
    ThumbsDown, 
    ChevronRight, 
    Activity,
    Brain,
    X,
    ExternalLink,
    AlertTriangle,
    CheckCircle,
    Bot,
    RefreshCw,
    Inbox
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useChatbotLogs } from '@/hooks/useChatbotQueries';
import type { ChatLog } from '@/api/chatbotApi';
import { TextInput } from '@/components/ui/TextInput';
import CustomSelect, { type Option } from '@/components/ui/CustomSelect';

export default function LogsTab() {
    const { t, i18n } = useTranslation('chatbot');
    const [search, setSearch] = useState('');
    const [intent, setIntent] = useState('');
    const [cacheHit, setCacheHit] = useState('');
    const [rating, setRating] = useState<'positive' | 'negative' | ''>('');
    const [page, setPage] = useState(1);

    // API params
    const logParams = {
        page,
        search: search.trim() || undefined,
        intent: intent || undefined,
        cache_hit: cacheHit === '' ? undefined : cacheHit === 'true',
        rating: rating || undefined,
    };

    const { data: logsData, isLoading, isError, refetch } = useChatbotLogs(logParams);

    // Selected log for detailed view Modal
    const [selectedLog, setSelectedLog] = useState<ChatLog | null>(null);

    const intentOptions: Option[] = [
        { value: '', label: t('logs.all_intents') },
        { value: 'tour', label: t('intents.tour') },
        { value: 'booking', label: t('intents.booking') },
        { value: 'location', label: t('intents.location') },
        { value: 'food', label: t('intents.food') },
        { value: 'hotel', label: t('intents.hotel') },
        { value: 'blog', label: t('intents.blog') },
        { value: 'schedule', label: t('intents.schedule') },
        { value: 'payment', label: t('intents.payment') },
        { value: 'refund', label: t('intents.refund') },
        { value: 'loyalty', label: t('intents.loyalty') },
        { value: 'greeting', label: t('intents.greeting') },
        { value: 'handoff', label: t('intents.handoff') },
        { value: 'unknown', label: t('intents.unknown') },
    ];

    const cacheOptions: Option[] = [
        { value: '', label: t('logs.all_cache') },
        { value: 'true', label: t('logs.cache_hit_filter') },
        { value: 'false', label: t('logs.cache_miss_filter') },
    ];

    const ratingOptions: Option[] = [
        { value: '', label: t('logs.all_ratings') },
        { value: 'positive', label: t('logs.rating_positive_filter') },
        { value: 'negative', label: t('logs.rating_negative_filter') },
    ];

    const handleReset = () => {
        setSearch('');
        setIntent('');
        setCacheHit('');
        setRating('');
        setPage(1);
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= (logsData?.last_page || 1)) {
            setPage(newPage);
        }
    };

    const currentIntentOpt = intentOptions.find(o => o.value === intent) || intentOptions[0];
    const currentCacheOpt = cacheOptions.find(o => o.value === cacheHit) || cacheOptions[0];
    const currentRatingOpt = ratingOptions.find(o => o.value === rating) || ratingOptions[0];

    const hasActiveFilters = !!(search || intent || cacheHit || rating);

    return (
        <div className="space-y-6">
            {/* Filter Bar */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-xs space-y-4">
                <div className="flex flex-col lg:flex-row items-center gap-4">
                    {/* Search Input */}
                    <div className="relative w-full lg:flex-1">
                        <TextInput
                            placeholder={t('logs.search_placeholder')}
                            value={search}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setSearch(e.target.value); setPage(1); }}
                            leftIcon={<Search size={18} className="text-slate-400" />}
                            className="w-full bg-slate-50 font-bold border-slate-200 focus:border-[#14B8A6] focus:ring-4 focus:ring-[#14B8A6]/12 rounded-2xl h-[52px] pr-11"
                        />
                    </div>

                    {/* Intent Select */}
                    <div className="w-full lg:w-[220px]">
                        <CustomSelect
                            options={intentOptions}
                            value={currentIntentOpt}
                            onChange={(opt: Option | null) => { setIntent(String(opt?.value || '')); setPage(1); }}
                            leftIcon={<Bot size={18} />}
                        />
                    </div>

                    {/* Cache Select */}
                    <div className="w-full lg:w-[220px]">
                        <CustomSelect
                            options={cacheOptions}
                            value={currentCacheOpt}
                            onChange={(opt: Option | null) => { setCacheHit(String(opt?.value || '')); setPage(1); }}
                            leftIcon={<Activity size={18} />}
                        />
                    </div>

                    {/* Rating Select */}
                    <div className="w-full lg:w-[240px]">
                        <CustomSelect
                            options={ratingOptions}
                            value={currentRatingOpt}
                            onChange={(opt: Option | null) => { setRating((opt?.value || '') as 'positive' | 'negative' | ''); setPage(1); }}
                            leftIcon={<ThumbsDown size={18} />}
                        />
                    </div>

                    {/* Reset Button */}
                    {hasActiveFilters && (
                        <button
                            onClick={handleReset}
                            className="w-full lg:w-auto h-[52px] px-6 rounded-2xl border border-slate-200 text-slate-500 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50/30 transition-all duration-300 font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shrink-0"
                        >
                            <RotateCcw size={16} />
                            {t('logs.reset')}
                        </button>
                    )}
                </div>
            </div>

            {/* Logs List Section */}
            <div className="bg-white rounded-[24px] border border-slate-200/60 shadow-xs overflow-hidden">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-24">
                        <RefreshCw className="w-8 h-8 text-[#14b8a6] animate-spin mb-4" />
                        <p className="text-slate-400 font-bold text-xs">{t('logs.loading')}</p>
                    </div>
                ) : isError ? (
                    <div className="text-center py-20">
                        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
                        <h4 className="text-slate-900 font-black text-sm">{t('logs.error_title')}</h4>
                        <p className="text-slate-400 text-xs mt-1">{t('logs.error_desc')}</p>
                        <button onClick={() => refetch()} className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer">{t('logs.try_again')}</button>
                    </div>
                ) : !logsData || logsData.data.length === 0 ? (
                    <div className="text-center py-24 space-y-4">
                        <Inbox className="w-12 h-12 text-slate-300 mx-auto" />
                        <div>
                            <h4 className="text-slate-900 font-black text-sm">{t('logs.no_logs_title')}</h4>
                            <p className="text-slate-400 text-xs mt-1">{t('logs.no_logs_desc')}</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col">
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-left text-xs">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                                        <th className="p-4 pl-6">{t('logs.time_col')}</th>
                                        <th className="p-4">{t('logs.intent_col')}</th>
                                        <th className="p-4">{t('logs.question_col')}</th>
                                        <th className="p-4">{t('logs.source_col')}</th>
                                        <th className="p-4 text-center">{t('logs.latency_col')}</th>
                                        <th className="p-4 text-center">{t('logs.rating_col')}</th>
                                        <th className="p-4 pr-6 text-right">{t('logs.detail_col')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {logsData.data.map((log) => {
                                        const isNegative = log.metadata?.rating === 'negative';
                                        const isPositive = log.metadata?.rating === 'positive';
                                        const latency = log.metadata?.latency_ms;

                                        return (
                                            <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="p-4 pl-6 text-slate-400 whitespace-nowrap">
                                                    {new Date(log.created_at).toLocaleString(i18n.language === 'vi' ? 'vi-VN' : 'en-US')}
                                                </td>
                                                <td className="p-4">
                                                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-black border uppercase tracking-wider whitespace-nowrap ${
                                                        log.intent === 'unknown'
                                                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                                                            : log.intent === 'handoff'
                                                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                                                            : 'bg-teal-50 text-teal-700 border-teal-100'
                                                    }`}>
                                                        {t(`intents.${log.intent}`, log.intent)}
                                                    </span>
                                                </td>
                                                <td className="p-4 max-w-sm truncate text-slate-700 font-bold" title={log.question}>
                                                    {log.question}
                                                </td>
                                                <td className="p-4 whitespace-nowrap">
                                                    {log.cache_hit ? (
                                                        <span className="flex items-center gap-1 text-[#0f766e] font-black text-[11px]">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-[#14b8a6]"></span>
                                                            {t('logs.cache_hit')}
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1 text-slate-500 font-bold text-[11px]">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                                                            {t('logs.cache_miss')}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="p-4 text-center text-slate-500 font-bold whitespace-nowrap">
                                                    {latency ? `${latency} ms` : '-'}
                                                </td>
                                                <td className="p-4 text-center">
                                                    {isPositive && (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-green-50 text-green-700 rounded-full font-bold border border-green-100">
                                                            <ThumbsUp className="w-3 h-3 fill-green-700/10" /> {t('logs.rating_positive')}
                                                        </span>
                                                    )}
                                                    {isNegative && (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-rose-50 text-rose-700 rounded-full font-bold border border-rose-100">
                                                            <ThumbsDown className="w-3 h-3 fill-rose-700/10" /> {t('logs.rating_negative')}
                                                        </span>
                                                    )}
                                                    {!isPositive && !isNegative && (
                                                        <span className="text-slate-300">-</span>
                                                    )}
                                                </td>
                                                <td className="p-4 pr-6 text-right">
                                                    <button
                                                        onClick={() => setSelectedLog(log)}
                                                        className="p-1.5 bg-slate-50 hover:bg-[#dff7f4] text-slate-400 hover:text-[#14b8a6] rounded-lg transition-colors cursor-pointer"
                                                        title={t('logs.detail_col')}
                                                    >
                                                        <ChevronRight size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Row */}
                        {logsData.last_page > 1 && (
                            <div className="flex items-center justify-between p-6 border-t border-slate-100 bg-white">
                                <p className="text-xs font-bold text-slate-500">
                                    {t('logs.pagination_info', { page: logsData.current_page, totalPages: logsData.last_page })}
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handlePageChange(page - 1)}
                                        disabled={page === 1}
                                        className="px-4 py-2 border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-xs transition-all cursor-pointer"
                                    >
                                        {t('logs.pagination_prev')}
                                    </button>
                                    <button
                                        onClick={() => handlePageChange(page + 1)}
                                        disabled={page === logsData.last_page}
                                        className="px-4 py-2 border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-xs transition-all cursor-pointer"
                                    >
                                        {t('logs.pagination_next')}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modal: View Log Details */}
            {selectedLog && (
                <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs">
                    <div className="bg-white rounded-[32px] w-full max-w-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center shrink-0">
                            <div>
                                <h3 className="text-base font-black text-slate-900">{t('logs.dialog_title')}</h3>
                                <p className="text-[11px] text-slate-400 font-bold">Session ID: {selectedLog.session_id}</p>
                            </div>
                            <button
                                onClick={() => setSelectedLog(null)}
                                className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-900 rounded-full transition-colors cursor-pointer"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
                            {/* Dialogue Display */}
                            <div className="space-y-4">
                                <div className="flex gap-3 items-start">
                                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-600 shrink-0">
                                        {t('logs.customer_label')}
                                    </div>
                                    <div className="flex-1 bg-slate-50 p-4 rounded-2xl border border-slate-200/60 font-bold text-slate-800 leading-relaxed">
                                        "{selectedLog.question}"
                                    </div>
                                </div>

                                <div className="flex gap-3 items-start">
                                    <div className="w-8 h-8 rounded-lg bg-[#dff7f4] flex items-center justify-center font-bold text-[#0f766e] shrink-0">
                                        {t('logs.ai_label')}
                                    </div>
                                    <div className="flex-1 bg-[#dff7f4]/20 p-4 rounded-2xl border border-[#ccfbf1]/80 text-[#0f766e] font-medium leading-relaxed whitespace-pre-wrap">
                                        {selectedLog.answer}
                                    </div>
                                </div>
                            </div>

                            <hr className="border-slate-100" />

                            {/* Technical Metadata Grid */}
                            <div>
                                <h5 className="font-black text-slate-900 mb-3 flex items-center gap-1.5"><Brain className="w-4 h-4 text-[#14b8a6]" /> {t('logs.processing_title')}</h5>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                    <div>
                                        <p className="text-slate-400 font-bold text-[10px] uppercase">{t('logs.intent_label')}</p>
                                        <p className="text-slate-800 font-black mt-0.5">{t(`intents.${selectedLog.intent}`, selectedLog.intent)}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-400 font-bold text-[10px] uppercase">{t('logs.latency_label')}</p>
                                        <p className="text-slate-800 font-black mt-0.5">{selectedLog.metadata?.latency_ms ? `${selectedLog.metadata.latency_ms} ms` : '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-400 font-bold text-[10px] uppercase">{t('logs.tokens_label')}</p>
                                        <p className="text-slate-800 font-black mt-0.5">{selectedLog.tokens_used ? `${selectedLog.tokens_used} tokens` : '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-400 font-bold text-[10px] uppercase">{t('logs.cache_status_label')}</p>
                                        <p className="text-slate-800 font-black mt-0.5">{selectedLog.cache_hit ? t('logs.cache_hit_status') : t('logs.cache_miss_status')}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Parsed Slots / Understanding */}
                            {(selectedLog.metadata?.session_slots || selectedLog.metadata?.understanding) && (
                                <div>
                                    <h5 className="font-black text-slate-900 mb-3">{t('logs.slots_title')}</h5>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                            <p className="text-[#0f766e] font-black mb-2 text-[10px] uppercase">{t('logs.session_slots_label')}</p>
                                            {selectedLog.metadata?.session_slots ? (
                                                <pre className="text-[10px] text-slate-600 font-mono overflow-x-auto">
                                                    {JSON.stringify(selectedLog.metadata.session_slots, null, 2)}
                                                </pre>
                                            ) : (
                                                <span className="text-slate-400 italic">{t('logs.empty_label')}</span>
                                            )}
                                        </div>
                                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                            <p className="text-blue-700 font-black mb-2 text-[10px] uppercase">{t('logs.understanding_label')}</p>
                                            {selectedLog.metadata?.understanding ? (
                                                <pre className="text-[10px] text-slate-600 font-mono overflow-x-auto">
                                                    {JSON.stringify(selectedLog.metadata.understanding, null, 2)}
                                                </pre>
                                            ) : (
                                                <span className="text-slate-400 italic">{t('logs.empty_label')}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Warnings / Guardrail Alerts */}
                            {selectedLog.metadata?.warnings && selectedLog.metadata.warnings.length > 0 && (
                                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex gap-3 items-start">
                                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                                    <div>
                                        <p className="font-black text-amber-800">{t('logs.guardrail_warnings')}</p>
                                        <ul className="list-disc list-inside text-amber-700 mt-1 font-semibold space-y-0.5">
                                            {selectedLog.metadata.warnings.map((warn: string, idx: number) => (
                                                <li key={idx}>{warn}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}

                            {/* Feedback Rating Logs */}
                            {selectedLog.metadata?.rating && (
                                <div className={`p-4 rounded-2xl border flex gap-3 items-center ${
                                    selectedLog.metadata.rating === 'positive'
                                        ? 'bg-green-50 border-green-200 text-green-800'
                                        : 'bg-rose-50 border-rose-200 text-rose-800'
                                }`}>
                                    {selectedLog.metadata.rating === 'positive' ? (
                                        <>
                                            <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
                                            <p className="font-semibold">{t('logs.feedback_positive')}</p>
                                        </>
                                    ) : (
                                        <>
                                            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                                            <div>
                                                <p className="font-black">{t('logs.feedback_negative_title')}</p>
                                                <p className="text-xs font-semibold text-rose-700 mt-0.5">{t('logs.feedback_negative_desc')}</p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Modal Footer / Quick links */}
                        <div className="p-6 border-t border-slate-100 bg-slate-50 shrink-0 flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
                            <span className="text-[10px] text-slate-400 font-bold">{t('logs.feedback_loop_title')}</span>
                            <div className="flex gap-2">
                                <a
                                    href="/admin/blog-posts"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all"
                                >
                                    {t('logs.btn_update_rag')}
                                    <ExternalLink size={12} />
                                </a>
                                <div className="relative group/tooltip">
                                    <button
                                        type="button"
                                        className="px-4 py-2.5 bg-[#14b8a6] hover:bg-[#0f766e] text-white font-bold text-xs rounded-xl transition-all cursor-help"
                                    >
                                        {t('logs.btn_update_rules')}
                                    </button>
                                    <div className="absolute bottom-full right-0 mb-2 w-64 bg-slate-900 text-white text-[10px] p-3 rounded-xl shadow-xl opacity-0 pointer-events-none group-hover/tooltip:opacity-100 transition-opacity leading-relaxed font-bold z-50 border border-slate-800">
                                        {t('logs.rules_tooltip')}
                                        <code className="block mt-1 p-1 bg-slate-800 rounded text-amber-400 font-mono text-[9px] break-all">
                                            config/chat_consistency.php
                                        </code>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
