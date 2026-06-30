import { useTranslation } from 'react-i18next';
import { CheckCircle2, Info, X } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    bookingCode: string;
    isSubmitting?: boolean;
}

const BookingCompleteDialog = ({
    isOpen,
    onClose,
    onConfirm,
    bookingCode,
    isSubmitting,
}: Props) => {
    const { t } = useTranslation('booking');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            <div className="relative w-full max-w-[440px] overflow-hidden rounded-3xl bg-white shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="p-8 pb-0">
                    <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
                            <CheckCircle2 size={24} />
                        </div>
                        <div className="flex-1 pr-8">
                            <h3 className="text-[18px] font-black leading-tight text-slate-900">
                                {t('detail.dialog_complete_title')}
                            </h3>
                            <p className="mt-2 text-[14px] font-medium leading-relaxed text-slate-500">
                                {t('detail.dialog_complete_description', { code: bookingCode })}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="absolute right-6 top-6 p-2 text-slate-400 transition-colors hover:text-slate-900"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="p-8 pt-6">
                    <div className="flex gap-3 rounded-2xl border border-teal-100 bg-teal-50/30 p-4">
                        <Info size={18} className="mt-0.5 shrink-0 text-teal-500" />
                        <p className="text-[13px] font-bold leading-relaxed text-teal-800">
                            {t('detail.dialog_complete_warning')}
                        </p>
                    </div>
                </div>

                <div className="flex gap-3 p-6 pt-0">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="flex-1 rounded-2xl bg-slate-50 py-3.5 text-[14px] font-black text-slate-600 transition-all active:scale-95 hover:bg-slate-100 disabled:opacity-50"
                    >
                        {t('common:actions.close')}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isSubmitting}
                        className="flex-1 rounded-2xl bg-[#14b8a6] py-3.5 text-[14px] font-black text-white shadow-lg shadow-teal-500/20 transition-all active:scale-95 hover:bg-[#0d9488] disabled:opacity-50"
                    >
                        {isSubmitting ? t('common:actions.processing') : t('detail.dialog_complete_action')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BookingCompleteDialog;
