import { useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { AlertCircle, Info, X } from 'lucide-react';
import { cancelBookingSchema, type CancelBookingFormValues } from '@/validations';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => void;
    bookingCode: string;
    customerName: string;
    isSubmitting?: boolean;
}

const defaultValues: CancelBookingFormValues = {
    reason: '',
};

const BookingCancelDialog = ({
    isOpen,
    onClose,
    onConfirm,
    bookingCode,
    customerName,
    isSubmitting,
}: Props) => {
    const { t } = useTranslation('booking');
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<CancelBookingFormValues>({
        resolver: yupResolver(cancelBookingSchema(t) as never) as never,
        defaultValues,
    });

    useEffect(() => {
        if (isOpen) {
            reset(defaultValues);
            return;
        }

        reset(defaultValues);
    }, [isOpen, bookingCode, customerName, reset]);

    if (!isOpen) return null;

    const submitForm = handleSubmit(({ reason }) => {
        onConfirm(reason.trim());
    });

    const handleClose = () => {
        reset(defaultValues);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
                onClick={handleClose}
            />

            <form
                onSubmit={submitForm}
                className="relative w-full max-w-[440px] overflow-hidden rounded-3xl bg-white shadow-2xl animate-in zoom-in-95 duration-200"
            >
                <div className="p-8 pb-0">
                    <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                            <AlertCircle size={24} />
                        </div>
                        <div className="flex-1 pr-8">
                            <h3 className="text-[18px] font-black leading-tight text-slate-900">
                                {t('dialog.cancel_title')}
                            </h3>
                            <p className="mt-2 text-[14px] font-medium leading-relaxed text-slate-500">
                                {t('dialog.cancel_description', { code: bookingCode, name: customerName })}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={handleClose}
                            className="absolute right-6 top-6 p-2 text-slate-400 transition-colors hover:text-slate-900"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="space-y-6 p-8 pt-6">
                    <div>
                        <label
                            htmlFor="booking-cancel-reason"
                            className="mb-2 block px-1 text-[10px] font-black uppercase tracking-widest text-slate-400"
                        >
                            {t('dialog.reason_label')}
                        </label>
                        <textarea
                            id="booking-cancel-reason"
                            rows={3}
                            placeholder={t('dialog.reason_placeholder')}
                            className="w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-[14px] font-medium text-slate-900 outline-hidden transition-all placeholder:text-slate-400 focus:border-[#14b8a6] focus:ring-4 focus:ring-[#14b8a6]/10"
                            {...register('reason')}
                        />
                        {errors.reason?.message && (
                            <p className="mt-2 px-1 text-[12px] font-bold text-red-500">
                                {errors.reason.message}
                            </p>
                        )}
                    </div>

                    <div className="flex gap-3 rounded-2xl border border-amber-100 bg-amber-50 p-4">
                        <Info size={18} className="mt-0.5 shrink-0 text-amber-500" />
                        <p className="text-[13px] font-bold leading-relaxed text-amber-800">
                            {t('dialog.cancel_warning')}
                        </p>
                    </div>
                </div>

                <div className="flex gap-3 p-6 pt-0">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="flex-1 rounded-2xl bg-slate-50 py-3.5 text-[14px] font-black text-slate-600 transition-all active:scale-95 hover:bg-slate-100"
                    >
                        {t('common:actions.close')}
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 rounded-2xl bg-red-500 py-3.5 text-[14px] font-black text-white shadow-lg shadow-red-500/20 transition-all active:scale-95 hover:bg-red-600 disabled:opacity-50"
                    >
                        {isSubmitting ? t('common:actions.processing') : t('dialog.confirm_cancel')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default BookingCancelDialog;
