import { useEffect, useMemo, useState } from 'react';
import { Search, Filter, RotateCcw } from 'lucide-react';
import CustomSelect from '@/components/ui/CustomSelect';
import type { Option } from '@/components/ui/CustomSelect';
import { TextInput } from '@/components/ui/TextInput';
import { useTranslation } from 'react-i18next';
import type { ScheduleFilters } from '@/types/schedule';

type Props = {
    tourOptions: Option[];
    filters: ScheduleFilters;
    onApply: (patch: Partial<ScheduleFilters>) => void;
    onReset: () => void;
    hasActiveFilters: boolean;
};

const statusValue = (s: string | undefined): string => {
    if (!s || s === 'all') {
        return 'all';
    }
    return String(s).toLowerCase();
};

const FilterBar = ({ tourOptions, filters, onApply, onReset, hasActiveFilters }: Props) => {
    const { t } = useTranslation(['schedules', 'common']);
    const [q, setQ] = useState(() => filters.q ?? '');
    const [from, setFrom] = useState(() => filters.start_date ?? '');
    const [to, setTo] = useState(() => filters.end_date ?? '');

    const statusOptions = useMemo<Option[]>(
        () => [
            { value: 'all', label: t('common:labels.all') },
            { value: 'available', label: t('schedules:status.available') },
            { value: 'full', label: t('schedules:status.full') },
            { value: 'cancelled', label: t('schedules:status.cancelled') },
        ],
        [t],
    );

    const tourOption = useMemo(() => {
        const tid = filters.tour_id;
        if (tid === undefined || tid === '' || tid === 'all') {
            return tourOptions[0] ?? null;
        }
        const found = tourOptions.find((o) => String(o.value) === String(tid));
        return found ?? { value: String(tid), label: `#${tid}` };
    }, [filters.tour_id, tourOptions]);

    const statusOption = useMemo(() => {
        const sv = statusValue(filters.status);
        return statusOptions.find((o) => o.value === sv) ?? statusOptions[0];
    }, [filters.status, statusOptions]);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            const next = q.trim();
            if (next !== (filters.q ?? '').trim()) {
                onApply({ q: next, page: 1 });
            }
        }, 300);
        return () => window.clearTimeout(timer);
    }, [q, filters.q, onApply]);

    const handleApplyClick = () => {
        onApply({
            start_date: from || undefined,
            end_date: to || undefined,
            page: 1,
        });
    };

    return (
        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] space-y-4">
            <div className="flex flex-wrap gap-3 items-end">
                <div className="flex-1 min-w-[280px]">
                    <label className="block text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1.5">
                        {t('schedules:filters.search_label')}
                    </label>
                    <TextInput
                        placeholder={t('schedules:filters.search_placeholder')}
                        value={q}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQ(e.target.value)}
                        leftIcon={<Search className="w-4 h-4" />}
                        className="h-[48px]!"
                    />
                </div>

                <div className="w-full sm:w-[220px]">
                    <label className="block text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1.5">
                        {t('schedules:filters.tour_label')}
                    </label>
                    <CustomSelect
                        options={tourOptions}
                        value={tourOption}
                        onChange={(opt) =>
                            onApply({
                                tour_id: opt && String(opt.value) !== 'all' ? opt.value : undefined,
                                page: 1,
                            })
                        }
                        placeholder={t('schedules:filters.tour_placeholder')}
                    />
                </div>

                <div className="w-full sm:w-[160px]">
                    <label className="block text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1.5">
                        {t('schedules:filters.status_label')}
                    </label>
                    <CustomSelect
                        options={statusOptions}
                        value={statusOption}
                        onChange={(opt) =>
                            onApply({
                                status:
                                    opt && String(opt.value) !== 'all' ? String(opt.value) : 'all',
                                page: 1,
                            })
                        }
                        placeholder={t('schedules:filters.status_placeholder')}
                    />
                </div>

                <div className="w-full sm:w-[150px]">
                    <label className="block text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1.5">
                        {t('schedules:filters.from')}
                    </label>
                    <TextInput
                        type="date"
                        value={from}
                        onChange={(e) => setFrom(e.target.value)}
                        className="h-[48px]!"
                    />
                </div>

                <div className="w-full sm:w-[150px]">
                    <label className="block text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1.5">
                        {t('schedules:filters.to')}
                    </label>
                    <TextInput
                        type="date"
                        value={to}
                        onChange={(e) => setTo(e.target.value)}
                        className="h-[48px]!"
                    />
                </div>

                <button
                    type="button"
                    onClick={handleApplyClick}
                    className="h-[48px] px-5 bg-[#0066CC] hover:bg-[#0052a3] text-white rounded-xl flex items-center gap-2 font-bold text-sm transition-all"
                >
                    <Filter className="w-4 h-4" />
                    {t('common:actions.filter')}
                </button>

                {hasActiveFilters ? (
                    <button
                        type="button"
                        onClick={onReset}
                        className="h-[48px] px-4 border border-[#E2E8F0] rounded-xl text-[#64748B] hover:text-[#EF4444] hover:border-[#EF4444] font-bold text-sm flex items-center gap-2 transition-all"
                    >
                        <RotateCcw className="w-4 h-4" />
                        {t('common:actions.reset')}
                    </button>
                ) : null}
            </div>
        </div>
    );
};

export default FilterBar;
