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
                {new Intl.NumberFormat(i18n.language === 'vi' ? 'vi-VN' : 'en-US').format(Number(val))} ₫
            </span>
        );
    };

    const getStatusLabel = (status: string | undefined) => {
        const s = (status || '').toUpperCase() as ScheduleStatus;
        switch (s) {
            case 'AVAILABLE':
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#dff7f4] px-2.5 py-1 text-[11px] font-bold text-[#0f766e] border border-[#ccfbf1]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#14b8a6] animate-pulse" />
                        {t('schedules:status.available')}
                    </span>
                );
            case 'FULL':
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-bold text-red-700 border border-red-100">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                        {t('schedules:status.full')}
                    </span>
                );
            case 'CANCELLED':
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-600 border border-slate-100">
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                        {t('schedules:status.cancelled')}
                    </span>
                );
            default:
                return '-';
        }
    };

    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/30 p-1">
            <div className="grid grid-cols-1 gap-1">
                {/* Dates */}
                <div className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#dff7f4] text-[#14b8a6]">
                            <i className="ri-calendar-line text-xl" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                {t('schedules:fields.start_date')}
                            </span>
                            <span className="text-[14px] font-bold text-slate-700">
                                {formatDate(values.startDate)}
                            </span>
                        </div>
                    </div>
                    <div className="h-8 w-px bg-slate-100 mx-2" />
                    <div className="flex flex-col text-right">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            {t('schedules:fields.end_date')}
                        </span>
                        <span className="text-[14px] font-bold text-slate-700">
                            {formatDate(values.endDate)}
                        </span>
                    </div>
                </div>

                {/* Status & Slots */}
                <div className="grid grid-cols-2 gap-1">
                    <div className="flex flex-col gap-1 rounded-xl bg-white p-4 shadow-sm">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            {t('schedules:fields.status')}
                        </span>
                        <div className="mt-1">{getStatusLabel(values.status)}</div>
                    </div>
                    <div className="flex flex-col gap-1 rounded-xl bg-white p-4 shadow-sm">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            {t('schedules:fields.max_people')}
                        </span>
                        <div className="mt-1 flex items-baseline gap-1">
                            <span className="text-xl font-black text-slate-800">{values.totalSlots || '0'}</span>
                            <span className="text-[11px] font-bold text-slate-400 uppercase">{t('common:units.people')}</span>
                        </div>
                    </div>
                </div>

                {/* Prices */}
                <div className="rounded-xl bg-white p-4 shadow-sm space-y-4">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        {t('schedules:table.price')}
                    </span>
                    
                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-[13px]">
                            <span className="font-medium text-slate-500">{t('schedules:fields.price_adult')}</span>
                            <span className="font-bold">{formatCurrency(values.priceAdult)}</span>
                        </div>
                        <div className="flex items-center justify-between text-[13px]">
                            <span className="font-medium text-slate-500">{t('schedules:fields.price_child')}</span>
                            <span className="font-bold">{formatCurrency(values.priceChild)}</span>
                        </div>
                        <div className="flex items-center justify-between text-[13px]">
                            <span className="font-medium text-slate-500">{t('schedules:fields.price_infant')}</span>
                            <span className="font-bold">{formatCurrency(values.priceInfant)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
