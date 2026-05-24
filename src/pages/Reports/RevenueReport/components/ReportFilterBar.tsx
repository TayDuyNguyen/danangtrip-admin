import React, { useMemo } from 'react';
import { Calendar, Filter, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import CustomSelect, { type Option } from '@/components/ui/CustomSelect';

interface ReportFilterBarProps {
    filters: {
        from: string;
        to: string;
        payment_gateway: string;
    };
    onFilterChange: (updated: Partial<ReportFilterBarProps['filters']>) => void;
    onApply: () => void;
    onReset: () => void;
    isSubmitting?: boolean;
}

const ReportFilterBar: React.FC<ReportFilterBarProps> = ({
    filters,
    onFilterChange,
    onApply,
    onReset,
    isSubmitting = false,
}) => {
    const { t } = useTranslation(['revenue_report', 'common']);
    const gatewayOptions: Option[] = useMemo(
        () => [
            { value: 'all', label: t('filter.gateway_all') },
            { value: 'momo', label: 'MoMo' },
            { value: 'vnpay', label: 'VNPay' },
            { value: 'zalopay', label: 'ZaloPay' },
        ],
        [t]
    );
    const selectedGateway = gatewayOptions.find((option) => option.value === filters.payment_gateway) ?? gatewayOptions[0];

    const getQuickRangeDates = (range: '7days' | '30days' | '3months' | 'thisyear') => {
        const today = new Date();
        let fromDate = new Date();

        if (range === '7days') {
            fromDate.setDate(today.getDate() - 7);
        } else if (range === '30days') {
            fromDate.setDate(today.getDate() - 30);
        } else if (range === '3months') {
            fromDate.setMonth(today.getMonth() - 3);
        } else if (range === 'thisyear') {
            fromDate = new Date(today.getFullYear(), 0, 1);
        }

        const formatDateStr = (date: Date) => date.toISOString().split('T')[0];

        return {
            from: formatDateStr(fromDate),
            to: formatDateStr(today),
        };
    };

    const applyQuickRange = (range: '7days' | '30days' | '3months' | 'thisyear') => {
        onFilterChange(getQuickRangeDates(range));
    };

    const isQuickRangeActive = (range: '7days' | '30days' | '3months' | 'thisyear') => {
        const rangeDates = getQuickRangeDates(range);
        return filters.from === rangeDates.from && filters.to === rangeDates.to;
    };

    const quickRangeButtonClass = (range: '7days' | '30days' | '3months' | 'thisyear') =>
        `px-3.5 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
            isQuickRangeActive(range)
                ? 'bg-[#14b8a6] border-[#14b8a6] text-white shadow-xs'
                : 'bg-surface hover:bg-[#14b8a6]/5 hover:text-[#14b8a6] border-[#E2E8F0] hover:border-[#14b8a6]/20 text-text-primary/70'
        }`;

    return (
        <div className="p-px rounded-3xl bg-linear-to-br from-[#14b8a6]/20 via-slate-200/25 to-slate-100/10 shadow-xs hover:shadow-md hover:from-[#14b8a6]/30 transition-all duration-300 mb-6">
            <div className="bg-white rounded-[23px] p-6">
                <div className="flex flex-col gap-6">
                    {/* Inputs Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
                        {/* Date From */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                <Calendar size={13} className="text-[#14b8a6]" />
                                {t('filter.from_date')}
                            </label>
                            <input
                                type="date"
                                value={filters.from}
                                onChange={(e) => onFilterChange({ from: e.target.value })}
                                className="w-full bg-surface border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-sm font-bold text-text-primary focus:outline-hidden focus:ring-2 focus:ring-[#14b8a6]/20 focus:border-[#14b8a6] transition-all"
                            />
                        </div>

                        {/* Date To */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                <Calendar size={13} className="text-[#14b8a6]" />
                                {t('filter.to_date')}
                            </label>
                            <input
                                type="date"
                                value={filters.to}
                                onChange={(e) => onFilterChange({ to: e.target.value })}
                                className="w-full bg-surface border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-sm font-bold text-text-primary focus:outline-hidden focus:ring-2 focus:ring-[#14b8a6]/20 focus:border-[#14b8a6] transition-all"
                            />
                        </div>

                        {/* Payment Gateway */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                <Filter size={13} className="text-[#14b8a6]" />
                                {t('filter.payment_gateway')}
                            </label>
                            <CustomSelect
                                inputId="revenue-filter-payment-gateway"
                                options={gatewayOptions}
                                value={selectedGateway}
                                onChange={(option) => onFilterChange({ payment_gateway: String((option as Option).value) })}
                                isDisabled={isSubmitting}
                                size="sm"
                            />
                        </div>
                    </div>

                    {/* Quick ranges and control buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-center border-t border-border pt-4">
                        {/* Quick ranges pills */}
                        <div className="flex flex-wrap gap-2 items-center w-full sm:w-auto">
                            <span className="text-[11px] font-extrabold text-text-secondary uppercase tracking-wider mr-1">
                                {t('filter.quick_filters')}:
                            </span>
                            <button
                                type="button"
                                onClick={() => applyQuickRange('7days')}
                                className={quickRangeButtonClass('7days')}
                            >
                                {t('filter.range_7days')}
                            </button>
                            <button
                                type="button"
                                onClick={() => applyQuickRange('30days')}
                                className={quickRangeButtonClass('30days')}
                            >
                                {t('filter.range_30days')}
                            </button>
                            <button
                                type="button"
                                onClick={() => applyQuickRange('3months')}
                                className={quickRangeButtonClass('3months')}
                            >
                                {t('filter.range_3months')}
                            </button>
                            <button
                                type="button"
                                onClick={() => applyQuickRange('thisyear')}
                                className={quickRangeButtonClass('thisyear')}
                            >
                                {t('filter.range_thisyear')}
                            </button>
                        </div>

                        {/* Submit / Reset Actions */}
                        <div className="flex gap-3 items-center w-full sm:w-auto justify-end">
                            <button
                                type="button"
                                onClick={onReset}
                                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold border border-[#E2E8F0] text-text-primary/70 hover:bg-surface active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                            >
                                <RefreshCw size={15} />
                                {t('filter.btn_reset')}
                            </button>

                            <button
                                type="button"
                                onClick={onApply}
                                disabled={isSubmitting}
                                className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-[#14b8a6] hover:bg-[#0f766e] text-white shadow-md shadow-[#14b8a6]/10 active:scale-95 disabled:opacity-50 cursor-pointer"
                            >
                                {isSubmitting ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : null}
                                {t('filter.btn_apply')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportFilterBar;
