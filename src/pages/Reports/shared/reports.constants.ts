export const REPORTS_MOCK_PARAM = 'mock';
export const REPORTS_HUB_PATH = '/admin/reports/revenue';

export const REPORT_PER_PAGE_OPTIONS = [10, 20, 50] as const;

export type ReportPerPage = (typeof REPORT_PER_PAGE_OPTIONS)[number];

export function parseReportPerPage(value: string | null): number {
    const n = Number(value);
    return REPORT_PER_PAGE_OPTIONS.includes(n as ReportPerPage) ? n : 10;
}
