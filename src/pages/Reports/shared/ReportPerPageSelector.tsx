import { useTranslation } from 'react-i18next';
import { REPORT_PER_PAGE_OPTIONS } from './reports.constants';

type ReportPerPageSelectorProps = {
    value: number;
    onChange: (perPage: number) => void;
    testId?: string;
    disabled?: boolean;
};

export function ReportPerPageSelector({
    value,
    onChange,
    testId = 'report-per-page-select',
    disabled = false,
}: ReportPerPageSelectorProps) {
    const { t } = useTranslation('reports_common');

    return (
        <label className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
            <span className="uppercase tracking-wider">{t('pagination.per_page')}</span>
            <select
                data-testid={testId}
                disabled={disabled}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-slate-700"
            >
                {REPORT_PER_PAGE_OPTIONS.map((n) => (
                    <option key={n} value={n}>
                        {n}
                    </option>
                ))}
            </select>
        </label>
    );
}

export default ReportPerPageSelector;
