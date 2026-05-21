import { useTranslation } from 'react-i18next';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface CategoryDeleteDialogProps {
    isOpen: boolean;
    categoryName: string;
    onClose: () => void;
    onConfirm: () => void;
    isDeleting: boolean;
}

const CategoryDeleteDialog = ({ isOpen, categoryName, onClose, onConfirm, isDeleting }: CategoryDeleteDialogProps) => {
    const { t } = useTranslation('tour');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-110 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100">
                <div className="p-10 text-center">
                    <div className="w-24 h-24 bg-red-50 rounded-[32px] flex items-center justify-center mx-auto mb-8 animate-pulse">
                        <AlertTriangle size={48} className="text-red-500" />
                    </div>
                    
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-3">
                        {t('categories.messages.delete_confirm_title')}
                    </h2>
                    
                    <p className="text-slate-500 font-medium leading-relaxed px-4">
                        {t('categories.messages.delete_confirm_desc', { name: categoryName })}
                    </p>
                </div>

                <div className="px-8 pb-10 flex flex-col gap-3">
                    <button
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="w-full bg-red-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-red-700 hover:shadow-2xl hover:shadow-red-500/30 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3 group"
                    >
                        {isDeleting ? (
                            <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Trash2 size={20} className="group-hover:rotate-12 transition-transform" />
                        )}
                        <span>{t('dialog.button_delete')}</span>
                    </button>
                    <button
                        onClick={onClose}
                        disabled={isDeleting}
                        className="w-full px-8 py-4 rounded-2xl font-black text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all active:scale-95"
                    >
                        {t('dialog.button_cancel')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CategoryDeleteDialog;
