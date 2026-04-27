import { useMemo } from 'react';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { X, Edit2, MapPin, Clock, Users, Info, Map, ImageOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { TourItem } from '@/dataHelper/tour.dataHelper';
import StatusBadge from './StatusBadge';
import BookingAvailabilityBadge from './BookingAvailabilityBadge';
import { useTourDetailModalSchedules } from '@/hooks/useScheduleQueries';
import { ScheduleStatus } from '@/types/schedule';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    tour: TourItem | null;
    onEdit: (id: number) => void;
}

const TourDetailModal = ({ isOpen, onClose, tour, onEdit }: Props) => {
    const { t, i18n } = useTranslation(['tour', 'schedules']);

    const formattedPrice = useMemo(() => {
        if (!tour) return '';
        return new Intl.NumberFormat(i18n.language === 'vi' ? 'vi-VN' : 'en-US').format(Number(tour.price_adult));
    }, [tour, i18n.language]);

    const { data: scheduleData, isLoading: isScheduleLoading, isError: isScheduleError, refetch: refetchSchedules } =
        useTourDetailModalSchedules(tour?.id, isOpen);
    const recentSchedules = scheduleData?.data ?? [];

    if (!tour) return null;

    return (
        <Transition show={isOpen}>
            <Dialog onClose={onClose} className="relative z-50">
                <TransitionChild
                    enter="ease-out duration-150"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-150"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" />
                </TransitionChild>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 sm:p-6 lg:p-8">
                        <TransitionChild
                            enter="ease-out duration-150"
                            enterFrom="opacity-0 scale-95 translate-y-4"
                            enterTo="opacity-100 scale-100 translate-y-0"
                            leave="ease-in duration-150"
                            leaveFrom="opacity-100 scale-100 translate-y-0"
                            leaveTo="opacity-0 scale-95 translate-y-4"
                        >
                            <DialogPanel className="w-full max-w-5xl transform overflow-hidden rounded-3xl bg-white shadow-2xl transition-all border border-slate-200">
                                {/* Header */}
                                <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-100 bg-white/80 backdrop-blur-md px-6 py-4">
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        <div className="w-10 h-10 rounded-xl bg-[#dff7f4] flex items-center justify-center text-[#14b8a6] shrink-0">
                                            <Info size={20} />
                                        </div>
                                        <div className="min-w-0">
                                            <DialogTitle className="text-lg font-bold text-slate-900 truncate">
                                                {tour.name}
                                            </DialogTitle>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-xs font-medium text-slate-400 font-sans uppercase tracking-wider">
                                                    {t('table.tour_code_prefix')}{tour.id.toString().padStart(3, '0')}
                                                </span>
                                                <div className="w-1 h-1 rounded-full bg-slate-300" />
                                                <StatusBadge status={tour.status} />
                                                <div className="w-1 h-1 rounded-full bg-slate-300" />
                                                <BookingAvailabilityBadge availability={tour.booking_availability} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={() => onEdit(tour.id)}
                                            className="inline-flex items-center gap-2 rounded-xl bg-[#dff7f4] px-4 py-2 text-sm font-bold text-[#0f766e] hover:bg-[#ccfbf1] transition-all border border-[#ccfbf1] active:scale-95"
                                        >
                                            <Edit2 size={16} className="shrink-0" aria-hidden />
                                            <span>{t('actions.edit', { ns: 'common' })}</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            className="p-2 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all active:scale-90"
                                            aria-label={t('actions.close', { ns: 'common' })}
                                        >
                                            <X size={20} className="shrink-0" aria-hidden />
                                        </button>
                                    </div>
                                </div>

                                <div className="max-h-[85vh] overflow-y-auto custom-scrollbar">
                                    <div className="p-6 lg:p-8 space-y-10">
                                        {/* Main Info Section */}
                                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                            {/* Gallery Preview */}
                                            <div className="lg:col-span-7 space-y-4">
                                                <div className="aspect-video relative rounded-3xl overflow-hidden border border-slate-200 bg-slate-50 group">
                                                    {tour.thumbnail ? (
                                                        <>
                                                            <img
                                                                src={tour.thumbnail}
                                                                alt={tour.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                            <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent" />
                                                        </>
                                                    ) : (
                                                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                                                            <ImageOff size={40} />
                                                            <p className="mt-2 text-xs font-bold text-slate-400">{t('messages.no_data')}</p>
                                                        </div>
                                                    )}
                                                </div>
                                                {tour.images && tour.images.length > 0 && (
                                                    <div className="grid grid-cols-4 gap-4">
                                                        {tour.images.slice(0, 4).map((img, i) => (
                                                            <div key={i} className="aspect-square rounded-2xl overflow-hidden border border-slate-100 bg-slate-50">
                                                                <img
                                                                    src={img}
                                                                    alt={t('form.media.gallery_item_alt', { index: i + 1 })}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Quick Stats & Summary */}
                                            <div className="lg:col-span-5 space-y-6">
                                                <div className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100 space-y-6">
                                                    <div className="space-y-1">
                                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('table.header_price')}</p>
                                                        <div className="flex items-baseline gap-2">
                                                            <span className="text-3xl font-black text-[#14b8a6] font-sans">
                                                                {formattedPrice} {t('currency', { ns: 'common' })}
                                                            </span>
                                                            <span className="text-sm font-medium text-slate-400 italic">{t('table.per_person')}</span>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 gap-4">
                                                        <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-slate-100 shadow-xs">
                                                            <div className="w-10 h-10 rounded-xl bg-[#f4fce3] flex items-center justify-center text-[#0f766e] shrink-0">
                                                                <Clock size={18} />
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-1">{t('form.basic.duration')}</p>
                                                                <p className="text-sm font-bold text-slate-700">{tour.duration || t('messages.no_data')}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-slate-100 shadow-xs">
                                                            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-[#0f766e] shrink-0">
                                                                <Users size={18} />
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-1">{t('form.pricing.max_people')}</p>
                                                                <p className="text-sm font-bold text-slate-700">{tour.max_people || t('messages.no_data')} {t('form.basic.people_unit')}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-slate-100 shadow-xs">
                                                            <div className="w-10 h-10 rounded-xl bg-[#dff7f4] flex items-center justify-center text-[#14b8a6] shrink-0">
                                                                <MapPin size={18} />
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-1">{t('form.pricing.meeting_point')}</p>
                                                                <p className="text-sm font-bold text-slate-700 truncate max-w-[200px]">{tour.meeting_point || t('messages.no_data')}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap gap-2">
                                                    {tour.is_featured && (
                                                        <span className="px-3 py-1 bg-[#dff7f4] text-[#0f766e] border border-[#ccfbf1] rounded-lg text-xs font-black uppercase tracking-wider">
                                                            {t('filters.featured')}
                                                        </span>
                                                    )}
                                                    {tour.is_hot && (
                                                        <span className="px-3 py-1 bg-[#f4fce3] text-[#0f766e] border border-[#d9f99d] rounded-lg text-xs font-black uppercase tracking-wider">
                                                            {t('filters.hot')}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Description Section */}
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 text-slate-900">
                                                <div className="w-1 h-6 bg-[#14b8a6] rounded-full" />
                                                <h3 className="text-xl font-black uppercase tracking-tight italic">{t('form.basic.description')}</h3>
                                            </div>
                                            <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed font-sans">
                                                {tour.description ? (
                                                    <div dangerouslySetInnerHTML={{ __html: tour.description }} />
                                                ) : (
                                                    <p className="italic text-slate-400">{t('messages.no_data')}</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Itinerary Section */}
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-2 text-slate-900">
                                                <div className="w-1 h-6 bg-[#14b8a6] rounded-full" />
                                                <h3 className="text-xl font-black uppercase tracking-tight italic">{t('form.sections.itinerary')}</h3>
                                            </div>
                                            
                                            {tour.itinerary && Array.isArray(tour.itinerary) && tour.itinerary.length > 0 ? (
                                                <div className="space-y-4 relative before:absolute before:left-[19px] before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-100">
                                                    {(tour.itinerary as Array<{ day: number; title: string; content: string }>).map((item, idx) => (
                                                        <div key={idx} className="relative pl-12">
                                                            <div className="absolute left-0 top-0 w-10 h-10 rounded-full bg-white border-2 border-[#14b8a6] flex items-center justify-center text-[#14b8a6] font-bold shadow-lg shadow-[#14b8a6]/20 z-10">
                                                                {item.day || idx + 1}
                                                            </div>
                                                            <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-5 hover:bg-white transition-all hover:shadow-md group/it">
                                                                <h4 className="text-md font-bold text-slate-800 mb-2 group-hover/it:text-[#14b8a6] transition-colors">{item.title}</h4>
                                                                <p className="text-sm text-slate-600 leading-relaxed">{item.content}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center py-12 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                                                    <Map size={48} className="text-slate-200 mb-2" />
                                                    <p className="text-slate-400 font-medium italic">{t('table.no_schedule')}</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Departure schedules from tour_schedules */}
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-2 text-slate-900">
                                                <div className="w-1 h-6 bg-[#14b8a6] rounded-full" />
                                                <h3 className="text-xl font-black uppercase tracking-tight italic">
                                                    {t('schedules:title')}
                                                </h3>
                                            </div>

                                            {isScheduleLoading ? (
                                                <div className="flex items-center justify-center py-10 bg-slate-50/50 rounded-3xl border border-slate-100">
                                                    <p className="text-sm text-slate-400">{t('loading', { ns: 'common' })}</p>
                                                </div>
                                            ) : isScheduleError ? (
                                                <div
                                                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-red-100 bg-red-50/50 px-4 py-3 text-sm text-red-700"
                                                    role="alert"
                                                >
                                                    <span>{t('form.departures.load_error')}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => void refetchSchedules()}
                                                        className="shrink-0 inline-flex items-center justify-center rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-bold text-red-800 hover:bg-red-50"
                                                    >
                                                        {t('form.departures.retry')}
                                                    </button>
                                                </div>
                                            ) : recentSchedules.length > 0 ? (
                                                <ul
                                                    className="space-y-3 list-none p-0 m-0"
                                                    aria-label={t('schedules:title')}
                                                >
                                                    {recentSchedules.map((schedule) => (
                                                        <li
                                                            key={schedule.id}
                                                            className="rounded-2xl border border-slate-100 bg-slate-50/60 px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2"
                                                        >
                                                            <div className="text-sm text-slate-700 font-semibold">
                                                                {new Date(schedule.startDate).toLocaleDateString(i18n.language === 'vi' ? 'vi-VN' : 'en-US')}
                                                                {' - '}
                                                                {new Date(schedule.endDate).toLocaleDateString(i18n.language === 'vi' ? 'vi-VN' : 'en-US')}
                                                            </div>
                                                            <div className="flex items-center gap-3 text-xs">
                                                                <span className="font-bold text-slate-500">
                                                                    {schedule.bookedSlots}/{schedule.totalSlots}
                                                                </span>
                                                                <span className="px-2 py-1 rounded-lg bg-white border border-slate-200 font-bold text-slate-600">
                                                                    {schedule.status === ScheduleStatus.AVAILABLE
                                                                        ? t('schedules:status.available')
                                                                        : schedule.status === ScheduleStatus.FULL
                                                                            ? t('schedules:status.full')
                                                                            : t('schedules:status.cancelled')}
                                                                </span>
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center py-12 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                                                    <Clock size={48} className="text-slate-200 mb-2" />
                                                    <p className="text-slate-400 font-medium italic">{t('schedules:no_data.title')}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-slate-50/80 backdrop-blur-sm px-8 py-4 flex justify-end border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="px-6 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
                                    >
                                        {t('actions.close', { ns: 'common' })}
                                    </button>
                                </div>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default TourDetailModal;
