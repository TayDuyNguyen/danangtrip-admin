import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Calendar,
    Clock,
    Edit2,
    ExternalLink,
    Eye,
    ImageOff,
    Map,
    MapPin,
    Plus,
    Sparkles,
    Star,
    Trash2,
    Users,
} from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import ErrorWidget from '@/components/common/ErrorWidget';
import { ROUTES } from '@/routes/routes';
import { useTourMutations, useTourDetailQuery } from '@/hooks/useTourQueries';
import { useDeleteSchedule, useTourDetailModalSchedules } from '@/hooks/useScheduleQueries';
import { useAuth } from '@/store';
import StatusBadge from '../TourList/components/StatusBadge';
import BookingAvailabilityBadge from '../TourList/components/BookingAvailabilityBadge';
import TourDeleteDialog from '../TourList/components/TourDeleteDialog';
import ScheduleDeleteDialog from '../TourSchedules/components/ScheduleDeleteDialog';
import type { Schedule } from '@/types/schedule';
import { ScheduleBookingAvailability, ScheduleStatus } from '@/types/schedule';

type ItineraryItem = {
    day?: number;
    title?: string;
    content?: string;
};

const parseMultilineContent = (value: unknown): string[] => {
    if (typeof value !== 'string') return [];

    return value
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);
};

const normalizeItinerary = (value: unknown): ItineraryItem[] => {
    if (!Array.isArray(value)) return [];

    return value.filter((item): item is ItineraryItem => Boolean(item && typeof item === 'object'));
};

const formatDate = (value: string | null | undefined, locale: string) => {
    if (!value) return null;

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;

    return date.toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US');
};

const TourDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation(['tour', 'common', 'schedules']);
    const { user } = useAuth();
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deleteScheduleTarget, setDeleteScheduleTarget] = useState<Schedule | null>(null);

    const { data: tour, isLoading, isError, refetch } = useTourDetailQuery(id);
    const {
        data: scheduleData,
        isLoading: isScheduleLoading,
        isError: isScheduleError,
        refetch: refetchSchedules,
    } = useTourDetailModalSchedules(id, true);
    const { statusMutation, featuredMutation, hotMutation, deleteMutation } = useTourMutations();
    const { mutate: deleteSchedule, isPending: isDeletingSchedule } = useDeleteSchedule();

    const recentSchedules = scheduleData?.data ?? [];
    const itinerary = normalizeItinerary(tour?.itinerary);
    const inclusions = parseMultilineContent(tour?.inclusions);
    const exclusions = parseMultilineContent(tour?.exclusions);
    const galleryImages = useMemo(
        () => [tour?.thumbnail, ...(tour?.images ?? [])].filter((img): img is string => Boolean(img)),
        [tour?.thumbnail, tour?.images],
    );

    const formattedPrice = useMemo(() => {
        if (!tour) return '';

        return new Intl.NumberFormat(i18n.language === 'vi' ? 'vi-VN' : 'en-US').format(Number(tour.price_adult ?? 0));
    }, [tour, i18n.language]);

    const availableRange = useMemo(() => {
        const from = formatDate(tour?.available_from, i18n.language);
        const to = formatDate(tour?.available_to, i18n.language);

        if (!from && !to) return 'N/A';
        if (from && to) return `${from} - ${to}`;
        return from || to || 'N/A';
    }, [tour?.available_from, tour?.available_to, i18n.language]);

    const isMutating =
        statusMutation.isPending ||
        featuredMutation.isPending ||
        hotMutation.isPending ||
        deleteMutation.isPending;
    const isAdmin = user?.role === 'admin';

    const handleStatusToggle = () => {
        if (!tour) return;

        const nextStatus = tour.status === 'active' ? 'inactive' : 'active';
        statusMutation.mutate({ id: tour.id, status: nextStatus });
    };

    const handleFeaturedToggle = () => {
        if (!tour) return;
        featuredMutation.mutate({ id: tour.id, is_featured: !tour.is_featured });
    };

    const handleHotToggle = () => {
        if (!tour) return;
        hotMutation.mutate({ id: tour.id, is_hot: !tour.is_hot });
    };

    const handleDeleteConfirm = async () => {
        if (!tour) return;

        await deleteMutation.mutateAsync(tour.id);
        setIsDeleteDialogOpen(false);
        navigate(ROUTES.TOURS_LIST);
    };

    const openPublicPage = () => {
        if (!tour?.slug) return;
        window.open(`/tours/${tour.slug}`, '_blank', 'noopener,noreferrer');
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <PageHeader
                    title={t('detail.title_placeholder', { ns: 'tour' })}
                    breadcrumbs={[
                        { label: t('title.breadcrumb_parent', { ns: 'tour' }), path: ROUTES.TOURS_LIST },
                        { label: t('title.breadcrumb_list', { ns: 'tour' }), path: ROUTES.TOURS_LIST },
                        { label: t('title.breadcrumb_detail', { ns: 'tour' }), active: true },
                    ]}
                />

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
                    <div className="space-y-6">
                        <div className="h-[360px] animate-pulse rounded-3xl border border-slate-100 bg-slate-100" />
                        <div className="h-48 animate-pulse rounded-3xl border border-slate-100 bg-slate-50" />
                        <div className="h-64 animate-pulse rounded-3xl border border-slate-100 bg-slate-50" />
                    </div>
                    <div className="space-y-6">
                        <div className="h-72 animate-pulse rounded-3xl border border-slate-100 bg-slate-50" />
                        <div className="h-80 animate-pulse rounded-3xl border border-slate-100 bg-slate-900/10" />
                    </div>
                </div>
            </div>
        );
    }

    if (isError || !tour) {
        return (
            <div className="space-y-6">
                <PageHeader
                    title={t('title.breadcrumb_detail', { ns: 'tour' })}
                    breadcrumbs={[
                        { label: t('title.breadcrumb_parent', { ns: 'tour' }), path: ROUTES.TOURS_LIST },
                        { label: t('title.breadcrumb_list', { ns: 'tour' }), path: ROUTES.TOURS_LIST },
                        { label: t('title.breadcrumb_detail', { ns: 'tour' }), active: true },
                    ]}
                />
                <ErrorWidget
                    title={t('messages.fetch_error', { ns: 'tour' })}
                    message={t('error_occurred', { ns: 'common' })}
                    onRetry={() => void refetch()}
                    onBack={() => navigate(ROUTES.TOURS_LIST)}
                />
            </div>
        );
    }

    return (
        <>
            <div className="space-y-6">
                <PageHeader
                    title={tour.name}
                    subtitle={tour.short_desc || tour.categoryName || t('messages.no_data', { ns: 'tour' })}
                    breadcrumbs={[
                        { label: t('title.breadcrumb_parent', { ns: 'tour' }), path: ROUTES.TOURS_LIST },
                        { label: t('title.breadcrumb_list', { ns: 'tour' }), path: ROUTES.TOURS_LIST },
                        { label: t('title.breadcrumb_detail', { ns: 'tour' }), active: true },
                    ]}
                    actions={
                        <>
                            <button
                                type="button"
                                onClick={openPublicPage}
                                disabled={!tour.slug}
                                className="inline-flex h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <ExternalLink size={16} />
                                <span>{t('detail.actions.view_public', { ns: 'tour' })}</span>
                            </button>
                            <button
                                type="button"
                                onClick={() =>
                                    navigate(ROUTES.TOURS_EDIT.replace(':id', String(tour.id)), {
                                        state: { fromPath: ROUTES.TOURS_DETAIL.replace(':id', String(tour.id)) },
                                    })
                                }
                                className="inline-flex h-11 items-center gap-2 rounded-2xl bg-[#14b8a6] px-4 text-sm font-bold text-white shadow-lg shadow-[#14b8a6]/20 transition-all hover:bg-[#0f766e]"
                            >
                                <Edit2 size={16} />
                                <span>{t('detail.actions.edit_tour', { ns: 'tour' })}</span>
                            </button>
                        </>
                    }
                />

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
                    <div className="space-y-6 min-w-0">
                        <section className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
                            <div className="grid gap-0 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
                                <div className="relative min-h-[360px] bg-slate-100">
                                    {tour.thumbnail ? (
                                        <img src={tour.thumbnail} alt={tour.name} className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="flex h-full min-h-[360px] flex-col items-center justify-center text-slate-400">
                                            <ImageOff size={44} />
                                            <span className="mt-3 text-sm font-semibold">{t('common:labels.not_available')}</span>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/55 via-slate-900/10 to-transparent" />
                                    <div className="absolute bottom-0 left-0 right-0 flex flex-wrap items-center gap-2 p-6">
                                        <StatusBadge status={tour.status} />
                                        <BookingAvailabilityBadge availability={tour.booking_availability} />
                                        {tour.is_featured && (
                                            <span className="rounded-xl border border-[#ccfbf1] bg-[#dff7f4] px-3 py-1 text-xs font-black uppercase tracking-wider text-[#0f766e]">
                                                {t('filters.featured', { ns: 'tour' })}
                                            </span>
                                        )}
                                        {tour.is_hot && (
                                            <span className="rounded-xl border border-[#fde68a] bg-[#fef3c7] px-3 py-1 text-xs font-black uppercase tracking-wider text-amber-700">
                                                {t('filters.hot', { ns: 'tour' })}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-6 p-6">
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">
                                            {t('table.tour_code_prefix', { ns: 'tour' })}
                                            {tour.id.toString().padStart(3, '0')}
                                        </p>
                                        <h2 className="mt-2 text-2xl font-black text-slate-900">{tour.name}</h2>
                                        <p className="mt-2 text-sm leading-6 text-slate-600">
                                            {tour.short_desc || t('common:labels.not_available')}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                                            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                                {t('table.header_price', { ns: 'tour' })}
                                            </p>
                                            <p className="mt-1 text-xl font-black text-[#14b8a6]">
                                                {formattedPrice} {t('currency', { ns: 'common' })}
                                            </p>
                                        </div>
                                        <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                                            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                                {t('table.header_category', { ns: 'tour' })}
                                            </p>
                                            <p className="mt-1 text-sm font-bold text-slate-700">
                                                {tour.categoryName || t('filters.unknown_category', { ns: 'tour' })}
                                            </p>
                                        </div>
                                        <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                                            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                                {t('form.basic.duration', { ns: 'tour' })}
                                            </p>
                                            <p className="mt-1 text-sm font-bold text-slate-700">
                                                {tour.duration || 'N/A'}
                                            </p>
                                        </div>
                                        <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                                            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                                {t('form.pricing.max_people', { ns: 'tour' })}
                                            </p>
                                            <p className="mt-1 text-sm font-bold text-slate-700">
                                                {tour.max_people || 'N/A'} {t('form.basic.people_unit', { ns: 'tour' })}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-3 rounded-3xl border border-slate-100 bg-slate-50/70 p-5">
                                        <div className="flex items-start gap-3">
                                            <Clock size={18} className="mt-0.5 shrink-0 text-[#14b8a6]" />
                                            <div>
                                                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                                    {t('form.pricing.start_time', { ns: 'tour' })}
                                                </p>
                                                <p className="text-sm font-semibold text-slate-700">
                                                    {tour.start_time || 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <MapPin size={18} className="mt-0.5 shrink-0 text-[#14b8a6]" />
                                            <div>
                                                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                                    {t('form.pricing.meeting_point', { ns: 'tour' })}
                                                </p>
                                                <p className="text-sm font-semibold text-slate-700">
                                                    {tour.meeting_point || t('common:labels.not_available')}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <Calendar size={18} className="mt-0.5 shrink-0 text-[#14b8a6]" />
                                            <div>
                                                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                                    {t('form.schedule.available_from', { ns: 'tour' })} / {t('form.schedule.available_to', { ns: 'tour' })}
                                                </p>
                                                <p className="text-sm font-semibold text-slate-700">{availableRange}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {galleryImages.length > 1 && (
                            <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                                <div className="mb-5 flex items-center gap-2 text-slate-900">
                                    <div className="h-6 w-1 rounded-full bg-[#14b8a6]" />
                                    <h3 className="text-lg font-black uppercase tracking-tight">
                                        {t('detail.sections.hero', { ns: 'tour' })}
                                    </h3>
                                </div>
                                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                                    {galleryImages.slice(0, 8).map((image, index) => (
                                        <div key={`${image}-${index}`} className="aspect-square overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
                                            <img
                                                src={image}
                                                alt={t('form.media.gallery_item_alt', { index: index + 1, ns: 'tour' })}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                            <div className="mb-5 flex items-center gap-2 text-slate-900">
                                <div className="h-6 w-1 rounded-full bg-[#14b8a6]" />
                                <h3 className="text-lg font-black uppercase tracking-tight">
                                    {t('detail.sections.description', { ns: 'tour' })}
                                </h3>
                            </div>
                            {tour.description ? (
                                <div
                                    className="prose prose-slate max-w-none text-slate-600"
                                    dangerouslySetInnerHTML={{ __html: tour.description }}
                                />
                            ) : (
                                <p className="text-sm italic text-slate-400">{t('common:labels.not_available')}</p>
                            )}
                        </section>

                        <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                            <div className="mb-5 flex items-center gap-2 text-slate-900">
                                <div className="h-6 w-1 rounded-full bg-[#14b8a6]" />
                                <h3 className="text-lg font-black uppercase tracking-tight">
                                    {t('detail.sections.itinerary', { ns: 'tour' })}
                                </h3>
                            </div>
                            {itinerary.length > 0 ? (
                                <div className="space-y-4">
                                    {itinerary.map((item, index) => (
                                        <div key={`${item.day ?? index}-${item.title ?? index}`} className="relative rounded-3xl border border-slate-100 bg-slate-50/70 p-5 pl-16">
                                            <div className="absolute left-5 top-5 flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#14b8a6] bg-white text-sm font-black text-[#14b8a6]">
                                                {item.day ?? index + 1}
                                            </div>
                                            <h4 className="text-base font-bold text-slate-800">
                                                {item.title || `${t('form.itinerary.day', { num: item.day ?? index + 1, ns: 'tour' })}`}
                                            </h4>
                                            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">
                                                {item.content || t('messages.no_content', { ns: 'tour', defaultValue: 'Chưa có nội dung mô tả cho ngày này.' })}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 py-12 text-center">
                                    <Map size={44} className="text-slate-200" />
                                    <p className="mt-3 text-sm font-semibold text-slate-400">{t('table.no_schedule', { ns: 'tour' })}</p>
                                </div>
                            )}
                        </section>

                        <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                            <div className="mb-5 flex items-center gap-2 text-slate-900">
                                <div className="h-6 w-1 rounded-full bg-[#14b8a6]" />
                                <h3 className="text-lg font-black uppercase tracking-tight">
                                    {t('detail.sections.services', { ns: 'tour' })}
                                </h3>
                            </div>
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="rounded-3xl border border-emerald-100 bg-emerald-50/50 p-5">
                                    <p className="text-sm font-black uppercase tracking-wider text-emerald-700">
                                        {t('form.inclusions_fields.included_label', { ns: 'tour' })}
                                    </p>
                                    {inclusions.length > 0 ? (
                                        <ul className="mt-4 space-y-2 text-sm text-slate-700">
                                            {inclusions.map((item) => (
                                                <li key={item} className="flex items-start gap-2">
                                                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="mt-4 text-sm italic text-slate-400">{t('common:labels.not_available')}</p>
                                    )}
                                </div>
                                <div className="rounded-3xl border border-rose-100 bg-rose-50/50 p-5">
                                    <p className="text-sm font-black uppercase tracking-wider text-rose-700">
                                        {t('form.inclusions_fields.excluded_label', { ns: 'tour' })}
                                    </p>
                                    {exclusions.length > 0 ? (
                                        <ul className="mt-4 space-y-2 text-sm text-slate-700">
                                            {exclusions.map((item) => (
                                                <li key={item} className="flex items-start gap-2">
                                                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-rose-500" />
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="mt-4 text-sm italic text-slate-400">{t('common:labels.not_available')}</p>
                                    )}
                                </div>
                            </div>
                        </section>

                        <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                            <div className="mb-5 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2 text-slate-900">
                                    <div className="h-6 w-1 rounded-full bg-[#14b8a6]" />
                                    <h3 className="text-lg font-black uppercase tracking-tight">
                                        {t('schedules:title')}
                                    </h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => navigate(ROUTES.TOURS_SCHEDULE_CREATE.replace(':id', String(tour.id)))}
                                    className="inline-flex h-10 items-center gap-2 rounded-2xl border border-[#ccfbf1] bg-[#dff7f4] px-4 text-sm font-bold text-[#0f766e] transition-all hover:bg-[#ccfbf1]"
                                >
                                    <Plus size={16} />
                                    <span>{t('detail.actions.add_schedule', { ns: 'tour' })}</span>
                                </button>
                            </div>

                            {isScheduleLoading ? (
                                <div className="flex items-center justify-center rounded-3xl border border-slate-100 bg-slate-50/70 py-12">
                                    <p className="text-sm text-slate-400">{t('loading', { ns: 'common' })}</p>
                                </div>
                            ) : isScheduleError ? (
                                <div className="rounded-3xl border border-red-100 bg-red-50/70 p-4 text-sm text-red-700">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                        <span>{t('form.departures.load_error', { ns: 'tour' })}</span>
                                        <button
                                            type="button"
                                            onClick={() => void refetchSchedules()}
                                            className="inline-flex h-9 items-center justify-center rounded-xl border border-red-200 bg-white px-3 text-xs font-bold text-red-700 hover:bg-red-50"
                                        >
                                            {t('form.departures.retry', { ns: 'tour' })}
                                        </button>
                                    </div>
                                </div>
                            ) : recentSchedules.length > 0 ? (
                                <div className="space-y-3">
                                    {recentSchedules.map((schedule) => (
                                        <div
                                            key={schedule.id}
                                            className="flex flex-col gap-3 rounded-3xl border border-slate-100 bg-slate-50/70 p-4 md:flex-row md:items-center md:justify-between"
                                        >
                                            <div>
                                                <p className="text-sm font-bold text-slate-800">
                                                    {formatDate(schedule.startDate, i18n.language)} - {formatDate(schedule.endDate, i18n.language)}
                                                </p>
                                                <p className="mt-1 text-xs font-medium text-slate-500">
                                                    {schedule.bookedSlots}/{schedule.totalSlots} {t('form.basic.people_unit', { ns: 'tour' })}
                                                </p>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="rounded-xl border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-600">
                                                    {schedule.status === ScheduleStatus.AVAILABLE
                                                        ? schedule.bookingAvailability === ScheduleBookingAvailability.SOLD_OUT
                                                            ? t('schedules:status.full')
                                                            : t('schedules:status.available')
                                                        : t('schedules:status.cancelled')}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => navigate(ROUTES.TOURS_SCHEDULE_EDIT.replace(':id', String(schedule.id)))}
                                                    className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 transition-all hover:bg-slate-100"
                                                >
                                                    <Edit2 size={14} />
                                                    <span>{t('form.departures.edit_schedule', { ns: 'tour' })}</span>
                                                </button>
                                                {isAdmin ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => setDeleteScheduleTarget(schedule)}
                                                        disabled={isDeletingSchedule}
                                                        className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 text-xs font-bold text-red-700 transition-all hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                                                    >
                                                        <Trash2 size={14} />
                                                        <span>{t('schedules:delete.confirm')}</span>
                                                    </button>
                                                ) : null}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 py-12 text-center">
                                    <Clock size={44} className="text-slate-200" />
                                    <p className="mt-3 text-sm font-semibold text-slate-400">{t('schedules:no_data.title')}</p>
                                </div>
                            )}
                        </section>
                    </div>

                    <aside className="space-y-6">
                        <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                            <div className="flex items-center gap-2 text-slate-900">
                                <div className="h-6 w-1 rounded-full bg-[#14b8a6]" />
                                <h3 className="text-lg font-black uppercase tracking-tight">{t('stats.title', { ns: 'tour' })}</h3>
                            </div>
                            <div className="mt-5 space-y-3">
                                <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <Users size={18} className="text-[#14b8a6]" />
                                        <span className="text-sm font-semibold text-slate-600">{t('table.header_sales', { ns: 'tour' })}</span>
                                    </div>
                                    <span className="text-sm font-black text-slate-900">{tour.booking_count ?? 0}</span>
                                </div>
                                <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <Eye size={18} className="text-[#14b8a6]" />
                                        <span className="text-sm font-semibold text-slate-600">{t('detail.stats.views', { ns: 'tour' })}</span>
                                    </div>
                                    <span className="text-sm font-black text-slate-900">{tour.view_count ?? 0}</span>
                                </div>
                                <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <Star size={18} className="text-[#14b8a6]" />
                                        <span className="text-sm font-semibold text-slate-600">{t('table.header_rating', { ns: 'tour' })}</span>
                                    </div>
                                    <span className="text-sm font-black text-slate-900">
                                        {tour.rating ?? 0} ({tour.reviewCount ?? 0})
                                    </span>
                                </div>
                                <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <Calendar size={18} className="text-[#14b8a6]" />
                                        <span className="text-sm font-semibold text-slate-600">{t('table.header_schedule', { ns: 'tour' })}</span>
                                    </div>
                                    <span className="text-sm font-black text-slate-900">{tour.scheduleCount ?? recentSchedules.length}</span>
                                </div>
                            </div>
                        </section>

                        <section className="rounded-3xl bg-slate-900 p-6 text-white shadow-xl shadow-slate-900/20">
                            <div className="flex items-center gap-2">
                                <div className="h-6 w-1 rounded-full bg-[#14b8a6]" />
                                <h3 className="text-lg font-black uppercase tracking-tight">{t('table.header_actions', { ns: 'tour' })}</h3>
                            </div>
                            <div className="mt-5 space-y-3">
                                <button
                                    type="button"
                                    onClick={() =>
                                        navigate(ROUTES.TOURS_EDIT.replace(':id', String(tour.id)), {
                                            state: { fromPath: ROUTES.TOURS_DETAIL.replace(':id', String(tour.id)) },
                                        })
                                    }
                                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 text-sm font-bold text-slate-900 transition-all hover:bg-slate-100"
                                >
                                    <Edit2 size={16} />
                                    <span>{t('detail.actions.edit_tour', { ns: 'tour' })}</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => navigate(ROUTES.TOURS_SCHEDULE_CREATE.replace(':id', String(tour.id)))}
                                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 text-sm font-bold text-white transition-all hover:bg-white/15"
                                >
                                    <Plus size={16} />
                                    <span>{t('detail.actions.add_schedule', { ns: 'tour' })}</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={handleStatusToggle}
                                    disabled={isMutating}
                                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 text-sm font-bold text-white transition-all hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <Clock size={16} />
                                    <span>
                                        {tour.status === 'active' ? t('status.inactive', { ns: 'tour' }) : t('status.active', { ns: 'tour' })}
                                    </span>
                                </button>
                                <button
                                    type="button"
                                    onClick={handleFeaturedToggle}
                                    disabled={isMutating}
                                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 text-sm font-bold text-white transition-all hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <Star size={16} />
                                    <span>
                                        {tour.is_featured ? t('form.sidebar.unfeature', { ns: 'tour' }) : t('form.sidebar.is_featured', { ns: 'tour' })}
                                    </span>
                                </button>
                                <button
                                    type="button"
                                    onClick={handleHotToggle}
                                    disabled={isMutating}
                                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 text-sm font-bold text-white transition-all hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <Sparkles size={16} />
                                    <span>
                                        {tour.is_hot ? t('form.sidebar.unhot', { ns: 'tour' }) : t('form.sidebar.is_hot', { ns: 'tour' })}
                                    </span>
                                </button>
                                {isAdmin ? (
                                    <button
                                        type="button"
                                        onClick={() => setIsDeleteDialogOpen(true)}
                                        disabled={isMutating}
                                        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-red-500 px-4 text-sm font-bold text-white transition-all hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <Trash2 size={16} />
                                        <span>{t('detail.actions.delete_tour', { ns: 'tour' })}</span>
                                    </button>
                                ) : null}
                            </div>
                        </section>
                    </aside>
                </div>
            </div>

            <TourDeleteDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={() => void handleDeleteConfirm()}
                tourName={tour.name}
                isDeleting={deleteMutation.isPending}
            />
            <ScheduleDeleteDialog
                isOpen={!!deleteScheduleTarget}
                onClose={() => setDeleteScheduleTarget(null)}
                schedule={deleteScheduleTarget}
                isDeleting={isDeletingSchedule}
                onConfirm={() => {
                    if (!deleteScheduleTarget) return;
                    deleteSchedule(deleteScheduleTarget.id, {
                        onSuccess: () => {
                            setDeleteScheduleTarget(null);
                        },
                    });
                }}
            />
        </>
    );
};

export default TourDetail;
