import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
    ArrowLeft, 
    Download, 
    User, 
    Mail, 
    Phone, 
    MapPin, 
    Calendar, 
    Clock, 
    CheckCircle2, 
    XCircle, 
    AlertCircle, 
    ShoppingBag,
    ShoppingCart,
    DollarSign,
    CreditCard,
    FileText,
    Users,
    Loader2
} from 'lucide-react';
import { toast } from 'sonner';

import { ROUTES } from '@/routes/routes';
import { 
    useAdminBookingDetailQuery, 
    useBookingMutations 
} from '@/hooks/useBookingQueries';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import BookingStatusBadge from '../BookingList/components/BookingStatusBadge';
import PaymentStatusBadge from '../BookingList/components/PaymentStatusBadge';
import BookingCancelDialog from '../BookingList/components/BookingCancelDialog';
import BookingConfirmPaymentDialog from '../BookingList/components/BookingConfirmPaymentDialog';
import { formatCurrency } from '@/utils/pricing';
import { formatAdminShortDate } from '@/utils/dateDisplay';
import type { BookingStatus } from '@/dataHelper/booking.dataHelper';

/**
 * PassengerListPlaceholder Subcomponent
 * Displays the passenger numbers breakdown with a clear warning explaining API Gaps.
 */
interface PassengerListPlaceholderProps {
    adults: number;
    children: number;
    infants: number;
}

const PassengerListPlaceholder = ({ adults, children, infants }: PassengerListPlaceholderProps) => {
    const { t } = useTranslation('booking');
    
    return (
        <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-100 shadow-xs hover:shadow-md transition-all duration-300">
            <h3 className="text-[16px] font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Users className="text-[#14b8a6]" size={20} />
                {t('detail.section_passengers')}
            </h3>

            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-slate-50/50 rounded-2xl p-4 text-center border border-slate-100/50 hover:bg-slate-50 transition-colors">
                    <span className="block text-[24px] font-bold text-slate-800">{adults}</span>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t('detail.adults')}</span>
                </div>
                <div className="bg-slate-50/50 rounded-2xl p-4 text-center border border-slate-100/50 hover:bg-slate-50 transition-colors">
                    <span className="block text-[24px] font-bold text-slate-800">{children}</span>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t('detail.children')}</span>
                </div>
                <div className="bg-slate-50/50 rounded-2xl p-4 text-center border border-slate-100/50 hover:bg-slate-50 transition-colors">
                    <span className="block text-[24px] font-bold text-slate-800">{infants}</span>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t('detail.infants')}</span>
                </div>
            </div>

            <div className="flex gap-3 rounded-2xl border border-blue-50 bg-blue-50/50 p-4">
                <AlertCircle size={18} className="mt-0.5 shrink-0 text-blue-500" />
                <p className="text-[13px] font-bold leading-relaxed text-blue-800/90">
                    {t('detail.passengers_notice')}
                </p>
            </div>
        </div>
    );
};

/**
 * VirtualTimeline Subcomponent
 * Displays the dynamic logs based on booking timestamp availability.
 */
interface VirtualTimelineProps {
    bookedAt: string;
    confirmedAt?: string | null;
    completedAt?: string | null;
    cancelledAt?: string | null;
    cancellationReason?: string | null;
    status: BookingStatus;
}

const VirtualTimeline = ({
    bookedAt,
    confirmedAt,
    completedAt,
    cancelledAt,
    cancellationReason,
    status
}: VirtualTimelineProps) => {
    const { t, i18n } = useTranslation('booking');

    const milestones = [
        {
            key: 'booked',
            label: t('detail.timeline.booked'),
            date: bookedAt,
            isCompleted: true,
            icon: CheckCircle2,
            color: 'text-emerald-500 bg-emerald-50 border-emerald-200'
        },
        {
            key: 'confirmed',
            label: t('detail.timeline.confirmed'),
            date: confirmedAt,
            isCompleted: !!confirmedAt || status === 'completed',
            icon: CheckCircle2,
            color: (!!confirmedAt || status === 'completed') ? 'text-blue-500 bg-blue-50 border-blue-200' : 'text-slate-300 bg-slate-50 border-slate-200'
        },
        {
            key: 'completed',
            label: t('detail.timeline.completed'),
            date: completedAt,
            isCompleted: !!completedAt || status === 'completed',
            icon: CheckCircle2,
            color: (!!completedAt || status === 'completed') ? 'text-teal-500 bg-teal-50 border-teal-200' : 'text-slate-300 bg-slate-50 border-slate-200'
        }
    ];

    // If cancelled, inject the cancelled milestone in the flow
    if (status === 'cancelled') {
        milestones.push({
            key: 'cancelled',
            label: t('detail.timeline.cancelled'),
            date: cancelledAt || bookedAt, // Fallback to bookedAt if cancellation timestamp is null
            isCompleted: true,
            icon: XCircle,
            color: 'text-rose-500 bg-rose-50 border-rose-200'
        });
    }

    return (
        <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-100 shadow-xs hover:shadow-md transition-all duration-300">
            <h3 className="text-[16px] font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Clock className="text-[#14b8a6]" size={20} />
                {t('detail.section_timeline')}
            </h3>

            <div className="relative pl-6 border-l-2 border-slate-100 space-y-8 ml-3">
                {milestones.map((m) => {
                    const IconComponent = m.icon;
                    return (
                        <div key={m.key} className="relative">
                            {/* Dot indicator */}
                            <span className={`absolute -left-[35px] top-0 flex items-center justify-center w-8 h-8 rounded-full border-2 ${m.color} shadow-xs transition-all duration-300`}>
                                <IconComponent size={14} />
                            </span>

                            <div className="transition-all duration-300 hover:translate-x-1">
                                <h4 className={`text-[14px] font-bold ${m.isCompleted ? 'text-slate-800' : 'text-slate-400'}`}>
                                    {m.label}
                                </h4>
                                {m.date && m.isCompleted ? (
                                    <p className="text-[12px] font-bold text-slate-400 mt-1">
                                        {formatAdminShortDate(m.date, i18n.language)}
                                    </p>
                                ) : (
                                    <p className="text-[12px] font-bold text-slate-300 mt-1">
                                        --/--/----
                                    </p>
                                )}

                                {m.key === 'cancelled' && cancellationReason && (
                                    <div className="mt-2 bg-rose-50/50 border border-rose-100 rounded-xl p-3 text-[13px] font-bold text-rose-800">
                                        <span className="block text-[10px] uppercase tracking-wider text-rose-400 font-semibold mb-1">
                                            {t('labels.reason')}
                                        </span>
                                        {cancellationReason}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const BookingDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation('booking');

    const [isCancelOpen, setIsCancelOpen] = useState(false);
    const [isConfirmPaymentOpen, setIsConfirmPaymentOpen] = useState(false);
    const [isCompleting, setIsCompleting] = useState(false);

    // Queries
    const { 
        data: booking, 
        isLoading, 
        isError,
        refetch 
    } = useAdminBookingDetailQuery(id || '');

    // Mutations
    const { 
        updateStatusMutation, 
        confirmPaymentMutation,
        getInvoiceMutation 
    } = useBookingMutations();

    const handleBack = () => {
        navigate(ROUTES.BOOKINGS_LIST);
    };

    const handleConfirm = () => {
        if (!booking) return;
        updateStatusMutation.mutate(
            { id: booking.id, status: 'confirmed' },
            {
                onSuccess: () => {
                    toast.success(t('messages.confirm_success'));
                },
                onError: () => {
                    toast.error(t('messages.update_error'));
                }
            }
        );
    };

    const handleConfirmPaymentClick = () => {
        setIsConfirmPaymentOpen(true);
    };

    const handleConfirmPaymentSubmit = () => {
        if (!booking) return;
        confirmPaymentMutation.mutate(booking.id, {
            onSuccess: () => {
                toast.success(t('messages.confirm_payment_success', { defaultValue: 'Đã xác nhận thanh toán thành công' }));
                setIsConfirmPaymentOpen(false);
                refetch();
            },
            onError: () => {
                toast.error(t('messages.update_error'));
                setIsConfirmPaymentOpen(false);
            }
        });
    };

    const handleComplete = () => {
        if (!booking) return;
        if (!window.confirm(t('detail.dialog_complete_description', { code: booking.code }))) return;

        setIsCompleting(true);
        updateStatusMutation.mutate(
            { id: booking.id, status: 'completed' },
            {
                onSuccess: () => {
                    toast.success(t('detail.confirm_complete_success'));
                    setIsCompleting(false);
                },
                onError: () => {
                    toast.error(t('messages.update_error'));
                    setIsCompleting(false);
                }
            }
        );
    };

    const handleCancelSubmit = (reason: string) => {
        if (!booking) return;
        updateStatusMutation.mutate(
            { id: booking.id, status: 'cancelled', reason },
            {
                onSuccess: () => {
                    toast.success(t('messages.cancel_success'));
                    setIsCancelOpen(false);
                },
                onError: () => {
                    toast.error(t('messages.update_error'));
                }
            }
        );
    };

    const handleDownloadInvoice = () => {
        if (!booking) return;
        getInvoiceMutation.mutate(
            { 
                id: booking.id, 
                fallbackFilename: `hoa_don_${booking.code}.pdf` 
            },
            {
                onSuccess: () => {
                    toast.success(t('messages.export_success'));
                },
                onError: () => {
                    toast.error(t('messages.export_error'));
                }
            }
        );
    };

    // Aggregate passengers
    const totalAdults = booking?.items.reduce((sum, item) => sum + item.quantityAdult, 0) || 0;
    const totalChildren = booking?.items.reduce((sum, item) => sum + item.quantityChild, 0) || 0;
    const totalInfants = booking?.items.reduce((sum, item) => sum + item.quantityInfant, 0) || 0;

    const isTerminalState = booking ? (booking.bookingStatus === 'completed' || booking.bookingStatus === 'cancelled') : false;
    const canConfirmPayment = booking ? ((booking.paymentStatus === 'pending' || booking.paymentStatus === 'unpaid') && booking.bookingStatus !== 'cancelled') : false;

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-20 font-sans">
            {/* Sticky Header */}
            <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-xs">
                <div className="max-w-[1600px] mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleBack}
                            className="rounded-full w-10 h-10 p-0 hover:bg-slate-100 cursor-pointer flex items-center justify-center border-0 bg-transparent text-slate-600"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <div className="mb-1">
                                <Breadcrumbs
                                    icon={ShoppingCart}
                                    items={[
                                        { label: 'sidebar.orders', path: ROUTES.BOOKINGS_LIST },
                                        { label: 'breadcrumb.view' }
                                    ]}
                                />
                            </div>
                            <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none flex items-center gap-2">
                                {t('detail.page_title', { defaultValue: 'Chi tiết Đơn đặt' })}
                                {!isLoading && booking && (
                                    <>
                                        <span className="text-slate-350 font-light">#</span>{booking.code}
                                        <BookingStatusBadge status={booking.bookingStatus} className="h-5" />
                                        <PaymentStatusBadge status={booking.paymentStatus} className="h-5" />
                                    </>
                                )}
                            </h1>
                            {!isLoading && booking && (
                                <p className="text-xs text-slate-400 font-medium truncate max-w-[200px] sm:max-w-[400px] mt-1 select-all">
                                    {booking.customer.name} ({booking.customer.email})
                                </p>
                            )}
                        </div>
                    </div>

                    {!isLoading && booking && (
                        <div className="hidden md:flex items-center gap-3">
                            <button
                                onClick={handleBack}
                                className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-2xl text-slate-600 font-semibold text-[13px] hover:border-[#14b8a6] hover:text-[#14b8a6] transition-all h-10 shadow-xs active:scale-95 cursor-pointer duration-200"
                            >
                                <ArrowLeft size={16} />
                                {t('detail.back_button')}
                            </button>
                            <button
                                onClick={handleDownloadInvoice}
                                disabled={getInvoiceMutation.isPending}
                                className={`flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-2xl text-slate-700 font-semibold text-[13px] hover:border-[#14b8a6] hover:text-[#14b8a6] hover:bg-teal-50/10 transition-all h-10 shadow-xs active:scale-95 cursor-pointer duration-200 ${getInvoiceMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {getInvoiceMutation.isPending ? (
                                    <Loader2 size={16} className="animate-spin text-[#14b8a6]" />
                                ) : (
                                    <Download size={16} className="text-[#14b8a6]" />
                                )}
                                {t('detail.invoice_button')}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Core 2-Column Responsive Layout */}
            <div className="max-w-[1600px] mx-auto px-4 md:px-8 mt-8">
                {isLoading ? (
                    /* Grid Skeleton */
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-pulse">
                        <div className="lg:col-span-8 space-y-8">
                            <div className="bg-white rounded-3xl p-6 lg:p-8 h-48 border border-slate-100 shadow-xs" />
                            <div className="bg-white rounded-3xl p-6 lg:p-8 h-64 border border-slate-100 shadow-xs" />
                            <div className="bg-white rounded-3xl p-6 lg:p-8 h-48 border border-slate-100 shadow-xs" />
                        </div>
                        <div className="lg:col-span-4 space-y-8">
                            <div className="bg-white rounded-3xl p-6 lg:p-8 h-56 border border-slate-100 shadow-xs" />
                            <div className="bg-white rounded-3xl p-6 lg:p-8 h-44 border border-slate-100 shadow-xs" />
                            <div className="bg-white rounded-3xl p-6 lg:p-8 h-64 border border-slate-100 shadow-xs" />
                        </div>
                    </div>
                ) : isError || !booking ? (
                    <div className="flex flex-col items-center justify-center py-20 font-sans">
                        <div className="bg-white border border-slate-100 p-8 lg:p-12 rounded-3xl max-w-md text-center shadow-xl hover:shadow-2xl transition-all duration-300">
                            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 mb-6">
                                <AlertCircle size={32} />
                            </div>
                            <h3 className="text-[20px] font-bold text-slate-900 mb-2">
                                {t('messages.update_error')}
                            </h3>
                            <p className="text-[14px] text-slate-500 font-bold mb-8 leading-relaxed">
                                {t('detail.error_description')}
                            </p>
                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={handleBack}
                                    className="flex items-center gap-2 px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-600 font-bold text-[14px] hover:bg-slate-100 transition-all active:scale-95 duration-150"
                                >
                                    <ArrowLeft size={16} />
                                    {t('detail.back_button')}
                                </button>
                                <button
                                    onClick={() => refetch()}
                                    className="flex items-center gap-2 px-5 py-3 bg-[#14b8a6] text-white font-bold text-[14px] rounded-2xl hover:bg-[#0d9488] shadow-lg shadow-teal-500/20 transition-all active:scale-95 duration-150"
                                >
                                    {t('detail.retry_button')}
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Left Side Column (65% width equivalent) */}
                        <div className="lg:col-span-8 space-y-8">
                    
                    {/* Customer Info Card */}
                    <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-100 shadow-xs hover:shadow-md transition-all duration-300">
                        <h3 className="text-[16px] font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <User className="text-[#14b8a6]" size={20} />
                            {t('detail.section_customer')}
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                            {/* Personal Details */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="h-14 w-14 rounded-2xl bg-teal-50/50 border border-teal-100 flex items-center justify-center text-teal-600 font-bold text-[18px]">
                                        {booking.customer.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <span className="block text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                                            {t('labels.customer')}
                                        </span>
                                        <span className="text-[15px] font-bold text-slate-800 mt-0.5 block">
                                            {booking.customer.name}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 text-slate-600">
                                    <Mail size={16} className="text-slate-400" />
                                    <div>
                                        <span className="text-[10px] font-bold uppercase text-slate-400 block leading-none mb-0.5">
                                            {t('labels.email')}
                                        </span>
                                        <span className="text-[13px] font-bold text-slate-700">
                                            {booking.customer.email}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 text-slate-600">
                                    <Phone size={16} className="text-slate-400" />
                                    <div>
                                        <span className="text-[10px] font-bold uppercase text-slate-400 block leading-none mb-0.5">
                                            {t('detail.phone')}
                                        </span>
                                        <span className="text-[13px] font-bold text-slate-700">
                                            {booking.customer.phone}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Additional Address / Notes */}
                            <div className="space-y-4 md:border-l md:border-slate-100 md:pl-6">
                                <div className="flex items-start gap-3 text-slate-600">
                                    <MapPin size={16} className="text-slate-400 mt-0.5" />
                                    <div>
                                        <span className="text-[10px] font-bold uppercase text-slate-400 block leading-none mb-0.5">
                                            {t('detail.address')}
                                        </span>
                                        <span className="text-[13px] font-bold text-slate-700 leading-relaxed block">
                                            {booking.customer.address || t('detail.address_missing')}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 text-slate-600">
                                    <FileText size={16} className="text-slate-400 mt-0.5" />
                                    <div className="w-full">
                                        <span className="text-[10px] font-bold uppercase text-slate-400 block leading-none mb-0.5">
                                            {t('detail.note')}
                                        </span>
                                        <span className="text-[13px] font-bold text-slate-600 leading-relaxed block mt-1 bg-slate-50 rounded-xl p-3 border border-slate-100/50">
                                            {booking.customer.note || t('detail.no_note')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Booked Tour details */}
                    <div className="space-y-6 bg-white rounded-3xl p-6 lg:p-8 border border-slate-100 shadow-xs hover:shadow-md transition-all duration-300">
                        <h3 className="text-[16px] font-bold text-slate-900 mb-2 flex items-center gap-2">
                            <ShoppingBag className="text-[#14b8a6]" size={20} />
                            {t('detail.section_tour')}
                        </h3>

                        {booking.items.map((item) => (
                            <div key={item.id} className="border-b border-slate-100 last:border-0 pb-6 last:pb-0 pt-4 first:pt-0 space-y-4">
                                <div className="flex flex-col md:flex-row gap-5">
                                    {/* Tour Image */}
                                    {item.tour.thumbnail ? (
                                        <img 
                                            src={item.tour.thumbnail} 
                                            alt={item.tour.name} 
                                            className="w-full md:w-32 h-24 object-cover rounded-2xl border border-slate-100 shadow-xs flex-shrink-0"
                                        />
                                    ) : (
                                        <div className="w-full md:w-32 h-24 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 flex-shrink-0 border border-slate-150">
                                            <ShoppingBag size={24} />
                                        </div>
                                    )}

                                    {/* Tour Info */}
                                    <div className="flex-1 space-y-2">
                                        <span className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#F4FCE3] text-teal-700 uppercase tracking-wide">
                                            {item.tour.category || t('labels.no_category')}
                                        </span>
                                        <h4 className="text-[16px] font-bold text-slate-800 leading-tight">
                                            {item.tour.name}
                                        </h4>
                                        <p className="text-[12px] text-slate-400 font-bold">
                                            {t('detail.duration')}: {item.tour.duration || t('detail.duration_missing')}
                                        </p>
                                    </div>
                                </div>

                                {/* Schedule Details Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50/50 rounded-2xl p-4 border border-slate-100/50">
                                    <div className="flex items-center gap-2.5 text-[13px] font-bold text-slate-700">
                                        <Calendar size={16} className="text-slate-400" />
                                        <div>
                                            <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-semibold leading-none mb-0.5">
                                                {t('detail.travel_date')}
                                            </span>
                                            {formatAdminShortDate(item.travelDate, i18n.language)}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2.5 text-[13px] font-bold text-slate-700">
                                        <MapPin size={16} className="text-slate-400" />
                                        <div>
                                            <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-semibold leading-none mb-0.5">
                                                {t('detail.departure_place')}
                                            </span>
                                            {item.tourSchedule?.departurePlace || t('detail.departure_place_missing')}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2.5 text-[13px] font-bold text-slate-700">
                                        <FileText size={16} className="text-slate-400" />
                                        <div>
                                            <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-semibold leading-none mb-0.5">
                                                {t('detail.schedule_code_label')}
                                            </span>
                                            {item.tourScheduleId ? `#${item.tourScheduleId}` : t('detail.schedule_code_missing')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Passenger Breakdown Card */}
                    <PassengerListPlaceholder 
                        adults={totalAdults} 
                        children={totalChildren} 
                        infants={totalInfants} 
                    />
                </div>

                {/* Right Side Column (35% width equivalent) */}
                <div className="lg:col-span-4 space-y-8">
                    
                    {/* Payment summary card */}
                    <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-100 shadow-xs hover:shadow-md transition-all duration-300 space-y-6">
                        <h3 className="text-[16px] font-bold text-slate-900 flex items-center gap-2 border-b border-slate-50 pb-4">
                            <DollarSign className="text-[#14b8a6]" size={20} />
                            {t('detail.section_payment')}
                        </h3>

                        <div className="space-y-4 pt-1">
                            <div className="flex justify-between items-center text-[13px] font-bold text-slate-500">
                                <span>{t('detail.subtotal')}</span>
                                <span className="text-slate-800">{formatCurrency(booking.totalAmount)} ₫</span>
                            </div>
                            <div className="flex justify-between items-center text-[13px] font-bold text-slate-500">
                                <span>{t('detail.discount')}</span>
                                <span className="text-rose-500">- {formatCurrency(booking.discountAmount)} ₫</span>
                            </div>
                            <div className="flex justify-between items-center text-[13px] font-bold text-slate-500">
                                <span>{t('detail.deposit')}</span>
                                <span className="text-slate-800">{formatCurrency(booking.depositAmount)} ₫</span>
                            </div>

                            <hr className="border-slate-100" />

                            <div className="flex justify-between items-center text-[14px] font-bold text-slate-800 pt-1">
                                <span className="text-[#14b8a6]">{t('detail.final_amount')}</span>
                                <span className="text-[18px] text-[#14b8a6] font-bold">{formatCurrency(booking.finalAmount)} ₫</span>
                            </div>

                            <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-2 text-[12px] font-bold text-slate-400">
                                <CreditCard size={15} />
                                <span className="uppercase tracking-wider">{t('detail.payment_method')}:</span>
                                <span className="text-slate-700 uppercase font-semibold">{booking.paymentMethod}</span>
                            </div>
                        </div>
                    </div>

                    {/* Action Operations Sidebar Panel */}
                    <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-100 shadow-xs hover:shadow-md transition-all duration-300 space-y-6">
                        <h3 className="text-[16px] font-bold text-slate-900 border-b border-slate-50 pb-4">
                            {t('detail.operations_title')}
                        </h3>

                        {isTerminalState ? (
                            <div className={`p-4 rounded-2xl text-center font-bold text-[13px] border ${booking.bookingStatus === 'completed' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-rose-50 border-rose-100 text-rose-800'}`}>
                                {booking.bookingStatus === 'completed' 
                                    ? t('detail.terminal_completed_notice')
                                    : t('detail.terminal_cancelled_notice')}
                            </div>
                        ) : (
                            <div className="space-y-3.5">
                                {/* Confirm Button: pending -> confirmed */}
                                {booking.bookingStatus === 'pending' && (
                                    <button
                                        onClick={handleConfirm}
                                        disabled={updateStatusMutation.isPending}
                                        className="flex items-center justify-center gap-2 w-full px-5 py-3.5 border border-emerald-500 text-emerald-600 font-bold rounded-2xl hover:bg-emerald-500 hover:text-white transition-all active:scale-95 duration-200 cursor-pointer disabled:opacity-50 text-[14px]"
                                    >
                                        {updateStatusMutation.isPending ? (
                                            <Loader2 size={16} className="animate-spin" />
                                        ) : (
                                            <CheckCircle2 size={16} />
                                        )}
                                        {t('actions.confirm')}
                                    </button>
                                )}

                                {/* Confirm Payment Button */}
                                {canConfirmPayment && (
                                    <button
                                        onClick={handleConfirmPaymentClick}
                                        disabled={confirmPaymentMutation.isPending}
                                        className="flex items-center justify-center gap-2 w-full px-5 py-3.5 border border-teal-500 text-teal-600 font-bold rounded-2xl hover:bg-teal-500 hover:text-white transition-all active:scale-95 duration-200 cursor-pointer disabled:opacity-50 text-[14px]"
                                    >
                                        {confirmPaymentMutation.isPending ? (
                                            <Loader2 size={16} className="animate-spin" />
                                        ) : (
                                            <DollarSign size={16} />
                                        )}
                                        {t('actions.confirm_payment', 'Xác nhận thanh toán')}
                                    </button>
                                )}

                                {/* Complete Button: confirmed -> completed */}
                                {booking.bookingStatus === 'confirmed' && (
                                    <button
                                        onClick={handleComplete}
                                        disabled={updateStatusMutation.isPending || isCompleting}
                                        className="flex items-center justify-center gap-2 w-full px-5 py-3.5 border border-[#14b8a6] text-[#14b8a6] font-bold rounded-2xl hover:bg-[#14b8a6] hover:text-white transition-all active:scale-95 duration-200 cursor-pointer disabled:opacity-50 text-[14px]"
                                    >
                                        {isCompleting ? (
                                            <Loader2 size={16} className="animate-spin" />
                                        ) : (
                                            <CheckCircle2 size={16} />
                                        )}
                                        {t('detail.confirm_complete')}
                                    </button>
                                )}

                                {/* Cancel Button: pending or confirmed -> cancelled */}
                                <button
                                    onClick={() => setIsCancelOpen(true)}
                                    disabled={updateStatusMutation.isPending}
                                    className="flex items-center justify-center gap-2 w-full px-5 py-3.5 border border-rose-500 text-rose-600 font-bold rounded-2xl hover:bg-rose-500 hover:text-white transition-all active:scale-95 duration-200 cursor-pointer disabled:opacity-50 text-[14px]"
                                >
                                    <XCircle size={16} />
                                    {t('actions.cancel')}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Virtual Status Timeline */}
                    <VirtualTimeline 
                        bookedAt={booking.bookedAt}
                        confirmedAt={booking.confirmedAt}
                        completedAt={booking.completedAt}
                        cancelledAt={booking.cancelledAt}
                        cancellationReason={booking.cancellationReason}
                        status={booking.bookingStatus}
                    />

                </div>
            </div>
            )}

            {/* Confirm Cancel Dialog */}
            {booking && (
                <BookingCancelDialog
                    isOpen={isCancelOpen}
                    onClose={() => setIsCancelOpen(false)}
                    onConfirm={handleCancelSubmit}
                    bookingCode={booking.code}
                    customerName={booking.customer.name}
                    isSubmitting={updateStatusMutation.isPending}
                />
            )}

            {/* Confirm Payment Action Confirmation Dialog */}
            {booking && (
                <BookingConfirmPaymentDialog
                    isOpen={isConfirmPaymentOpen}
                    onClose={() => setIsConfirmPaymentOpen(false)}
                    onConfirm={handleConfirmPaymentSubmit}
                    bookingCode={booking.code}
                    customerName={booking.customer.name}
                    isSubmitting={confirmPaymentMutation.isPending}
                />
            )}
        </div>
    </div>
    );
};

export default BookingDetail;
