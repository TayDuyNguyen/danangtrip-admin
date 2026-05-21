import React from 'react';
import { Calendar, Filter, RefreshCw } from 'lucide-react';

interface ReportFilterBarProps {
    filters: {
        from: string;
        to: string;
        status: 'all' | 'pending' | 'approved' | 'rejected';
        type: 'all' | 'location' | 'tour';
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
        <div className="bg-white/80 backdrop-blur-md border border-slate-100 rounded-2xl p-6 shadow-xs mb-6 transition-all duration-300">
            <div className="flex flex-col gap-6">
                {/* Inputs grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    {/* Date From */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                            <Calendar size={13} className="text-[#14b8a6]" />
                            Từ ngày
                        </label>
                        <input
                            type="date"
                            value={filters.from}
                            onChange={(e) => onFilterChange({ from: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#14b8a6]/20 focus:border-[#14b8a6] transition-all"
                        />
                    </div>

                    {/* Date To */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                            <Calendar size={13} className="text-[#14b8a6]" />
                            Đến ngày
                        </label>
                        <input
                            type="date"
                            value={filters.to}
                            onChange={(e) => onFilterChange({ to: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#14b8a6]/20 focus:border-[#14b8a6] transition-all"
                        />
                    </div>

                    {/* Status Select */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                            <Filter size={13} className="text-[#14b8a6]" />
                            Trạng thái duyệt
                        </label>
                        <select
                            value={filters.status}
                            onChange={(e) => onFilterChange({ status: e.target.value as 'all' | 'pending' | 'approved' | 'rejected' })}
                            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#14b8a6]/20 focus:border-[#14b8a6] transition-all appearance-none cursor-pointer"
                        >
                            <option value="all">Tất cả trạng thái</option>
                            <option value="pending">Chờ duyệt</option>
                            <option value="approved">Đã duyệt</option>
                            <option value="rejected">Từ chối</option>
                        </select>
                    </div>

                    {/* Type Select */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                            <Filter size={13} className="text-[#14b8a6]" />
                            Phân loại
                        </label>
                        <select
                            value={filters.type}
                            onChange={(e) => onFilterChange({ type: e.target.value as 'all' | 'location' | 'tour' })}
                            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#14b8a6]/20 focus:border-[#14b8a6] transition-all appearance-none cursor-pointer"
                        >
                            <option value="all">Tất cả loại hình</option>
                            <option value="location">Địa điểm</option>
                            <option value="tour">Tour du lịch</option>
                        </select>
                    </div>
                </div>

                {/* Quick ranges and control buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-center border-t border-slate-50 pt-4">
                    {/* Quick ranges pills */}
                    <div className="flex flex-wrap gap-2 items-center w-full sm:w-auto">
                        <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mr-1">Bộ lọc nhanh:</span>
                        <button
                            type="button"
                            onClick={() => applyQuickRange('7days')}
                            className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                        >
                            7 ngày
                        </button>
                        <button
                            type="button"
                            onClick={() => applyQuickRange('30days')}
                            className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                        >
                            30 ngày
                        </button>
                        <button
                            type="button"
                            onClick={() => applyQuickRange('3months')}
                            className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                        >
                            3 tháng
                        </button>
                        <button
                            type="button"
                            onClick={() => applyQuickRange('thisyear')}
                            className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                        >
                            Năm nay
                        </button>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2 w-full sm:w-auto shrink-0 justify-end">
                        <button
                            type="button"
                            onClick={onReset}
                            disabled={isSubmitting}
                            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold border border-slate-100 text-slate-500 hover:bg-slate-50 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                        >
                            <RefreshCw size={15} />
                            Mặc định
                        </button>
                        <button
                            type="button"
                            onClick={onApply}
                            disabled={isSubmitting}
                            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-[#14b8a6] hover:bg-[#0f766e] text-white shadow-md shadow-[#14b8a6]/10 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                        >
                            {isSubmitting ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : null}
                            Áp dụng
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportFilterBar;
