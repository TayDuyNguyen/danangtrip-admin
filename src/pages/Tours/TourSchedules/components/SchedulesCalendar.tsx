import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, RotateCcw, RefreshCw } from 'lucide-react';
import { useSchedules } from '@/hooks/useScheduleQueries';
import { clsx } from 'clsx';
import { ScheduleStatus } from '@/types/schedule';
import { useTranslation } from 'react-i18next';

type Props = {
    tourId?: string | number;
    selectedDate?: string;
    onSelectDate?: (dateStr: string | undefined) => void;
};

const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (year: number, month: number) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // 0 = Mon, 6 = Sun
};

const formatYMD = (d: Date) => {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const SchedulesCalendar = ({ tourId, selectedDate, onSelectDate }: Props) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const { t } = useTranslation(['schedules', 'common']);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));

    const { days, startDateStr, endDateStr } = useMemo(() => {
        const daysInMonth = getDaysInMonth(year, month);
        const firstDayIndex = getFirstDayOfMonth(year, month);
        const previousMonthDays = getDaysInMonth(year, month - 1);

        const daysArr = [];

        // Previous month padding
        for (let i = firstDayIndex - 1; i >= 0; i--) {
            daysArr.push({
                date: new Date(year, month - 1, previousMonthDays - i),
                isCurrentMonth: false,
            });
        }

        // Current month
        for (let i = 1; i <= daysInMonth; i++) {
            daysArr.push({
                date: new Date(year, month, i),
                isCurrentMonth: true,
            });
        }

        // Next month padding
        const remainingSlots = 7 - (daysArr.length % 7);
        if (remainingSlots < 7) {
            for (let i = 1; i <= remainingSlots; i++) {
                daysArr.push({
                    date: new Date(year, month + 1, i),
                    isCurrentMonth: false,
                });
            }
        }

        const start = formatYMD(daysArr[0].date);
        const end = formatYMD(daysArr[daysArr.length - 1].date);

        return { days: daysArr, startDateStr: start, endDateStr: end };
    }, [year, month]);

    const { data, isFetching, isError } = useSchedules({
        start_date: startDateStr,
        end_date: endDateStr,
        limit: 100, // Fetch up to 100 for the month view
        tour_id: tourId === 'all' ? undefined : tourId,
    });

    // Map schedules by date
    const schedulesByDate = useMemo(() => {
        const map = new Map<string, { hasAvailable: boolean; hasFullOrCancelled: boolean }>();
        const rows = data?.data || [];
        
        rows.forEach(schedule => {
            // schedule.startDate might be "2026-04-15" or ISO string
            const dStr = schedule.startDate.substring(0, 10);
            const current = map.get(dStr) || { hasAvailable: false, hasFullOrCancelled: false };
            
            if (schedule.status === ScheduleStatus.AVAILABLE) {
                current.hasAvailable = true;
            } else {
                current.hasFullOrCancelled = true;
            }
            
            map.set(dStr, current);
        });
        
        return map;
    }, [data?.data]);

    const todayStr = formatYMD(new Date());
    const weekdayLabels = t('schedules:calendar.weekdays', { returnObjects: true }) as string[];

    return (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 md:p-6 shadow-sm overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                        <CalendarIcon className="w-5 h-5 text-[#14b8a6]" />
                        <h2 className="text-[16px] font-bold text-[#1E293B]">
                            {t('schedules:calendar.month_year', { month: month + 1, year })}
                        </h2>
                        {isFetching && (
                            <div className="ml-1">
                                <RefreshCw className="w-3.5 h-3.5 text-[#14b8a6] animate-spin" />
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-4 ml-0 sm:ml-4 px-3 py-1.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] text-[12px] font-medium text-[#64748B]">
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-[#14b8a6]" />
                            <span>{t('schedules:calendar.available')}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-[#EF4444]" />
                            <span>{t('schedules:calendar.full_or_cancelled')}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {selectedDate && (
                        <button
                            onClick={() => onSelectDate?.(undefined)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-bold text-[#EF4444] bg-[#FEE2E2] hover:bg-[#FECACA] transition-colors"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            {t('common:actions.reset')}
                        </button>
                    )}
                    <div className="flex items-center gap-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-1">
                        <button
                            onClick={prevMonth}
                            className="w-7 h-7 flex items-center justify-center rounded-md text-[#64748B] hover:bg-white hover:text-[#14b8a6] hover:shadow-sm transition-all"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={nextMonth}
                            className="w-7 h-7 flex items-center justify-center rounded-md text-[#64748B] hover:bg-white hover:text-[#14b8a6] hover:shadow-sm transition-all"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="border border-[#E2E8F0] rounded-xl overflow-hidden bg-white">
                {isError ? (
                    <div className="px-4 py-3 text-sm text-[#B91C1C] bg-[#FEF2F2] border-b border-[#FECACA]">
                        {t('common:error.fetch')} - {t('common:error.try_again')}
                    </div>
                ) : null}
                <div className="grid grid-cols-7 border-b border-[#E2E8F0] bg-[#F8FAFC]">
                    {weekdayLabels.map((day, idx) => (
                        <div 
                            key={day} 
                            className={clsx(
                                "py-3 text-center text-[11px] font-bold uppercase tracking-wider",
                                idx === 6 ? "text-[#EF4444]" : "text-[#94A3B8]",
                                idx > 0 && "border-l border-[#E2E8F0]"
                            )}
                        >
                            {day}
                        </div>
                    ))}
                </div>
                
                <div className="grid grid-cols-7">
                    {days.map((dayObj, i) => {
                        const dStr = formatYMD(dayObj.date);
                        const isToday = dStr === todayStr;
                        const isSelected = dStr === selectedDate;
                        const status = schedulesByDate.get(dStr);
                        const isWeekend = dayObj.date.getDay() === 0 || dayObj.date.getDay() === 6;

                        return (
                            <div 
                                key={dStr} 
                                onClick={() => onSelectDate?.(dStr === selectedDate ? undefined : dStr)}
                                className={clsx(
                                    "min-h-[90px] p-2 border-b border-[#E2E8F0] relative flex flex-col items-center cursor-pointer transition-colors hover:bg-[#F8FAFC]",
                                    (i % 7 !== 0) && "border-l border-[#E2E8F0]",
                                    !dayObj.isCurrentMonth && "bg-[#F8FAFC] opacity-60",
                                    isSelected && "bg-[#dff7f4] hover:bg-[#dff7f4]"
                                )}
                            >
                                <span className={clsx(
                                    "text-[14px] font-semibold flex items-center justify-center w-8 h-8 rounded-full mb-2",
                                    isSelected ? "bg-[#14b8a6] text-white" : 
                                    isToday ? "bg-[#F1F5F9] text-[#14b8a6]" : 
                                    !dayObj.isCurrentMonth ? "text-[#CBD5E1]" : 
                                    isWeekend ? "text-[#EF4444]" : "text-[#1E293B]"
                                )}>
                                    {dayObj.date.getDate()}
                                </span>

                                {status && (
                                    <div className="mt-auto flex gap-1 items-center justify-center w-full pb-1">
                                        {status.hasAvailable && (
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#14b8a6]" title={t('schedules:calendar.available')} />
                                        )}
                                        {status.hasFullOrCancelled && (
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" title={t('schedules:calendar.full_or_cancelled_title')} />
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default SchedulesCalendar;
