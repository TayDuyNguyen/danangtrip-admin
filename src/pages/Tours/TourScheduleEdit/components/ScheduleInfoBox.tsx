import { useTranslation } from 'react-i18next';
import Badge from '@/components/ui/Badge';
import type { Schedule } from '@/types/schedule';
import { formatAdminShortDate } from '@/utils/dateDisplay';
import { resolveScheduleDisplayStatus } from '@/utils/scheduleDisplay';

interface Props {
    schedule: Schedule;
}

function statusBadgeProps(schedule: Schedule, t: (key: string) => string) {
    const displayStatus = resolveScheduleDisplayStatus(schedule);
    if (displayStatus === 'CANCELLED') {
        return { variant: 'neutral' as const, label: t('schedules:status.cancelled') };
    }
    if (displayStatus === 'FULL') {
        return { variant: 'warning' as const, label: t('schedules:status.full') };
    }
    return { variant: 'success' as const, label: t('schedules:status.available') };
}

export const ScheduleInfoBox = ({ schedule }: Props) => {
    const { t, i18n } = useTranslation(['schedules', 'common']);

    const dateLabel = formatAdminShortDate(schedule.startDate, i18n.language);
    const endDateLabel = formatAdminShortDate(schedule.endDate, i18n.language);
    const badge = statusBadgeProps(schedule, t);

    return (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50/50 p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 shadow-inner">
                        <i className="ri-calendar-event-line text-2xl" />
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-[18px] font-black text-slate-800">
                                {dateLabel} - {endDateLabel}
                            </h2>
                            <Badge
                                variant={badge.variant}
                                className="px-3 py-1 text-[11px] font-black uppercase tracking-wider"
                            >
                                {badge.label}
                            </Badge>
                        </div>
                        <p className="mt-1 text-[14px] font-medium text-slate-500">
                            {schedule.tourName}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-6 border-t border-amber-100 pt-4 md:border-none md:pt-0">
                    <div className="text-center md:text-right">
                        <div className="text-[11px] font-bold uppercase tracking-widest text-amber-500/70">
                            {t('schedules:fields.capacity')}
                        </div>
                        <div className="text-[16px] font-black text-slate-700">
                            {schedule.bookedSlots} / {schedule.totalSlots}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
