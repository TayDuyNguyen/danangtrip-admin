import React, { useMemo } from 'react';
import { Calendar, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import CustomSelect, { type Option } from '@/components/ui/CustomSelect';
import type { UsersReportFilters, UsersExportFilters } from '@/dataHelper/report.dataHelper';

interface UsersReportFilterBarProps {
    filters: UsersReportFilters & UsersExportFilters;
    onFilterChange: (updated: Partial<UsersReportFilters & UsersExportFilters>) => void;
    onApply: () => void;
    onReset: () => void;
    isSubmitting?: boolean;
}

const UsersReportFilterBar: React.FC<UsersReportFilterBarProps> = ({
    filters,
    onFilterChange,
    onApply,
    onReset,
    isSubmitting = false,
}) => {
    const { t } = useTranslation('users_report');

    // Dynamically generate years from 2020 up to 2027 (laravel backend validator bound)
    const currentYear = new Date().getFullYear();
    const maxYear = Math.min(2027, currentYear + 1);
    const yearOptions: Option[] = useMemo(
        () =>
            Array.from({ length: maxYear - 2020 + 1 }, (_, i) => 2020 + i)
                .reverse()
                .map((y) => ({ value: y, label: t('filter.year_value', { year: y }) })),
        [maxYear, t]
    );

    const roleOptions: Option[] = useMemo(
        () => [
            { value: 'all', label: t('filter.role_all') },
            { value: 'admin', label: t('filter.role_admin') },
            { value: 'user', label: t('filter.role_user') },
        ],
        [t]
    );

    const statusOptions: Option[] = useMemo(
        () => [
            { value: 'all', label: t('filter.status_all') },
            { value: 'active', label: t('filter.status_active') },
            { value: 'banned', label: t('filter.status_banned') },
        ],
        [t]
    );

    const selectedYear = yearOptions.find((o) => o.value === filters.year) ?? yearOptions[0];
    const selectedRole = roleOptions.find((o) => o.value === filters.role) ?? roleOptions[0];
    const selectedStatus = statusOptions.find((o) => o.value === filters.status) ?? statusOptions[0];

    return (
        <div className="p-[1px] rounded-3xl bg-gradient-to-br from-[#14b8a6]/20 via-slate-200/25 to-slate-100/10 shadow-xs hover:shadow-md hover:from-[#14b8a6]/30 transition-all duration-300 mb-6">
            <div className="bg-white/95 backdrop-blur-md rounded-[23px] p-6 flex flex-col gap-6">
                {/* Inputs grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                    {/* Year Select (Controls Visualizations) */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                            <Calendar size={13} className="text-[#14b8a6]" />
                            {t('filter.year_label')}
                        </label>
                        <CustomSelect
                            inputId="users-filter-year"
                            options={yearOptions}
                            value={selectedYear}
                            onChange={(opt) =>
                                onFilterChange({ year: Number((opt as Option).value) })
                            }
                            isDisabled={isSubmitting}
                            size="sm"
                        />
                    </div>

                    {/* Role Select (Export Only) */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                            <Calendar size={13} className="text-[#14b8a6]" />
                            {t('filter.role_label')}
                        </label>
                        <CustomSelect
                            inputId="users-filter-role"
                            options={roleOptions}
                            value={selectedRole}
                            onChange={(opt) =>
                                onFilterChange({ role: (opt as Option).value as UsersExportFilters['role'] })
                            }
                            isDisabled={isSubmitting}
                            size="sm"
                        />
                    </div>

                    {/* Status Select (Export Only) */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                            <Calendar size={13} className="text-[#14b8a6]" />
                            {t('filter.status_label')}
                        </label>
                        <CustomSelect
                            inputId="users-filter-status"
                            options={statusOptions}
                            value={selectedStatus}
                            onChange={(opt) =>
                                onFilterChange({ status: (opt as Option).value as UsersExportFilters['status'] })
                            }
                            isDisabled={isSubmitting}
                            size="sm"
                        />
                    </div>
                </div>

                {/* Info Text & Control buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-center border-t border-slate-100 pt-4">
                    {/* Tooltip explaining filter behavior */}
                    <div className="text-xs font-medium text-slate-400">
                        {t('filter.tip_text')}
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2 w-full sm:w-auto shrink-0 justify-end">
                        <button
                            type="button"
                            id="users-filter-reset"
                            onClick={onReset}
                            disabled={isSubmitting}
                            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold border border-slate-100 text-slate-500 hover:bg-[#14b8a6]/5 hover:text-[#14b8a6] hover:border-[#14b8a6]/20 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                        >
                            <RefreshCw size={15} />
                            {t('filter.btn_reset')}
                        </button>
                        <button
                            type="button"
                            id="users-filter-apply"
                            onClick={onApply}
                            disabled={isSubmitting}
                            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-[#14b8a6] hover:bg-[#0f766e] text-white shadow-md shadow-[#14b8a6]/10 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
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
    );
};

export default UsersReportFilterBar;
