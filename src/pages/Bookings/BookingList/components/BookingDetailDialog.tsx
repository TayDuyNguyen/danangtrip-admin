import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { Calendar, Clock3, CreditCard, Mail, MapPinned, UserRound, Wallet, X, Ban, BadgeCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { BookingItem } from '@/dataHelper/booking.dataHelper';
import { formatCurrency } from '@/utils/pricing';
import BookingStatusBadge from './BookingStatusBadge';
import PaymentStatusBadge from './PaymentStatusBadge';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    booking: BookingItem | null;
    onConfirm: (id: number) => void;
    onConfirmPayment: (booking: BookingItem) => void;
    onCancel: (booking: BookingItem) => void;
}

const BookingDetailDialog = ({ isOpen, onClose, booking, onConfirm, onConfirmPayment, onCancel }: Props) => {
    const { t, i18n } = useTranslation('booking');

    const locale = i18n.language === 'vi' ? 'vi-VN' : 'en-US';

    const formatDateTime = (value: string) => {
        if (!value) return '';

        try {
            return new Intl.DateTimeFormat(locale, {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
            }).format(new Date(value));
        } catch {
            return value;
        }
    };

    const formatDate = (value: string) => {
        if (!value) return '';

        try {
            return new Intl.DateTimeFormat(locale, {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
            }).format(new Date(value));
        } catch {
            return value;
        }
    };

    const canConfirm = booking?.status === 'pending';
    const canCancel = booking?.status === 'pending' || booking?.status === 'confirmed';
    const canConfirmPayment = (booking?.paymentStatus === 'pending' || booking?.paymentStatus === 'unpaid') && booking?.status !== 'cancelled';

    if (!booking) return null;

    return (
        <Transition show={isOpen}>
            <Dialog onClose={onClose} className="relative z-[110]">
                <TransitionChild
                    enter="ease-out duration-200"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-150"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-slate-950/45 backdrop-blur-md" />
                </TransitionChild>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
                        <TransitionChild
                            enter="ease-out duration-200"
                            enterFrom="translate-y-6 scale-95 opacity-0"
                            enterTo="translate-y-0 scale-100 opacity-100"
                            leave="ease-in duration-150"
                            leaveFrom="translate-y-0 scale-100 opacity-100"
                            leaveTo="translate-y-6 scale-95 opacity-0"
                        >
                            <DialogPanel className="w-full max-w-5xl overflow-hidden rounded-[32px] border border-white/40 bg-white/80 shadow-2xl shadow-slate-900/20 backdrop-blur-2xl">
                                <div className="relative overflow-hidden border-b border-white/50 bg-linear-to-br from-[#0f766e] via-[#14b8a6] to-[#67e8f9] px-6 py-6 text-white sm:px-8">
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.35),_transparent_45%)]" />
                                    <div className="relative flex items-start justify-between gap-4">
                                        <div className="min-w-0">
                                            <div className="mb-3 inline-flex rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.24em]">
                                                {t('labels.booking_code')}: {booking.code}
                                            </div>
                                            <DialogTitle className="text-2xl font-black tracking-tight">
                                                {t('dialog.detail_title')}
                                            </DialogTitle>
                                            <p className="mt-2 max-w-2xl text-sm font-medium text-white/80">
                                                {t('dialog.detail_subtitle')}
                                            </p>
                                            <div className="mt-4 flex flex-wrap gap-2">
                                                <BookingStatusBadge status={booking.status} className="border-white/30 bg-white/15 text-white" />
                                                <PaymentStatusBadge status={booking.paymentStatus} className="border-white/30 bg-white/15 text-white" />
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            className="rounded-2xl border border-white/25 bg-white/10 p-2.5 text-white transition-all hover:bg-white/20"
                                            aria-label={t('common:actions.close')}
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>
                                </div>

                                <div className="max-h-[78vh] overflow-y-auto p-6 sm:p-8">
                                    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                                        <section className="space-y-6">
                                            <div className="rounded-[28px] border border-white/60 bg-white/70 p-6 shadow-lg shadow-slate-200/40">
                                                <div className="mb-5 flex items-center gap-3">
                                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#dff7f4] text-[#0f766e]">
                                                        <UserRound size={20} />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-sm font-black uppercase tracking-[0.18em] text-slate-500">
                                                            {t('labels.customer')}
                                                        </h3>
                                                        <p className="text-lg font-black text-slate-900">
                                                            {booking.customer.name}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="grid gap-4 sm:grid-cols-2">
                                                    <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                                                        <p className="mb-1 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                                                            {t('labels.customer')}
                                                        </p>
                                                        <p className="text-sm font-bold text-slate-900">
                                                            {booking.customer.name}
                                                        </p>
                                                    </div>
                                                    <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                                                        <div className="mb-1 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                                                            <Mail size={13} />
                                                            <span>{t('labels.email')}</span>
                                                        </div>
                                                        <p className="text-sm font-bold text-slate-900">
                                                            {booking.customer.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="rounded-[28px] border border-white/60 bg-white/70 p-6 shadow-lg shadow-slate-200/40">
                                                <div className="mb-5 flex items-center gap-3">
                                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
                                                        <MapPinned size={20} />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-sm font-black uppercase tracking-[0.18em] text-slate-500">
                                                            {t('labels.tour_summary')}
                                                        </h3>
                                                        <p className="text-lg font-black text-slate-900">
                                                            {booking.tour.name}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="grid gap-4 sm:grid-cols-2">
                                                    <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                                                        <p className="mb-1 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                                                            {t('labels.tour_summary')}
                                                        </p>
                                                        <p className="text-sm font-bold text-slate-900">
                                                            {booking.tour.name}
                                                        </p>
                                                    </div>
                                                    <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                                                        <p className="mb-1 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                                                            {t('labels.category')}
                                                        </p>
                                                        <p className="text-sm font-bold text-slate-900">
                                                            {booking.tour.category || t('labels.no_category')}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </section>

                                        <aside className="space-y-6">
                                            <div className="rounded-[28px] border border-white/60 bg-white/70 p-6 shadow-lg shadow-slate-200/40">
                                                <div className="mb-5 flex items-center gap-3">
                                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                                                        <Wallet size={20} />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-sm font-black uppercase tracking-[0.18em] text-slate-500">
                                                            {t('labels.total_amount')}
                                                        </h3>
                                                        <p className="text-3xl font-black tracking-tight text-slate-900">
                                                            {formatCurrency(booking.amount)} {t('common:currency')}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3">
                                                        <div className="flex items-center gap-3 text-slate-500">
                                                            <CreditCard size={16} />
                                                            <span className="text-xs font-black uppercase tracking-[0.16em]">
                                                                {t('labels.payment_status')}
                                                            </span>
                                                        </div>
                                                        <PaymentStatusBadge status={booking.paymentStatus} />
                                                    </div>

                                                    <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3">
                                                        <div className="flex items-center gap-3 text-slate-500">
                                                            <BadgeCheck size={16} />
                                                            <span className="text-xs font-black uppercase tracking-[0.16em]">
                                                                {t('labels.booking_status')}
                                                            </span>
                                                        </div>
                                                        <BookingStatusBadge status={booking.status} />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="rounded-[28px] border border-white/60 bg-white/70 p-6 shadow-lg shadow-slate-200/40">
                                                <h3 className="mb-4 text-sm font-black uppercase tracking-[0.18em] text-slate-500">
                                                    {t('labels.schedule_window')}
                                                </h3>
                                                <div className="space-y-3">
                                                    <div className="rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3">
                                                        <div className="mb-1 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
                                                            <Calendar size={14} />
                                                            <span>{t('labels.booked_at')}</span>
                                                        </div>
                                                        <p className="text-sm font-bold text-slate-900">{formatDateTime(booking.bookedAt)}</p>
                                                    </div>
                                                    <div className="rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3">
                                                        <div className="mb-1 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
                                                            <Clock3 size={14} />
                                                            <span>{t('labels.departure_date')}</span>
                                                        </div>
                                                        <p className="text-sm font-bold text-slate-900">{formatDate(booking.departureDate)}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {booking.cancellationReason && (
                                                <div className="rounded-[28px] border border-red-100 bg-red-50/80 p-6 shadow-lg shadow-red-100/40">
                                                    <h3 className="mb-3 text-sm font-black uppercase tracking-[0.18em] text-red-500">
                                                        {t('labels.reason')}
                                                    </h3>
                                                    <p className="text-sm font-semibold leading-relaxed text-red-900">
                                                        {booking.cancellationReason}
                                                    </p>
                                                </div>
                                            )}
                                        </aside>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3 border-t border-white/60 bg-white/60 px-6 py-5 sm:flex-row sm:justify-end sm:px-8">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-600 transition-all hover:bg-slate-50"
                                    >
                                        {t('common:actions.close')}
                                    </button>
                                    {canConfirm && (
                                        <button
                                            type="button"
                                            onClick={() => onConfirm(booking.id)}
                                            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-500 px-5 py-3 text-sm font-black text-white transition-all hover:bg-emerald-600"
                                        >
                                            <BadgeCheck size={16} />
                                            {t('actions.confirm')}
                                        </button>
                                    )}
                                    {canConfirmPayment && (
                                        <button
                                            type="button"
                                            onClick={() => onConfirmPayment(booking)}
                                            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-teal-200 bg-teal-500 px-5 py-3 text-sm font-black text-white transition-all hover:bg-teal-600"
                                        >
                                            <Wallet size={16} />
                                            {t('actions.confirm_payment', 'Xác nhận thanh toán')}
                                        </button>
                                    )}
                                    {canCancel && (
                                        <button
                                            type="button"
                                            onClick={() => onCancel(booking)}
                                            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-500 px-5 py-3 text-sm font-black text-white transition-all hover:bg-red-600"
                                        >
                                            <Ban size={16} />
                                            {t('actions.cancel')}
                                        </button>
                                    )}
                                </div>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default BookingDetailDialog;
