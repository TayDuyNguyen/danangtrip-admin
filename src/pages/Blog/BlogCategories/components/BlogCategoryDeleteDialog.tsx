import { useEffect } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { AlertTriangle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BlogCategoryDeleteDialogProps {
    isOpen: boolean;
    categoryName: string;
    onClose: () => void;
    onConfirm: () => void;
    isDeleting: boolean;
}

export const BlogCategoryDeleteDialog = ({
    isOpen,
    categoryName,
    onClose,
    onConfirm,
    isDeleting,
}: BlogCategoryDeleteDialogProps) => {
    const { t } = useTranslation('blog');

    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && !isDeleting) {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, isDeleting, onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div
                    className="fixed inset-0 z-110 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="blog-category-delete-title"
                    data-testid="blog-category-delete-dialog"
                    onClick={() => {
                        if (!isDeleting) onClose();
                    }}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden border border-slate-100"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="p-10 text-center">
                            <div className="w-20 h-20 bg-red-50 rounded-[28px] flex items-center justify-center mx-auto mb-6">
                                <AlertTriangle size={40} className="text-red-500" />
                            </div>

                            <h2
                                id="blog-category-delete-title"
                                className="text-xl font-black text-slate-900 tracking-tight mb-3"
                            >
                                {t('category.delete.confirm_title')}
                            </h2>

                            <p className="text-slate-500 text-sm font-medium leading-relaxed px-4">
                                <Trans
                                    t={t}
                                    i18nKey="category.delete.confirm_body"
                                    values={{ name: categoryName }}
                                    components={{ strong: <strong className="text-slate-900 font-black" /> }}
                                />
                            </p>

                            <div className="mt-4 p-3 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-2.5 text-left">
                                <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                                <p className="text-amber-800 text-xs font-bold leading-relaxed">
                                    {t('category.delete.confirm_warning')}
                                </p>
                            </div>
                        </div>

                        <div className="px-8 pb-10 flex flex-col gap-3">
                            <button
                                type="button"
                                onClick={onConfirm}
                                disabled={isDeleting}
                                data-testid="blog-category-delete-confirm"
                                className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-2xl font-black transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                            >
                                {isDeleting ? (
                                    <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <span>{t('category.delete.btn_delete')}</span>
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isDeleting}
                                data-testid="blog-category-delete-cancel"
                                className="w-full py-4 rounded-2xl font-black text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all active:scale-95"
                            >
                                {t('actions.cancel')}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
