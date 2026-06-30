import { useTranslation, Trans } from 'react-i18next';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface CategoryDeleteDialogProps {
    isOpen: boolean;
    categoryName: string;
    onClose: () => void;
    onConfirm: () => void;
    isDeleting: boolean;
}

const CategoryDeleteDialog = ({
    isOpen,
    categoryName,
    onClose,
    onConfirm,
    isDeleting,
}: CategoryDeleteDialogProps) => {
    const { t } = useTranslation('location');

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-110 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-300"
            role="dialog"
            aria-modal="true"
            aria-labelledby="location-category-delete-title"
            data-testid="location-category-delete-dialog"
        >
            <div className="w-full max-w-md overflow-hidden rounded-[32px] border border-slate-100 bg-white shadow-2xl animate-in zoom-in-95 duration-300">
                <div className="p-10 text-center">
                    <div className="mx-auto mb-8 flex h-24 w-24 animate-pulse items-center justify-center rounded-[32px] bg-red-50">
                        <AlertTriangle size={48} className="text-red-500" />
                    </div>

                    <h2 id="location-category-delete-title" className="mb-3 text-2xl font-black tracking-tight text-slate-900">
                        {t('categories.messages.delete_confirm_title')}
                    </h2>

                    <p className="px-4 font-medium leading-relaxed text-slate-500">
                        <Trans
                            t={t}
                            i18nKey="categories.messages.delete_confirm_desc"
                            values={{ name: categoryName }}
                            components={{ strong: <strong className="font-black text-slate-900" /> }}
                        />
                    </p>
                </div>

                <div className="flex flex-col gap-3 px-8 pb-10">
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isDeleting}
                        data-testid="location-category-delete-confirm"
                        className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-red-600 px-8 py-4 font-black text-white transition-all hover:bg-red-700 hover:shadow-2xl hover:shadow-red-500/30 active:scale-95 disabled:opacity-50"
                    >
                        {isDeleting ? (
                            <div className="h-5 w-5 animate-spin rounded-full border-3 border-white/30 border-t-white" />
                        ) : (
                            <Trash2 size={20} className="transition-transform group-hover:rotate-12" />
                        )}
                        <span>{t('categories.dialog.button_delete')}</span>
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isDeleting}
                        data-testid="location-category-delete-cancel"
                        className="w-full rounded-2xl px-8 py-4 font-black text-slate-400 transition-all hover:bg-slate-50 hover:text-slate-900 active:scale-95"
                    >
                        {t('categories.dialog.button_cancel')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CategoryDeleteDialog;
