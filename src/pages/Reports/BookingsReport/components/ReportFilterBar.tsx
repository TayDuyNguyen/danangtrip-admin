import React from 'react';
import { Calendar, Filter, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ReportFilterBarProps {
    filters: {
        from: string;
        to: string;
        status: 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled';
        payment_status: 'all' | 'pending' | 'paid' | 'refunded';
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
    const { t } = useTranslation('bookings_report');

    // Quick Range handlers
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
        // ─── Gradient border shell ───
        <div className="p-[1px] rounded-3xl bg-gradient-to-br from-[#14b8a6]/20 via-slate-200/25 to-slate-100/10 shadow-xs hover:shadow-md hover:from-[#14b8a6]/30 transition-all duration-300 mb-6">
            <div className="bg-white rounded-[23px] p-6">
                <div className="flex flex-col gap-6">
                    {/* Inputs grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                        {/* Date From */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-black text-[#94A3B8] uppercase tracking-widest flex items-center gap-1.5">
                                <Calendar size={13} className="text-[#14b8a6]" />
                                {t('filter.from_date')}
                            </label>
                            <input
                                type="date"
                                value={filters.from}
                                onChange={(e) => onFilterChange({ from: e.target.value })}
                                className="w-full bg-[#F8FAFC] border border-[#F1F5F9] rounded-xl px-4 py-2.5 text-sm font-bold text-[#0F172A] focus:outline-hidden focus:ring-2 focus:ring-[#14b8a6]/20 focus:border-[#14b8a6] transition-all"
                            />
                        </div>

                        {/* Date To */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-black text-[#94A3B8] uppercase tracking-widest flex items-center gap-1.5">
                                <Calendar size={13} className="text-[#14b8a6]" />
                                {t('filter.to_date')}
                            </label>
                            <input
                                type="date"
                                value={filters.to}
                                onChange={(e) => onFilterChange({ to: e.target.value })}
                                className="w-full bg-[#F8FAFC] border border-[#F1F5F9] rounded-xl px-4 py-2.5 text-sm font-bold text-[#0F172A] focus:outline-hidden focus:ring-2 focus:ring-[#14b8a6]/20 focus:border-[#14b8a6] transition-all"
                            />
                        </div>

                        {/* Booking Status Select */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-black text-[#94A3B8] uppercase tracking-widest flex items-center gap-1.5">
                                <Filter size={13} className="text-[#14b8a6]" />
                                {t('filter.booking_status')}
                            </label>
                            <select
                                value={filters.status}
                                onChange={(e) => onFilterChange({ status: e.target.value as 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled' })}
                                className="w-full bg-[#F8FAFC] border border-[#F1F5F9] rounded-xl px-4 py-2.5 text-sm font-bold text-[#0F172A] focus:outline-hidden focus:ring-2 focus:ring-[#14b8a6]/20 focus:border-[#14b8a6] transition-all appearance-none cursor-pointer"
                            >
                                <option value="all">{t('filter.status_all')}</option>
                                <option value="pending">{t('filter.status_pending')}</option>
                                <option value="confirmed">{t('filter.status_confirmed')}</option>
                                <option value="completed">{t('filter.status_completed')}</option>
                                <option value="cancelled">{t('filter.status_cancelled')}</option>
                            </select>
                        </div>

                        {/* Payment Status Select */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-black text-[#94A3B8] uppercase tracking-widest flex items-center gap-1.5">
                                <Filter size={13} className="text-[#14b8a6]" />
                                {t('filter.payment_status')}
                            </label>
                            <select
                                value={filters.payment_status}
                                onChange={(e) => onFilterChange({ payment_status: e.target.value as 'all' | 'pending' | 'paid' | 'refunded' })}
                                className="w-full bg-[#F8FAFC] border border-[#F1F5F9] rounded-xl px-4 py-2.5 text-sm font-bold text-[#0F172A] focus:outline-hidden focus:ring-2 focus:ring-[#14b8a6]/20 focus:border-[#14b8a6] transition-all appearance-none cursor-pointer"
                            >
                                <option value="all">{t('filter.payment_all')}</option>
                                <option value="pending">{t('filter.payment_pending')}</option>
                                <option value="paid">{t('filter.payment_paid')}</option>
                                <option value="refunded">{t('filter.payment_refunded')}</option>
                            </select>
                        </div>
                    </div>

                    {/* Quick ranges and control buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-center border-t border-[#F1F5F9] pt-4">
                        {/* Quick ranges pills */}
                        <div className="flex flex-wrap gap-2 items-center w-full sm:w-auto">
                            <span className="text-[11px] font-extrabold text-[#94A3B8] uppercase tracking-wider mr-1">{t('filter.quick_filters')}</span>
                            <button
                                type="button"
                                onClick={() => applyQuickRange('7days')}
                                className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#F8FAFC] border border-[#F1F5F9] hover:bg-[#14b8a6]/5 hover:border-[#14b8a6]/30 text-[#0F172A]/70 hover:text-[#14b8a6] transition-all cursor-pointer"
                            >
                                {t('filter.range_7days')}
                            </button>
                            <button
                                type="button"
                                onClick={() => applyQuickRange('30days')}
                                className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#F8FAFC] border border-[#F1F5F9] hover:bg-[#14b8a6]/5 hover:border-[#14b8a6]/30 text-[#0F172A]/70 hover:text-[#14b8a6] transition-all cursor-pointer"
                            >
                                {t('filter.range_30days')}
                            </button>
                            <button
                                type="button"
                                onClick={() => applyQuickRange('3months')}
                                className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#F8FAFC] border border-[#F1F5F9] hover:bg-[#14b8a6]/5 hover:border-[#14b8a6]/30 text-[#0F172A]/70 hover:text-[#14b8a6] transition-all cursor-pointer"
                            >
                                {t('filter.range_3months')}
                            </button>
                            <button
                                type="button"
                                onClick={() => applyQuickRange('thisyear')}
                                className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#F8FAFC] border border-[#F1F5F9] hover:bg-[#14b8a6]/5 hover:border-[#14b8a6]/30 text-[#0F172A]/70 hover:text-[#14b8a6] transition-all cursor-pointer"
                            >
                                {t('filter.range_thisyear')}
                            </button>
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-2 w-full sm:w-auto shrink-0 justify-end">
                            <button
                                type="button"
                                onClick={onReset}
                                disabled={isSubmitting}
                                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold border border-[#E2E8F0] hover:border-[#14b8a6] hover:bg-[#14b8a6]/5 hover:text-[#14b8a6] text-[#0F172A]/80 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                            >
                                <RefreshCw size={15} />
                                {t('filter.btn_reset')}
                            </button>
                            <button
                                type="button"
                                onClick={onApply}
                                disabled={isSubmitting}
                                className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-[#14b8a6] hover:bg-[#0f766e] text-white shadow-xs active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
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

