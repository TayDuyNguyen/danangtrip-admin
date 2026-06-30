import { AlertTriangle, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';

interface ChatbotCacheConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    onClose: () => void;
    onConfirm: () => void;
    isMutating?: boolean;
}

export default function ChatbotCacheConfirmDialog({
    isOpen,
    title,
    message,
    confirmLabel,
    onClose,
    onConfirm,
    isMutating = false,
}: ChatbotCacheConfirmDialogProps) {
    const { t } = useTranslation('common');

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            data-testid="chatbot-cache-confirm-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="chatbot-cache-confirm-title"
        >
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
                onClick={onClose}
                aria-hidden="true"
            />
            <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-100 shadow-2xl relative z-10 animate-in zoom-in-95 duration-200 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500 mb-4">
                    <Trash2 size={22} />
                </div>
                <h3 id="chatbot-cache-confirm-title" className="text-slate-900 font-black text-lg tracking-tight mb-2">
                    {title}
                </h3>
                <p className="text-slate-400 text-sm font-semibold mb-4 px-2 leading-relaxed">{message}</p>
                <div className="flex items-start gap-2 bg-[#FEF3C7] border border-[#FDE68A] p-3 rounded-2xl text-left text-[#92400E] text-xs font-bold w-full mb-6">
                    <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                    <span>{t('confirm_delete', { defaultValue: 'This action cannot be undone.' })}</span>
                </div>
                <div className="flex items-center gap-3 w-full">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isMutating}
                        className="flex-1 rounded-2xl py-3 border-slate-200 text-slate-500 hover:bg-slate-50 font-bold"
                    >
                        {t('actions.cancel', { defaultValue: 'Cancel' })}
                    </Button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isMutating}
                        data-testid="chatbot-cache-confirm-submit"
                        className="flex-1 rounded-2xl py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold active:scale-[0.98] disabled:opacity-50 transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-rose-500/20"
                    >
                        {isMutating ? (
                            <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" aria-hidden="true">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                        ) : (
                            <Trash2 size={16} />
                        )}
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
