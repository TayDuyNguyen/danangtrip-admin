import React from 'react';
import { Trash2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface RatingDeleteDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isDeleting?: boolean;
    userName?: string;
}

const RatingDeleteDialog: React.FC<RatingDeleteDialogProps> = ({
    isOpen,
    onClose,
    onConfirm,
    isDeleting = false,
    userName = '',
}) => {
    const { t } = useTranslation(['ratings', 'common']);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop overlay */}
            <div 
                onClick={onClose} 
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300"
            ></div>

            {/* Modal Dialog */}
            <div className="bg-white rounded-3xl w-full max-w-[440px] p-6 shadow-2xl border border-slate-100 z-10 mx-4 relative overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Close Button */}
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 hover:bg-slate-50 p-1.5 rounded-full transition-colors cursor-pointer"
                >
                    <X size={16} />
                </button>

                <div className="flex flex-col items-center text-center">
                    {/* Icon container */}
                    <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 mb-4 animate-bounce">
                        <Trash2 size={24} />
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-black text-slate-900 leading-tight">
                        {t('table.delete_confirm_title', 'Xóa đánh giá này?')}
                    </h3>

                    {/* Body description */}
                    <p className="text-sm font-semibold text-[#64748B] mt-2.5 leading-relaxed">
                        {userName 
                            ? t('table.confirm_delete_user_body', 'Đánh giá của khách hàng "{{name}}" sẽ bị xóa vĩnh viễn khỏi hệ thống và không thể khôi phục.', { name: userName })
                            : t('table.confirm_delete_body', 'Đánh giá này sẽ bị xóa vĩnh viễn khỏi hệ thống và không thể khôi phục.')}
                    </p>

                    {/* Actions Panel */}
                    <div className="flex items-center gap-3 w-full mt-6">
                        <button
                            onClick={onClose}
                            disabled={isDeleting}
                            className="flex-1 px-4 py-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 font-black text-sm cursor-pointer transition-colors bg-white disabled:opacity-50"
                        >
                            {t('actions.cancel')}
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isDeleting}
                            className="flex-1 px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-black text-sm rounded-xl cursor-pointer transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-1.5"
                        >
                            <Trash2 size={16} />
                            {isDeleting ? t('common:actions.deleting') : t('actions.delete', 'Xóa')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RatingDeleteDialog;
