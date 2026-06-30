import { useTranslation } from 'react-i18next';
import { AlertTriangle } from 'lucide-react';

interface Props {
    code: string;
    isDeleting: boolean;
    onCancel: () => void;
    onConfirm: () => void;
}

const PromotionDeleteDialog = ({ code, isDeleting, onCancel, onConfirm }: Props) => {
    const { t } = useTranslation('promotions');

    return (
        <div
            className="fixed inset-0 z-100 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs transition-opacity duration-300"
            role="dialog"
            aria-modal="true"
            aria-labelledby="promotion-delete-title"
            data-testid="promotion-delete-dialog"
        >
            <div className="w-full max-w-md bg-white border border-[#E2E8F0] rounded-[32px] p-8 shadow-2xl animate-in zoom-in-95 duration-150 relative">
                <div className="flex items-center gap-4 text-red-500 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center shrink-0">
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <h3 id="promotion-delete-title" className="text-lg font-black text-slate-900">
                            {t('actions.delete_title')}
                        </h3>
                        <p className="text-sm font-medium text-slate-400">{t('actions.delete_irreversible')}</p>
                    </div>
                </div>
                <p className="text-sm font-bold text-slate-600 mb-6 leading-relaxed">
                    {t('actions.delete_confirm', { code })}
                </p>
                <div className="flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="rounded-2xl px-6 py-3 font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                    >
                        {t('actions.cancel')}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isDeleting}
                        data-testid="promotion-delete-confirm"
                        className="flex items-center gap-1.5 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-black px-6 py-3 shadow-lg shadow-red-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                    >
                        {isDeleting ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        ) : null}
                        <span>{t('actions.confirm_delete')}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PromotionDeleteDialog;
