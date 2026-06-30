import type { LucideIcon } from 'lucide-react';
import { AlertTriangle, FileDown, RefreshCw, Sparkles } from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import { REPORTS_HUB_PATH } from './reports.constants';
import { useTranslation } from 'react-i18next';

export type ReportPageShellProps = {
    icon: LucideIcon;
    title: string;
    subtitle: string;
    breadcrumbCurrentLabel: string;
    testIdPrefix: string;
    isMockMode: boolean;
    showErrorPanel: boolean;
    isExportDisabled?: boolean;
    isExportPending?: boolean;
    exportLabel?: string;
    onToggleMock: () => void;
    onExport: () => void;
    onRetry: () => void;
    onUseMock: () => void;
    children: React.ReactNode;
};

export function ReportPageShell({
    icon: Icon,
    title,
    subtitle,
    breadcrumbCurrentLabel,
    testIdPrefix,
    isMockMode,
    showErrorPanel,
    isExportDisabled = false,
    isExportPending = false,
    exportLabel,
    onToggleMock,
    onExport,
    onRetry,
    onUseMock,
    children,
}: ReportPageShellProps) {
    const { t } = useTranslation('reports_common');

    return (
        <div className="p-1 sm:p-2 max-w-[1600px] mx-auto space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col gap-3">
                <Breadcrumbs
                    icon={Icon}
                    items={[
                        { label: 'sidebar.reports', path: REPORTS_HUB_PATH },
                        { label: breadcrumbCurrentLabel },
                    ]}
                />

                {isMockMode && (
                    <div
                        data-testid={`${testIdPrefix}-mock-banner`}
                        className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs font-bold text-amber-800 flex items-center gap-2"
                    >
                        <Sparkles size={14} className="shrink-0" />
                        {t('mock.banner')}
                    </div>
                )}

                <div className="p-[1px] rounded-3xl bg-gradient-to-br from-[#14b8a6]/25 via-slate-200/20 to-transparent shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="bg-white/98 backdrop-blur-sm rounded-[23px] px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-[#14b8a6] to-[#0f766e] text-white rounded-2xl flex items-center justify-center shadow-md shadow-[#14b8a6]/20 shrink-0">
                                <Icon size={20} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h1 className="text-[22px] font-black text-[#0F172A] tracking-tight leading-tight">{title}</h1>
                                <p className="text-xs font-bold text-[#94A3B8] mt-1">{subtitle}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                data-testid={`${testIdPrefix}-mock-toggle`}
                                onClick={onToggleMock}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black border transition-all cursor-pointer ${
                                    isMockMode
                                        ? 'bg-amber-50 border-amber-200 text-amber-600'
                                        : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                                }`}
                                title={t('mock.toggle_title')}
                            >
                                <Sparkles size={13} className={isMockMode ? 'animate-bounce' : ''} />
                                {isMockMode ? t('mock.mock_on') : t('mock.mock_off')}
                            </button>

                            <button
                                type="button"
                                data-testid={`${testIdPrefix}-export-btn`}
                                onClick={onExport}
                                disabled={isExportDisabled || isExportPending}
                                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-white border border-[#E2E8F0] hover:border-[#14b8a6] hover:bg-[#14b8a6]/5 hover:text-[#14b8a6] shadow-xs active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:active:scale-100 cursor-pointer text-[#0F172A]/80"
                            >
                                {isExportPending ? (
                                    <div className="w-4 h-4 border-2 border-[#14b8a6] border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <FileDown size={16} />
                                )}
                                {exportLabel ?? t('export.btn_label')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {showErrorPanel ? (
                <div
                    data-testid={`${testIdPrefix}-error-panel`}
                    className="p-[1px] rounded-3xl bg-gradient-to-br from-red-500/20 via-slate-200/25 to-slate-100/10 shadow-xs max-w-lg mx-auto mt-12 animate-in fade-in duration-300"
                >
                    <div className="bg-white rounded-[23px] p-8 text-center flex flex-col items-center justify-center font-sans">
                        <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100/50">
                            <AlertTriangle size={24} />
                        </div>
                        <div>
                            <h3 className="text-base font-black text-[#0F172A]">{t('error.load_failed')}</h3>
                            <p className="text-xs font-bold text-[#94A3B8] mt-1.5">{t('error.connection')}</p>
                        </div>
                        <div className="flex gap-2 justify-center mt-6">
                            <button
                                type="button"
                                data-testid={`${testIdPrefix}-retry-btn`}
                                onClick={onRetry}
                                className="inline-flex items-center gap-2 bg-[#14b8a6] hover:bg-[#0f766e] text-white font-bold text-xs px-6 py-2.5 rounded-xl active:scale-95 transition-all shadow-md cursor-pointer"
                            >
                                <RefreshCw size={15} />
                                {t('error.retry_btn')}
                            </button>
                            <button
                                type="button"
                                data-testid={`${testIdPrefix}-use-mock-btn`}
                                onClick={onUseMock}
                                className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-6 py-2.5 rounded-xl active:scale-95 transition-all shadow-md cursor-pointer"
                            >
                                <Sparkles size={15} />
                                {t('error.use_mock_btn')}
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                children
            )}
        </div>
    );
}

export default ReportPageShell;
