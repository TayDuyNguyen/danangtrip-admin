import { useState, useEffect } from 'react';
import { 
    Trash2, 
    Database, 
    Cpu, 
    AlertTriangle, 
    RefreshCw, 
    Search,
    Sliders,
    Zap,
    Clock,
    Lock
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSettings, useUpdateSettingGroups } from '@/hooks/useSettingQueries';
import { 
    useChatbotCache, 
    useDeleteCache, 
    useClearAllCache 
} from '@/hooks/useChatbotQueries';
import ToggleSwitch from '@/components/ui/ToggleSwitch';
import ChatbotCacheConfirmDialog from './ChatbotCacheConfirmDialog';

type CacheConfirmMode = 'delete' | 'clearAll' | null;

export default function CacheSettingsTab({
    fetchEnabled = true,
}: {
    isActive?: boolean;
    fetchEnabled?: boolean;
}) {
    const { t } = useTranslation('chatbot');

    const [confirmMode, setConfirmMode] = useState<CacheConfirmMode>(null);
    const [pendingDeleteHash, setPendingDeleteHash] = useState<string | null>(null);

    const { data: settings, isLoading: isSettingsLoading, isError: isSettingsError } = useSettings({
        enabled: fetchEnabled,
    });
    const updateSettingsMutation = useUpdateSettingGroups();

    // Local form state
    const [enabled, setEnabled] = useState(true);
    const [clarificationLimit, setClarificationLimit] = useState(2);
    const [cacheTtl, setCacheTtl] = useState(86400);
    const [thresholdTransactional, setThresholdTransactional] = useState(0.97);
    const [thresholdFaq, setThresholdFaq] = useState(0.92);

    // Sync settings data when loaded
    /* eslint-disable react-hooks/set-state-in-effect */
    useEffect(() => {
        if (settings?.chatbot) {
            setEnabled(settings.chatbot.enabled);
            setClarificationLimit(settings.chatbot.clarification_attempt_limit);
            setCacheTtl(settings.chatbot.cache_ttl_seconds);
            setThresholdTransactional(settings.chatbot.cache.threshold_transactional);
            setThresholdFaq(settings.chatbot.cache.threshold_faq);
        }
    }, [settings]);
    /* eslint-enable react-hooks/set-state-in-effect */

    // 2. Cache state & hooks
    const { data: caches = [], isLoading: isCacheLoading, refetch: refetchCache, isFetching: isCacheFetching } = useChatbotCache({
        enabled: fetchEnabled,
    });
    const deleteCacheMutation = useDeleteCache();
    const clearAllCacheMutation = useClearAllCache();
    const [cacheSearch, setCacheSearch] = useState('');

    // Filter caches client-side
    const filteredCaches = caches.filter(c => 
        c.normalized_question.toLowerCase().includes(cacheSearch.toLowerCase()) ||
        c.intent.toLowerCase().includes(cacheSearch.toLowerCase())
    );

    // Handle Save Settings
    const handleSaveSettings = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await updateSettingsMutation.mutateAsync({
                chatbot: {
                    enabled,
                    clarification_attempt_limit: Number(clarificationLimit),
                    cache_ttl_seconds: Number(cacheTtl),
                    cache: {
                        threshold_transactional: Number(thresholdTransactional),
                        threshold_faq: Number(thresholdFaq),
                    },
                },
            });
        } catch {
            // Toast handled by mutation hook
        }
    };

    const isSaving = updateSettingsMutation.isPending;
    const isConfirmMutating = deleteCacheMutation.isPending || clearAllCacheMutation.isPending;

    const closeConfirm = () => {
        if (isConfirmMutating) return;
        setConfirmMode(null);
        setPendingDeleteHash(null);
    };

    const handleConfirmCacheAction = () => {
        if (confirmMode === 'clearAll') {
            clearAllCacheMutation.mutate(undefined, {
                onSuccess: () => closeConfirm(),
            });
            return;
        }
        if (confirmMode === 'delete' && pendingDeleteHash) {
            deleteCacheMutation.mutate(pendingDeleteHash, {
                onSuccess: () => closeConfirm(),
            });
        }
    };

    const confirmTitle =
        confirmMode === 'clearAll'
            ? t('settings.clear_all_confirm_title')
            : t('settings.delete_cache_confirm_title');

    const confirmMessage =
        confirmMode === 'clearAll'
            ? t('settings.clear_all_confirm')
            : t('settings.delete_cache_confirm');

    const confirmLabel =
        confirmMode === 'clearAll' ? t('settings.clear_all') : t('settings.delete_cache_tooltip');

    return (
        <>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
            {/* Column 1 & 2: Active Semantic Cache Management */}
            <div className="xl:col-span-2 bg-white p-6 rounded-[24px] border border-slate-200/60 shadow-xs space-y-6 flex flex-col min-h-[550px]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
                    <div>
                        <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                            <Database className="w-5 h-5 text-[#14b8a6]" />
                            {t('settings.cache_title')}
                        </h3>
                        <p className="text-[11px] text-slate-400 font-bold">{t('settings.cache_subtitle')}</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => refetchCache()}
                            disabled={isCacheFetching}
                            className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-xl border border-slate-200 transition-all cursor-pointer disabled:opacity-50"
                            title={t('settings.refresh_cache')}
                        >
                            <RefreshCw className={`w-4 h-4 ${isCacheFetching ? 'animate-spin' : ''}`} />
                        </button>
                        {caches.length > 0 && (
                            <button
                                type="button"
                                onClick={() => setConfirmMode('clearAll')}
                                disabled={clearAllCacheMutation.isPending}
                                data-testid="chatbot-clear-all-cache"
                                className="flex items-center gap-1.5 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-xl text-xs transition-all cursor-pointer disabled:opacity-50"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                {t('settings.clear_all')}
                            </button>
                        )}
                    </div>
                </div>

                {/* Local Cache Search */}
                <div className="relative shrink-0">
                    <Search className="w-4.5 h-4.5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder={t('settings.search_placeholder')}
                        value={cacheSearch}
                        onChange={(e) => setCacheSearch(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 font-bold border border-slate-200 focus:border-[#14B8A6] focus:ring-4 focus:ring-[#14B8A6]/12 rounded-2xl text-xs outline-none transition-all"
                    />
                </div>

                {/* Cache Table */}
                <div className="flex-1 min-h-0 overflow-y-auto border border-slate-100 rounded-2xl">
                    {isCacheLoading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <RefreshCw className="w-8 h-8 text-[#14b8a6] animate-spin mb-4" />
                            <p className="text-slate-400 font-bold text-xs">{t('settings.loading_cache')}</p>
                        </div>
                    ) : filteredCaches.length === 0 ? (
                        <div className="text-center py-20 text-slate-400 text-xs">
                            <Database className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                            {caches.length === 0 ? t('settings.no_cache') : t('settings.no_cache_search')}
                        </div>
                    ) : (
                        <table className="w-full border-collapse text-left text-xs">
                            <thead>
                                <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider">
                                    <th className="p-3.5 pl-4">{t('settings.col_normalized')}</th>
                                    <th className="p-3.5">{t('settings.col_intent')}</th>
                                    <th className="p-3.5 text-center">{t('settings.col_model')}</th>
                                    <th className="p-3.5 pr-4 text-right">{t('settings.col_action')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredCaches.map((c) => (
                                    <tr key={c.question_hash} className="hover:bg-slate-50/50">
                                        <td className="p-3.5 pl-4 font-bold text-slate-700 max-w-sm truncate" title={c.normalized_question}>
                                            {c.normalized_question}
                                        </td>
                                        <td className="p-3.5">
                                            <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-600 rounded font-semibold">
                                                {t(`intents.${c.intent}`, c.intent)}
                                            </span>
                                        </td>
                                        <td className="p-3.5 text-center text-slate-400 font-medium whitespace-nowrap">
                                            {c.model}
                                        </td>
                                        <td className="p-3.5 pr-4 text-right">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setPendingDeleteHash(c.question_hash);
                                                    setConfirmMode('delete');
                                                }}
                                                disabled={deleteCacheMutation.isPending}
                                                className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                                                title={t('settings.delete_cache_tooltip')}
                                                aria-label={t('settings.delete_cache_tooltip')}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Column 3: Chatbot Parameter Configuration */}
            <div className="bg-white p-6 rounded-[24px] border border-slate-200/60 shadow-xs space-y-6">
                <div>
                    <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                        <Sliders className="w-5 h-5 text-[#14b8a6]" />
                        {t('settings.param_title')}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-bold">{t('settings.param_subtitle')}</p>
                </div>

                {isSettingsLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <RefreshCw className="w-6 h-6 text-[#14b8a6] animate-spin mb-4" />
                        <p className="text-slate-400 font-bold text-[10px]">{t('settings.loading_settings')}</p>
                    </div>
                ) : isSettingsError ? (
                    <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex gap-3 items-center text-xs text-rose-700">
                        <AlertTriangle className="w-5 h-5 shrink-0" />
                        {t('settings.error_settings')}
                    </div>
                ) : (
                    <form onSubmit={handleSaveSettings} className="space-y-6 text-xs">
                        {/* Toggle Enabled */}
                        <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                            <div>
                                <h4 className="font-black text-slate-900">{t('settings.enable_title')}</h4>
                                <p className="text-[10px] text-slate-400 mt-0.5">{t('settings.enable_subtitle')}</p>
                            </div>
                            <ToggleSwitch enabled={enabled} onChange={setEnabled} />
                        </div>

                        {/* Clarification Attempt Limit */}
                        <div className="space-y-2">
                            <label className="font-bold text-slate-700 flex items-center gap-1.5">
                                <Cpu className="w-4 h-4 text-[#14b8a6]" />
                                {t('settings.limit_title')}
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="5"
                                value={clarificationLimit}
                                onChange={(e) => setClarificationLimit(Number(e.target.value))}
                                className="w-full p-3 bg-slate-50 font-bold border border-slate-200 focus:border-[#14B8A6] focus:ring-4 focus:ring-[#14B8A6]/12 rounded-2xl outline-none transition-all"
                            />
                            <p className="text-[10px] text-slate-400 leading-relaxed">
                                {t('settings.limit_desc')}
                            </p>
                        </div>

                        {/* Cache TTL */}
                        <div className="space-y-2">
                            <label className="font-bold text-slate-700 flex items-center gap-1.5">
                                <Clock className="w-4 h-4 text-[#14b8a6]" />
                                {t('settings.ttl_title')}
                            </label>
                            <input
                                type="number"
                                min="60"
                                value={cacheTtl}
                                onChange={(e) => setCacheTtl(Number(e.target.value))}
                                className="w-full p-3 bg-slate-50 font-bold border border-slate-200 focus:border-[#14B8A6] focus:ring-4 focus:ring-[#14B8A6]/12 rounded-2xl outline-none transition-all"
                            />
                            <p className="text-[10px] text-slate-400 leading-relaxed">
                                {t('settings.ttl_desc')}
                            </p>
                        </div>

                        <hr className="border-slate-100" />

                        {/* Dynamic Cosine Thresholds */}
                        <div className="space-y-4">
                            <h4 className="font-black text-slate-900 flex items-center gap-1.5">
                                <Zap className="w-4 h-4 text-[#14b8a6]" />
                                {t('settings.similarity_title')}
                            </h4>
                            <p className="text-[10px] text-slate-400 leading-relaxed">
                                {t('settings.similarity_desc')}
                            </p>

                            {/* Slider 1: Transactional */}
                            <div className="space-y-2">
                                <div className="flex justify-between font-bold text-slate-700">
                                    <span>{t('settings.slider_transactional')}</span>
                                    <span className="text-[#0f766e] font-black">{thresholdTransactional.toFixed(2)}</span>
                                </div>
                                <input
                                    type="range"
                                    min="0.80"
                                    max="1.00"
                                    step="0.01"
                                    value={thresholdTransactional}
                                    onChange={(e) => setThresholdTransactional(Number(e.target.value))}
                                    className="w-full accent-[#14b8a6] cursor-pointer"
                                />
                                <div className="flex justify-between text-[9px] text-slate-400 font-bold uppercase">
                                    <span>{t('settings.slider_low')}</span>
                                    <span>{t('settings.slider_high')}</span>
                                </div>
                                <p className="text-[9px] text-slate-400 flex items-center gap-1 font-medium leading-normal bg-slate-50 p-2.5 rounded-lg border border-slate-100 mt-1">
                                    <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                    {t('settings.slider_transactional_desc')}
                                </p>
                            </div>

                            {/* Slider 2: FAQ */}
                            <div className="space-y-2 mt-4">
                                <div className="flex justify-between font-bold text-slate-700">
                                    <span>{t('settings.slider_faq')}</span>
                                    <span className="text-[#0f766e] font-black">{thresholdFaq.toFixed(2)}</span>
                                </div>
                                <input
                                    type="range"
                                    min="0.80"
                                    max="1.00"
                                    step="0.01"
                                    value={thresholdFaq}
                                    onChange={(e) => setThresholdFaq(Number(e.target.value))}
                                    className="w-full accent-[#14b8a6] cursor-pointer"
                                />
                                <div className="flex justify-between text-[9px] text-slate-400 font-bold uppercase">
                                    <span>{t('settings.slider_low')}</span>
                                    <span>{t('settings.slider_high')}</span>
                                </div>
                                <p className="text-[9px] text-slate-400 font-medium leading-normal bg-slate-50 p-2.5 rounded-lg border border-slate-100 mt-1">
                                    {t('settings.slider_faq_desc')}
                                </p>
                            </div>
                        </div>

                        {/* Save Button */}
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="w-full py-3.5 bg-[#14b8a6] hover:bg-[#0f766e] text-white font-black rounded-2xl text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-[#14b8a6]/10 hover:shadow-lg hover:shadow-[#14b8a6]/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isSaving && <RefreshCw className="w-4 h-4 animate-spin" />}
                            {t('settings.save_settings')}
                        </button>
                    </form>
                )}
            </div>
        </div>

        <ChatbotCacheConfirmDialog
            isOpen={confirmMode !== null}
            title={confirmTitle}
            message={confirmMessage}
            confirmLabel={confirmLabel}
            onClose={closeConfirm}
            onConfirm={handleConfirmCacheAction}
            isMutating={isConfirmMutating}
        />
        </>
    );
}
