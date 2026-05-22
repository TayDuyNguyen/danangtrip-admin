import React from 'react';
import { Calendar, Filter, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

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

    const applyQuickRange = (range: '7days' | '30days' | '3months' | 'thisyear') => {
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

        onFilterChange({
            from: formatDateStr(fromDate),
            to: formatDateStr(today),
        });
    };

    return (
        <div className="bg-white/85 backdrop-blur-md border border-slate-100 rounded-2xl p-6 shadow-xs mb-6 transition-all duration-300">
            <div className="flex flex-col gap-6">
                {/* Inputs Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
                    {/* Date From */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                            <Calendar size={13} className="text-emerald-500" />
                            {t('filter.from_date')}
                        </label>
                        <input
                            type="date"
                            value={filters.from}
                            onChange={(e) => onFilterChange({ from: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                        />
                    </div>

                    {/* Date To */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                            <Calendar size={13} className="text-emerald-500" />
                            {t('filter.to_date')}
                        </label>
                        <input
                            type="date"
                            value={filters.to}
                            onChange={(e) => onFilterChange({ to: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                        />
                    </div>

                    {/* Payment Gateway */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                            <Filter size={13} className="text-emerald-500" />
                            {t('filter.payment_gateway')}
                        </label>
                        <select
                            value={filters.payment_gateway}
                            onChange={(e) => onFilterChange({ payment_gateway: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all appearance-none cursor-pointer"
                        >
                            <option value="all">{t('filter.gateway_all')}</option>
                            <option value="momo">MoMo</option>
                            <option value="vnpay">VNPay</option>
                            <option value="zalopay">ZaloPay</option>
                        </select>
                    </div>
                </div>

                {/* Quick ranges and control buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-center border-t border-slate-50 pt-4">
                    {/* Quick ranges pills */}
                    <div className="flex flex-wrap gap-2 items-center w-full sm:w-auto">
                        <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mr-1">
                            {t('filter.quick_filters')}
                        </span>
                        <button
                            type="button"
                            onClick={() => applyQuickRange('7days')}
                            className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                        >
                            {t('filter.range_7days')}
                        </button>
                        <button
                            type="button"
                            onClick={() => applyQuickRange('30days')}
                            className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                        >
                            {t('filter.range_30days')}
                        </button>
                        <button
                            type="button"
                            onClick={() => applyQuickRange('3months')}
                            className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                        >
                            {t('filter.range_3months')}
                        </button>
                        <button
                            type="button"
                            onClick={() => applyQuickRange('thisyear')}
                            className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                        >
                            {t('filter.range_thisyear')}
                        </button>
                    </div>

                    {/* Submit / Reset Actions */}
                    <div className="flex gap-3 items-center w-full sm:w-auto justify-end">
                        <button
                            type="button"
                            onClick={onReset}
                            className="px-5 py-2.5 rounded-xl text-xs font-extrabold border border-slate-100 bg-white text-slate-500 hover:bg-slate-50 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                            <RefreshCw size={13} />
                            {t('filter.btn_reset')}
                        </button>

                        <button
                            type="button"
                            onClick={onApply}
                            disabled={isSubmitting}
                            className="px-6 py-2.5 rounded-xl text-xs font-extrabold bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm shadow-emerald-500/10 active:scale-95 disabled:opacity-50 disabled:active:scale-100 transition-all cursor-pointer"
                        >
                            {t('filter.btn_apply')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportFilterBar;
