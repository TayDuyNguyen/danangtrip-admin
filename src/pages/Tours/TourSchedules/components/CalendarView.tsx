import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Schedule } from '@/types/schedule';
import { ScheduleStatus } from '@/types/schedule';

interface CalendarViewProps {
    schedules?: Schedule[];
    selectedDate?: string; // YYYY-MM-DD
    onSelectDate: (date: string | undefined) => void;
}

const CalendarView = ({ schedules, selectedDate, onSelectDate }: CalendarViewProps) => {
    const { t } = useTranslation(['schedules', 'common']);
    const [currentMonth, setCurrentMonth] = useState(new Date());

    // Generate calendar days
    const { daysInMonth, startDayOfWeek, monthName, year } = useMemo(() => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        // 0 (Sun) to 6 (Sat)
        const startDayOfWeek = new Date(year, month, 1).getDay();
        const monthName = currentMonth.toLocaleString('default', { month: 'long' });
        return { daysInMonth, startDayOfWeek, monthName, year };
    }, [currentMonth]);

    // Map schedules to dates
    const scheduleMap = useMemo(() => {
        const map = new Map<string, { total: number, available: number, full: number, cancelled: number }>();
        if (!schedules) return map;
        
        schedules.forEach((schedule: Schedule) => {
            const start = schedule.startDate;
            if (!start) return;
            const dateStr = start.split('T')[0];
            const current = map.get(dateStr) || { total: 0, available: 0, full: 0, cancelled: 0 };
            
            current.total++;
            if (schedule.status === ScheduleStatus.AVAILABLE) current.available++;
            if (schedule.status === ScheduleStatus.FULL) current.full++;
            if (schedule.status === ScheduleStatus.CANCELLED) current.cancelled++;
            
            map.set(dateStr, current);
        });
        return map;
    }, [schedules]);

    const prevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    const handleDayClick = (day: number) => {
        const m = currentMonth.getMonth() + 1;
        const d = day;
        const dateStr = `${currentMonth.getFullYear()}-${m.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
        
        if (selectedDate === dateStr) {
            onSelectDate(undefined); // Toggle off
        } else {
            onSelectDate(dateStr);
        }
    };

    const isToday = (day: number) => {
        const today = new Date();
        return day === today.getDate() && 
               currentMonth.getMonth() === today.getMonth() && 
               currentMonth.getFullYear() === today.getFullYear();
    };

    const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-[#dff7f4] text-[#14b8a6] rounded-lg">
                        <CalendarIcon className="w-5 h-5" />
                    </div>
                    <h2 className="text-lg font-bold text-gray-800 capitalize">
                        {monthName} {year}
                    </h2>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={prevMonth}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-900"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button 
                        onClick={nextMonth}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-900"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-2">
                {/* Days Header */}
                {days.map(day => (
                    <div key={day} className="text-center text-xs font-semibold text-gray-400 pb-2">
                        {day}
                    </div>
                ))}

                {/* Empty cells for start of month */}
                {Array.from({ length: startDayOfWeek }).map((_, index) => (
                    <div key={`empty-${index}`} className="h-24 rounded-xl bg-transparent" />
                ))}

                {/* Day cells */}
                {Array.from({ length: daysInMonth }).map((_, index) => {
                    const day = index + 1;
                    const m = currentMonth.getMonth() + 1;
                    const dateStr = `${currentMonth.getFullYear()}-${m.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                    const isSelected = selectedDate === dateStr;
                    const isCurrentDay = isToday(day);
                    const dayData = scheduleMap.get(dateStr);

                    return (
                        <div 
                            key={day}
                            onClick={() => handleDayClick(day)}
                            className={`
                                relative h-24 rounded-xl border p-2 cursor-pointer transition-all duration-200 flex flex-col
                                ${isSelected 
                                    ? 'border-[#14b8a6] bg-[#dff7f4] ring-2 ring-[#14b8a6]/25' 
                                    : 'border-gray-100 hover:border-[#99f6e4] hover:bg-[#dff7f4]/50 bg-white'
                                }
                            `}
                        >
                            <div className="flex justify-between items-start">
                                <span className={`
                                    text-sm font-semibold flex items-center justify-center w-7 h-7 rounded-full
                                    ${isCurrentDay ? 'bg-[#14b8a6] text-white' : (isSelected ? 'text-[#0f766e]' : 'text-gray-700')}
                                `}>
                                    {day}
                                </span>
                            </div>

                            {/* Schedule Indicators */}
                            {dayData && dayData.total > 0 && (
                                <div className="mt-auto flex flex-col gap-1">
                                    {dayData.available > 0 && (
                                        <div className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-[#dff7f4] text-[#0f766e] truncate">
                                            {dayData.available} {t('schedules:status.available')}
                                        </div>
                                    )}
                                    {dayData.full > 0 && (
                                        <div className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-red-100 text-red-700 truncate">
                                            {dayData.full} {t('schedules:status.full')}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CalendarView;
