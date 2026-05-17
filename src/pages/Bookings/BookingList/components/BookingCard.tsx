import { useTranslation } from 'react-i18next';
import { Eye, CheckCircle, XCircle, MapPin, Calendar, Clock } from 'lucide-react';
import type { BookingItem } from '@/dataHelper/booking.dataHelper';
import BookingStatusBadge from './BookingStatusBadge';
import PaymentStatusBadge from './PaymentStatusBadge';

interface Props {
    booking: BookingItem;
    onView: (booking: BookingItem) => void;
    onConfirm: (id: number) => void;
    onCancel: (booking: BookingItem) => void;
}

const BookingCard = ({ booking, onView, onConfirm, onCancel }: Props) => {
    const { t, i18n } = useTranslation('booking');
    const locale = i18n.language === 'vi' ? 'vi-VN' : 'en-US';

    const formatDateTime = (dateStr: string) => {
        if (!dateStr) return '';
        try {
            const date = new Date(dateStr);
            return new Intl.DateTimeFormat(locale, {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            }).format(date);
        } catch {
            return dateStr;
        }
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        try {
            const date = new Date(dateStr);
            return new Intl.DateTimeFormat(locale, {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            }).format(date);
        } catch {
            return dateStr;
        }
    };

    const isUpcoming = (dateStr: string) => {
        try {
            const date = new Date(dateStr);
            const now = new Date();
            const diff = date.getTime() - now.getTime();
            const days = diff / (1000 * 60 * 60 * 24);
            return days > 0 && days <= 7;
        } catch {
            return false;
        }
    };

    return (
        <div className="group relative">
            {/* Timeline Indicator Side */}
            <div className={`absolute -left-12 top-6 w-8 h-8 rounded-full border-4 border-[#F3F2EE] shadow-sm flex items-center justify-center z-10 transition-transform group-hover:scale-110
                ${booking.status === 'completed' ? 'bg-[#10B981]' : 
                  booking.status === 'cancelled' ? 'bg-red-400' : 
                  booking.status === 'confirmed' ? 'bg-[#3B82F6]' : 'bg-[#F59E0B]'}`}>
                {booking.status === 'completed' && <CheckCircle size={16} className="text-white" />}
                {booking.status === 'cancelled' && <XCircle size={16} className="text-white" />}
                {booking.status === 'confirmed' && <CheckCircle size={16} className="text-white" />}
                {booking.status === 'pending' && <Clock size={16} className="text-white" />}
            </div>

            {/* Main Card */}
            <div className={`bg-white border border-[#E2E8F0] rounded-3xl p-6 shadow-xs hover:shadow-xl hover:border-[#14b8a6]/30 transition-all duration-300
                ${booking.status === 'cancelled' ? 'opacity-75' : ''}`}>
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                    <div className="flex items-center gap-4">
                        <span className="text-[15px] font-black text-[#14b8a6] font-mono tracking-tight bg-[#14b8a6]/5 px-3 py-1.5 rounded-xl">
                            {booking.code}
                        </span>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full border-2 border-slate-100 overflow-hidden shrink-0">
                                {booking.customer.avatar ? (
                                    <img src={booking.customer.avatar} alt={booking.customer.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-sm uppercase">
                                        {booking.customer.name.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <div className="min-w-0">
                                <h4 className="text-[14px] font-black text-slate-900 truncate uppercase tracking-tight">
                                    {booking.customer.name}
                                </h4>
                                <p className="text-[11px] text-slate-400 font-bold truncate">
                                    {booking.customer.email}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <BookingStatusBadge status={booking.status} />
                        <PaymentStatusBadge status={booking.paymentStatus} />
                    </div>
                </div>

                {/* Tour Info Row */}
                <div className="flex items-center gap-6 py-5 border-y border-slate-50">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center shrink-0">
                            {booking.tour.thumbnail ? (
                                <img src={booking.tour.thumbnail} alt={booking.tour.name} className="w-full h-full object-cover" />
                            ) : (
                                <MapPin size={24} className="text-slate-200" />
                            )}
                        </div>
                        <div className="min-w-0">
                            <h5 className="text-[14px] font-black text-slate-900 truncate leading-tight mb-1">
                                {booking.tour.name}
                            </h5>
                            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">
                                {booking.tour.category || t('labels.no_category')}
                            </p>
                        </div>
                    </div>
                    <div className="text-right shrink-0">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                            {t('labels.total_amount')}
                        </p>
                        <p className="text-[18px] font-black text-[#14b8a6] tracking-tight">
                            {booking.amount.toLocaleString(locale)} {t('common:currency')}
                        </p>
                    </div>
                </div>

                {/* Footer / Meta & Actions */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
                    <div className="flex flex-wrap items-center gap-6 text-[12px] font-bold">
                        <div className="flex items-center gap-2 text-slate-400">
                            <Calendar size={14} />
                            <span>{t('labels.booked_at')}:</span>
                            <span className="text-slate-900">{formatDateTime(booking.bookedAt)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400">
                            <Clock size={14} />
                            <span>{t('labels.departure_date')}:</span>
                            <span className="text-slate-900">{formatDate(booking.departureDate)}</span>
                            {isUpcoming(booking.departureDate) && (
                                <span className="bg-blue-50 text-blue-500 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">
                                    {t('labels.upcoming')}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <button 
                            onClick={() => onView(booking)}
                            className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-[#14b8a6] hover:border-[#14b8a6] hover:bg-white transition-all shadow-xs"
                            title={t('common:actions.view')}
                        >
                            <Eye size={18} />
                        </button>
                        
                        {booking.status === 'pending' && (
                            <button 
                                onClick={() => onConfirm(booking.id)}
                                className="h-10 px-4 rounded-xl border border-[#10B981] text-[#10B981] font-black text-[12px] uppercase tracking-wider hover:bg-[#10B981] hover:text-white transition-all shadow-sm active:scale-95 flex items-center gap-2"
                            >
                                <CheckCircle size={14} />
                                {t('actions.confirm')}
                            </button>
                        )}

                        {(booking.status === 'pending' || booking.status === 'confirmed') && (
                            <button 
                                onClick={() => onCancel(booking)}
                                className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-500 hover:bg-white transition-all shadow-xs"
                                title={t('actions.cancel')}
                            >
                                <XCircle size={18} />
                            </button>
                        )}
                    </div>
                </div>

                {booking.cancellationReason && (
                    <div className="mt-4 pt-4 border-t border-red-50/50 flex gap-3 text-[12px]">
                        <div className="px-2 py-0.5 bg-red-50 text-red-500 rounded-md font-black h-fit">
                            {t('labels.reason')}
                        </div>
                        <p className="text-slate-500 font-medium italic">
                            {booking.cancellationReason}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BookingCard;
