import { useTranslation } from 'react-i18next';

interface Props {
    totalSlots: number;
    bookedSlots: number;
}

export const ScheduleStatsBlock = ({ totalSlots, bookedSlots }: Props) => {
    const { t } = useTranslation(['schedules', 'common']);

    const max = totalSlots || 0;
    const booked = bookedSlots || 0;
    const available = Math.max(0, max - booked);
    const percent = max > 0 ? Math.min(100, Math.round((booked / max) * 100)) : 0;

    let barColorClass = 'bg-[#0066CC]';
    let textPercentClass = 'text-[#0066CC]';
    if (percent > 60 && percent < 90) {
        barColorClass = 'bg-[#F59E0B]';
        textPercentClass = 'text-[#D97706]';
    } else if (percent >= 90) {
        barColorClass = 'bg-[#EF4444]';
        textPercentClass = 'text-[#DC2626]';
    }

    return (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white/70 backdrop-blur-md p-6 shadow-sm hover:shadow-md transition-all">
            <h4 className="mb-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {t('schedules:stats.title')}
            </h4>

            <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-center">
                    <div className="text-[18px] font-black text-slate-800">{booked}</div>
                    <div className="mt-1 text-[11px] font-bold text-slate-400 uppercase">{t('schedules:stats.booked')}</div>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-center">
                    <div className="text-[18px] font-black text-slate-800">{available}</div>
                    <div className="mt-1 text-[11px] font-bold text-slate-400 uppercase">{t('schedules:stats.slots_available')}</div>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-center">
                    <div className="text-[18px] font-black text-slate-800">{max}</div>
                    <div className="mt-1 text-[11px] font-bold text-slate-400 uppercase">{t('schedules:stats.max')}</div>
                </div>
            </div>

            <div className="mt-5 flex items-center gap-3">
                <span className="text-[13px] font-medium text-slate-500 whitespace-nowrap">
                    {booked}/{max} {t('common:units.slots', 'chỗ')}
                </span>
                <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                        className={`absolute left-0 top-0 h-full rounded-full transition-all duration-500 ${barColorClass}`}
                        style={{ width: `${percent}%` }}
                    />
                </div>
                <span className={`text-[13px] font-bold ${textPercentClass}`}>
                    {percent}%
                </span>
            </div>

            {booked > 0 && (
                <div className="mt-5 rounded-xl border border-blue-200 bg-blue-50/50 p-4">
                    <div className="flex gap-3">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                            <i className="ri-information-line" />
                        </div>
                        <p className="text-[12px] leading-relaxed text-blue-800/90">
                            {t('schedules:notices.has_bookings', { count: booked, defaultValue: `Có ${booked} đơn đặt cho lịch này. Số người tối đa không được nhỏ hơn số đã đặt.` })}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};
