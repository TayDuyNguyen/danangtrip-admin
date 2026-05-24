import { AlertTriangle, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ConfirmDeleteUserDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    userName: string;
    isDeleting: boolean;
}

export const ConfirmDeleteUserDialog = ({
    isOpen,
    onClose,
    onConfirm,
    userName,
    isDeleting,
}: ConfirmDeleteUserDialogProps) => {
    const { t } = useTranslation('user');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-[440px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100 flex flex-col font-sans">
                {/* Header */}
                <div className="p-6 pb-4 flex items-start gap-4">
                    <span className="p-3 bg-rose-50 text-rose-500 border border-rose-100 rounded-2xl shrink-0">
                        <AlertCircle size={22} className="animate-bounce" />
                    </span>
                    <div>
                        <h4 className="text-[16px] font-black text-slate-950 leading-tight">
                            {t('detail.delete_title', 'Xóa tài khoản này?')}
                        </h4>
                        <p className="text-slate-500 text-xs mt-1.5 leading-relaxed font-semibold">
                            {t('detail.delete_desc', { name: userName })}
                        </p>
                    </div>
                </div>

                {/* Body Alert Warning */}
                <div className="mx-6 px-4 py-3.5 bg-amber-50/70 border border-amber-100/70 text-amber-800 rounded-2xl flex gap-3 text-xs leading-relaxed font-medium">
                    <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={16} />
                    <div>
                        <span className="font-extrabold uppercase text-[10px] tracking-wider text-amber-900 block mb-1">
                            {t('detail.delete_warning_label', '⚠ Cảnh báo quan trọng')}
                        </span>
                        {t('detail.delete_warning_desc', 'Tất cả đơn đặt tour, lịch sử giao dịch, đánh giá, lượt bình luận và danh sách yêu thích của người dùng này cũng sẽ bị xóa vĩnh viễn khỏi hệ thống.')}
                    </div>
                </div>

                {/* Footer buttons */}
                <div className="p-6 pt-5 flex items-center justify-end gap-3.5">
                    <button
                        onClick={onClose}
                        disabled={isDeleting}
                        className="px-4.5 py-2.5 bg-white border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 text-xs font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50 select-none active:scale-97"
                    >
                        {t('common:cancel', 'Hủy')}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="px-4.5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-100 hover:shadow-rose-300 transition-all cursor-pointer disabled:opacity-50 select-none active:scale-97 flex items-center gap-1.5"
                    >
                        {isDeleting && <div className="w-3.5 h-3.5 border-2 border-white/30 border-b-white rounded-full animate-spin"></div>}
                        <span>{t('actions.delete', 'Xóa tài khoản')}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
