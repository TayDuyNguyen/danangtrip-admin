import type { FormEvent } from 'react';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Search, X } from 'lucide-react';
import type { BookingListFilters } from '@/dataHelper/booking.dataHelper';
import CustomSelect, { type Option } from '@/components/ui/CustomSelect';
import { TextInput } from '@/components/ui/TextInput';

interface Props {
    filters: BookingListFilters;
    onFilterChange: (filters: BookingListFilters) => void;
}

const createLocalFilters = (filters: BookingListFilters): BookingListFilters => ({
    user_id: filters.user_id,
    search: filters.search || '',
    status: filters.status || 'all',
    payment_status: filters.payment_status || 'all',
    date_from: filters.date_from || '',
    date_to: filters.date_to || '',
    sort: filters.sort || 'booked_at',
    order: filters.order || 'desc',
});

const BookingFilter = ({ filters, onFilterChange }: Props) => {
    const { t } = useTranslation('booking');
    const searchId = useId();
    const [localFilters, setLocalFilters] = useState<BookingListFilters>(() => createLocalFilters(filters));

    const handleLocalChange = <K extends keyof BookingListFilters>(key: K, value: BookingListFilters[K]) => {
        setLocalFilters((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const applyFilters = (nextFilters = localFilters) => {
        onFilterChange({
            ...nextFilters,
            user_id: nextFilters.user_id || filters.user_id,
            search: nextFilters.search?.trim() || '',
            status: nextFilters.status || 'all',
            payment_status: nextFilters.payment_status || 'all',
            date_from: nextFilters.date_from || '',
            date_to: nextFilters.date_to || '',
            sort: nextFilters.sort || 'booked_at',
            order: nextFilters.order || 'desc',
        });
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        applyFilters();
    };

    const handleReset = () => {
        const resetFilters = createLocalFilters({
            search: '',
            user_id: filters.user_id,
            status: 'all',
            payment_status: 'all',
            date_from: '',
            date_to: '',
            sort: filters.sort || 'booked_at',
            order: filters.order || 'desc',
        });

        setLocalFilters(resetFilters);
        applyFilters(resetFilters);
    };

    const clearFilter = (key: keyof BookingListFilters) => {
        const nextFilters: BookingListFilters = {
            ...localFilters,
            [key]: key === 'status' || key === 'payment_status' ? 'all' : '',
        };

        setLocalFilters(nextFilters);
        applyFilters(nextFilters);
    };

    const activeFilters = [
        localFilters.status && localFilters.status !== 'all' && {
            key: 'status' as const,
            label: `${t('filters.status_label')}: ${t(`status.${localFilters.status}`)}`,
        },
        localFilters.payment_status && localFilters.payment_status !== 'all' && {
            key: 'payment_status' as const,
            label: `${t('filters.payment_label')}: ${t(`payment_status.${localFilters.payment_status}`)}`,
        },
        localFilters.date_from && {
            key: 'date_from' as const,
            label: `${t('filters.from_label')}: ${localFilters.date_from}`,
        },
        localFilters.date_to && {
            key: 'date_to' as const,
            label: `${t('filters.to_label')}: ${localFilters.date_to}`,
        },
    ].filter(Boolean) as { key: keyof BookingListFilters; label: string }[];

    const hasActiveFilters = activeFilters.length > 0 || (localFilters.search || '') !== '';

    return (
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs">
            <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-3">
                <div className="min-w-[280px] flex-1">
                    <TextInput
                        id={searchId}
                        type="search"
                        value={localFilters.search || ''}
                        onChange={(e) => handleLocalChange('search', e.target.value)}
                        placeholder={t('filters.search_placeholder')}
                        leftIcon={<Search className="text-slate-400 group-focus-within:text-[#14b8a6]" size={18} />}
                        containerClassName="group"
                        className="h-12 rounded-2xl border-[#E2E8F0] bg-slate-50 text-[14px] font-medium text-slate-900 transition-all focus:border-[#14b8a6] focus:bg-white"
                    />
                </div>

                <CustomSelect
                    options={[
                        { value: 'all', label: t('filters.all_status') },
                        { value: 'pending', label: t('status.pending') },
                        { value: 'confirmed', label: t('status.confirmed') },
                        { value: 'completed', label: t('status.completed') },
                        { value: 'cancelled', label: t('status.cancelled') },
                    ]}
                    value={{
                        value: localFilters.status || 'all',
                        label: localFilters.status === 'all' ? t('filters.all_status') : t(`status.${localFilters.status}`),
                    } as Option}
                    onChange={(opt) => handleLocalChange('status', (opt as Option)?.value as BookingListFilters['status'])}
                    className="w-[170px]"
                />

                <CustomSelect
                    options={[
                        { value: 'all', label: t('filters.all_payment') },
                        { value: 'pending', label: t('payment_status.pending') },
                        { value: 'paid', label: t('payment_status.paid') },
                        { value: 'refunded', label: t('payment_status.refunded') },
                    ]}
                    value={{
                        value: localFilters.payment_status || 'all',
                        label:
                            localFilters.payment_status === 'all'
                                ? t('filters.all_payment')
                                : t(`payment_status.${localFilters.payment_status}`),
                    } as Option}
                    onChange={(opt) =>
                        handleLocalChange('payment_status', (opt as Option)?.value as BookingListFilters['payment_status'])
                    }
                    className="w-[170px]"
                />

                <div className="group relative w-[150px]">
                    <Calendar
                        size={14}
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-[#14b8a6]"
                    />
                    <input
                        type="date"
                        value={localFilters.date_from || ''}
                        onChange={(e) => handleLocalChange('date_from', e.target.value)}
                        className="h-12 w-full rounded-2xl border border-[#E2E8F0] bg-slate-50 pl-10 pr-4 text-[13px] font-bold text-slate-900 outline-hidden transition-all focus:border-[#14b8a6] focus:bg-white"
                    />
                </div>

                <div className="group relative w-[150px]">
                    <Calendar
                        size={14}
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-[#14b8a6]"
                    />
                    <input
                        type="date"
                        value={localFilters.date_to || ''}
                        onChange={(e) => handleLocalChange('date_to', e.target.value)}
                        className="h-12 w-full rounded-2xl border border-[#E2E8F0] bg-slate-50 pl-10 pr-4 text-[13px] font-bold text-slate-900 outline-hidden transition-all focus:border-[#14b8a6] focus:bg-white"
                    />
                </div>

                <button
                    type="submit"
                    className="h-12 rounded-2xl bg-[#14b8a6] px-8 text-[14px] font-black text-white shadow-lg shadow-[#14b8a6]/20 transition-all active:scale-95 hover:bg-[#0f766e]"
                >
                    {t('filters.button_apply')}
                </button>
            </form>

            {hasActiveFilters && (
                <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-6 animate-in slide-in-from-top-2 duration-200">
                    <span className="mr-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        {t('filters.active_filtering')}
                    </span>
                    {activeFilters.map((tag) => (
                        <div
                            key={tag.key}
                            className="inline-flex items-center gap-1.5 rounded-full border border-[#14b8a6]/20 bg-[#14b8a6]/10 px-3 py-1.5 text-[12px] font-bold text-[#0f766e] transition-all hover:bg-[#14b8a6]/20"
                        >
                            {tag.label}
                            <button
                                type="button"
                                onClick={() => clearFilter(tag.key)}
                                className="rounded-full p-0.5 hover:bg-[#14b8a6]/10"
                            >
                                <X size={14} strokeWidth={2.5} />
                            </button>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={handleReset}
                        className="px-3 py-1.5 text-[12px] font-black uppercase tracking-widest text-slate-400 transition-colors hover:text-[#EF4444]"
                    >
                        {t('filters.button_reset')}
                    </button>
                </div>
            )}
        </div>
    );
};

export default BookingFilter;
