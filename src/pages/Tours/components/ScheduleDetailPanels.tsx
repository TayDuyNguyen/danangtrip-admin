import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { Schedule } from '@/types/schedule';
import { formatAdminShortDate } from '@/utils/dateDisplay';
import { scheduleHasPriceOverride } from '@/utils/scheduleDisplay';
import { ROUTES } from '@/routes/routes';

interface Props {
    schedule: Schedule;
    bookingsHref?: string;
    bookingsCount?: number;
}

function formatPriceValue(
    value: number | null | undefined,
    followsTourLabel: string,
    locale: string
): string {
    if (!scheduleHasPriceOverride(value)) {
        return followsTourLabel;
    }
    return `${new Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : 'en-US').format(Number(value))} ₫`;
}

export const ScheduleDetailPanels = ({ schedule, bookingsHref, bookingsCount }: Props) => {
    const { t, i18n } = useTranslation(['schedules', 'common']);
    const followsTour = t('schedules:fields.price_follows_tour');
    const locale = i18n.language;

    const rows: { label: string; value: string }[] = [
        {
            label: t('schedules:detail.schedule_id'),
            value: `#${schedule.id}`,
        },
        {
            label: t('schedules:fields.start_date'),
            value: formatAdminShortDate(schedule.startDate, locale),
        },
        {
            label: t('schedules:fields.end_date'),
            value: formatAdminShortDate(schedule.endDate, locale),
        },
        {
            label: t('schedules:fields.booking_deadline'),
            value: schedule.bookingDeadline
                ? formatAdminShortDate(schedule.bookingDeadline, locale)
                : '—',
        },
        {
            label: t('schedules:fields.departure_code'),
            value: schedule.departureCode?.trim() || '—',
        },
        {
            label: t('schedules:fields.departure_place'),
            value: schedule.departurePlace?.trim() || '—',
        },
        {
            label: t('schedules:fields.price_adult'),
            value: formatPriceValue(schedule.priceAdult, followsTour, locale),
        },
        {
            label: t('schedules:fields.price_child'),
            value: formatPriceValue(schedule.priceChild, followsTour, locale),
        },
        {
            label: t('schedules:fields.price_infant'),
            value: formatPriceValue(schedule.priceInfant, followsTour, locale),
        },
    ];

    return (
        <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-[15px] font-bold text-slate-800">
                    {t('schedules:detail.summary')}
                </h3>
                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {rows.map((row) => (
                        <div key={row.label} className="space-y-1">
                            <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                {row.label}
                            </dt>
                            <dd className="text-[14px] font-semibold text-slate-800">{row.value}</dd>
                        </div>
                    ))}
                </dl>
                {schedule.tourId != null && schedule.tourName ? (
                    <div className="mt-5 border-t border-slate-100 pt-4">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            {t('schedules:table.tour')}
                        </p>
                        <Link
                            to={ROUTES.TOURS_EDIT.replace(':id', String(schedule.tourId))}
                            className="mt-1 inline-flex text-[14px] font-semibold text-[#14b8a6] hover:underline"
                        >
                            {schedule.tourName}
                        </Link>
                    </div>
                ) : null}
            </div>

            {bookingsHref ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5">
                    <p className="text-[13px] font-medium text-slate-600">
                        {typeof bookingsCount === 'number' && bookingsCount > 0
                            ? t('schedules:actions.view_bookings', { count: bookingsCount })
                            : t('schedules:actions.view_all_bookings')}
                    </p>
                    <Link
                        to={bookingsHref}
                        className="mt-3 inline-flex items-center gap-2 rounded-xl bg-[#dff7f4] px-4 py-2 text-[13px] font-bold text-[#0f766e] border border-[#ccfbf1] hover:bg-[#ccfbf1] transition-colors"
                    >
                        <i className="ri-external-link-line" aria-hidden />
                        {t('schedules:actions.view_all_bookings')}
                    </Link>
                </div>
            ) : null}
        </div>
    );
};
