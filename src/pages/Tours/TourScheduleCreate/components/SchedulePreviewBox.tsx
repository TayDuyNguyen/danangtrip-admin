import { useTranslation } from 'react-i18next';
import { useWatch } from 'react-hook-form';
import type { Control } from 'react-hook-form';
import { ScheduleStatus } from '@/types/schedule';
import type { ScheduleFormValues } from '@/types/schedule';

interface SchedulePreviewBoxProps {
    control: Control<ScheduleFormValues>;
}

export const SchedulePreviewBox = ({ control }: SchedulePreviewBoxProps) => {
    const { t, i18n } = useTranslation(['schedules', 'common']);

    const values = useWatch({
        control,
    });

    const formatDate = (dateStr: string | undefined) => {
        if (!dateStr) return '-';
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return '-';

            return new Intl.DateTimeFormat(i18n.language === 'vi' ? 'vi-VN' : 'en-US', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                weekday: 'long',
            }).format(date);
        } catch {
            return '-';
        }
    };

    const formatCurrency = (val: number | string | null | undefined) => {
        if (val === null || val === undefined || val === '') {
            return (
                <span className="text-slate-400 font-normal italic">
                    {t('schedules:fields.price_follows_tour')}
                </span>
            );
        }
        return (
            <span className="text-[#0f766e] font-bold">
                {new Intl.NumberFormat(i18n.language === 'vi' ? 'vi-VN' : 'en-US').format(Number(val))} d
            </span>
        );
    };

    const getStatusLabel = (status: string | undefined) => {
        const s = (status || '').toUpperCase() as ScheduleStatus;
        switch (s) {
            case 'AVAILABLE':
                return <span className="inline-flex items-center gap-1.5 rounded-full bg-[#dff7f4] px-2 py-0.5 text-[11px] font-medium text-[#0f766e] border border-[#ccfbf1]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#14b8a6]" />
                    {t('schedules:status.available')}
                </span>;
            case 'FULL':
                return <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-700 border border-red-100">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                    {t('schedules:status.full')}
                </span>;
            case 'CANCELLED':
                return <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600 border border-slate-100">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                    {t('schedules:status.cancelled')}
                </span>;
            default:
                return '-';
        }
    };

    return (
        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/50 shadow-sm">
            <div className="border-b border-slate-200 bg-white/50 px-5 py-2.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {t('schedules:fields.preview')}
                </span>
            </div>

            <div className="grid grid-cols-1 gap-x-8 gap-y-5 p-5 md:grid-cols-2">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#dff7f4] text-[#14b8a6] shadow-sm">
                        <i className="ri-calendar-event-line text-lg" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[11px] font-medium text-slate-400 uppercase tracking-tight">
                            {t('schedules:fields.start_date')}
                        </span>
                        <span className="text-[14px] font-semibold text-slate-700">
                            {formatDate(values.startDate)}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-[#0f766e] shadow-sm">
                        <i className="ri-checkbox-circle-line text-lg" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[11px] font-medium text-slate-400 uppercase tracking-tight">
                            {t('schedules:fields.status')}
                        </span>
                        <div className="mt-0.5">
                            {getStatusLabel(values.status)}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f4fce3] text-[#0f766e] shadow-sm">
                        <i className="ri-group-line text-lg" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[11px] font-medium text-slate-400 uppercase tracking-tight">
                            {t('schedules:fields.max_people')}
                        </span>
                        <span className="text-[14px] font-semibold text-slate-700">
                            {values.totalSlots || '-'} {t('common:units.people')}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#dff7f4] text-[#14b8a6] shadow-sm">
                        <i className="ri-money-dollar-circle-line text-lg" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[11px] font-medium text-slate-400 uppercase tracking-tight">
                            {t('schedules:fields.price_adult')}
                        </span>
                        <span className="text-[14px] font-semibold">
                            {formatCurrency(values.priceAdult)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
