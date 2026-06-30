import { useTranslation } from 'react-i18next';
import { Edit2, Trash2, Globe, Calendar, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';
import type { LandingPage, LandingPageStatus } from '@/types/landingPage.types';
import ToggleSwitch from '@/components/ui/ToggleSwitch';
import LoadingReact from '@/components/loading';
import Badge from '@/components/ui/Badge';

interface LandingPageTableProps {
    data: LandingPage[];
    isLoading: boolean;
    total: number;
    page: number;
    limit: number;
    onPageChange: (page: number) => void;
    onLimitChange: (limit: number) => void;
    onEdit: (landing: LandingPage) => void;
    onDelete: (id: number, slug: string) => void;
    onStatusToggle: (id: number, currentStatus: LandingPageStatus) => void;
}

const LandingPageTable = ({
    data,
    isLoading,
    total,
    page,
    limit,
    onPageChange,
    onLimitChange,
    onEdit,
    onDelete,
    onStatusToggle
}: LandingPageTableProps) => {
    const { t } = useTranslation('landing_pages');

    const getPageTypeLabel = (type: string) => {
        switch (type) {
            case 'destination':
                return t('types.destination');
            case 'tour_line':
                return t('types.tour_line');
            case 'promotion':
                return t('types.promotion');
            default:
                return type;
        }
    };

    const getPageTypeVariant = (type: string) => {
        switch (type) {
            case 'destination':
                return 'success' as const;
            case 'tour_line':
                return 'default' as const;
            case 'promotion':
                return 'warning' as const;
            default:
                return 'neutral' as const;
        }
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '—';
        const date = new Date(dateStr);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="bg-white border border-[#E2E8F0] rounded-[16px] shadow-xs overflow-hidden flex flex-col min-w-0">
            {/* Header Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-4 border-b border-[#E2E8F0] gap-4">
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                    {t('title')} ({total})
                </h2>

                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                    <span className="text-[13px] text-slate-400 font-medium font-sans">
                        Hiển thị {total > 0 ? (page - 1) * limit + 1 : 0}–{Math.min(page * limit, total)} trong tổng {total} mục
                    </span>
                    <select
                        value={limit}
                        onChange={(e) => onLimitChange(Number(e.target.value))}
                        className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:border-[#14b8a6] outline-hidden font-bold text-slate-700"
                    >
                        {[10, 20, 50].map(v => (
                            <option key={v} value={v}>
                                {t('pagination.items_per_page', { count: v, defaultValue: `${v} dòng/trang` })}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Scrollable Table Container */}
            <div className="overflow-x-auto custom-scrollbar-horizontal">
                <table className="w-full text-left border-collapse table-fixed min-w-[1000px]">
                    <thead className="bg-slate-50 border-b border-[#E2E8F0]">
                        <tr>
                            <th className="px-4 py-3 text-[11px] font-black text-slate-500 uppercase tracking-wider w-[50px] text-center">#</th>
                            <th className="px-4 py-3 text-[11px] font-black text-slate-500 uppercase tracking-wider w-[240px]">{t('table.title')}</th>
                            <th className="px-4 py-3 text-[11px] font-black text-slate-500 uppercase tracking-wider w-[200px]">{t('table.slug')}</th>
                            <th className="px-4 py-3 text-[11px] font-black text-slate-500 uppercase tracking-wider w-[150px]">{t('table.type')}</th>
                            <th className="px-4 py-3 text-[11px] font-black text-slate-500 uppercase tracking-wider w-[140px] text-center">{t('table.status')}</th>
                            <th className="px-4 py-3 text-[11px] font-black text-slate-500 uppercase tracking-wider w-[180px]">{t('table.updated_at')}</th>
                            <th className="px-4 py-3 text-[11px] font-black text-slate-500 uppercase tracking-wider w-[120px] text-right pr-6">{t('table.actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0]">
                        {isLoading ? (
                            <tr>
                                <td colSpan={7} className="py-[100px] text-center">
                                    <LoadingReact />
                                </td>
                            </tr>
                        ) : data.length > 0 ? (
                            data.map((landing, index) => (
                                <tr
                                    key={landing.id}
                                    className="hover:bg-slate-50/50 transition-colors"
                                >
                                    {/* Index */}
                                    <td className="px-4 py-3.5 text-center text-xs font-semibold text-slate-400 font-sans">
                                        {index + (page - 1) * limit + 1}
                                    </td>

                                    {/* Title */}
                                    <td className="px-4 py-3.5 align-middle">
                                        <div className="font-bold text-slate-800 text-sm truncate" title={landing.title}>
                                            {landing.title}
                                        </div>
                                    </td>

                                    {/* Slug */}
                                    <td className="px-4 py-3.5 align-middle">
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold font-sans">
                                            <Globe size={11} className="text-slate-400" />
                                            {landing.slug}
                                        </span>
                                    </td>

                                    {/* Type */}
                                    <td className="px-4 py-3.5 align-middle">
                                        <Badge variant={getPageTypeVariant(landing.page_type)} className="text-[11px] font-black px-2 py-0.5">
                                            {getPageTypeLabel(landing.page_type)}
                                        </Badge>
                                    </td>

                                    {/* Status Switch */}
                                    <td className="px-4 py-3.5 align-middle">
                                        <div className="flex flex-col items-center justify-center gap-1.5">
                                            <ToggleSwitch
                                                enabled={landing.status === 'published'}
                                                onChange={() => onStatusToggle(landing.id, landing.status)}
                                            />
                                            <span className="text-[10px] font-bold text-slate-400">
                                                {landing.status === 'published' ? t('status.published') : t('status.draft')}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Updated At */}
                                    <td className="px-4 py-3.5 align-middle text-xs font-medium text-slate-600 font-sans">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar size={12} className="text-slate-400" />
                                            <span>{formatDate(landing.updated_at)}</span>
                                        </div>
                                    </td>

                                    {/* Actions */}
                                    <td className="px-4 py-3.5 align-middle text-right pr-6">
                                        <div className="flex items-center justify-end gap-1.5">
                                            {/* Preview link */}
                                            <a
                                                href={`/landing/${landing.slug}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                title={t('actions.view', { ns: 'common' })}
                                                className="w-8 h-8 flex items-center justify-center bg-white border border-[#E2E8F0] rounded-lg text-slate-500 hover:text-emerald-500 hover:border-emerald-500 transition-all hover:scale-105 active:scale-95 shadow-xs"
                                            >
                                                <Eye size={13} />
                                            </a>
                                            {/* Edit */}
                                            <button
                                                onClick={() => onEdit(landing)}
                                                title={t('actions.edit', { ns: 'common' })}
                                                className="w-8 h-8 flex items-center justify-center bg-white border border-[#E2E8F0] rounded-lg text-slate-500 hover:text-amber-500 hover:border-amber-500 transition-all hover:scale-105 active:scale-95 shadow-xs"
                                            >
                                                <Edit2 size={13} />
                                            </button>
                                            {/* Delete */}
                                            <button
                                                onClick={() => onDelete(landing.id, landing.slug)}
                                                title={t('actions.remove', { ns: 'common' })}
                                                className="w-8 h-8 flex items-center justify-center bg-white border border-[#E2E8F0] rounded-lg text-slate-500 hover:text-red-500 hover:border-red-500 transition-all hover:scale-105 active:scale-95 shadow-xs"
                                            >
                                                <Trash2 size={13} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7} className="py-[80px] text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                                            <Globe size={28} />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-slate-800 font-bold text-sm">
                                                {t('labels.not_available', { ns: 'common', defaultValue: 'Không có dữ liệu' })}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {total > limit && (
                <div className="px-6 py-4 border-t border-[#E2E8F0] bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-[13px] font-bold text-slate-400 font-sans">
                        Hiển thị {total > 0 ? (page - 1) * limit + 1 : 0}–{Math.min(page * limit, total)} trong tổng {total} mục
                    </div>

                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={() => onPageChange(page - 1)}
                            disabled={page === 1}
                            className="w-8 h-8 flex items-center justify-center rounded-md bg-white border border-[#E2E8F0] text-slate-500 hover:border-[#14b8a6] hover:text-[#14b8a6] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs active:scale-90"
                        >
                            <ChevronLeft size={16} />
                        </button>

                        <div className="flex items-center gap-1.5">
                            {Array.from({ length: Math.ceil(total / limit) }, (_, i) => i + 1)
                                .reduce<number[]>((pages, p) => {
                                    const lastPage = Math.ceil(total / limit);
                                    if (p === 1 || p === lastPage || Math.abs(p - page) <= 1) {
                                        pages.push(p);
                                    }
                                    return pages;
                                }, [])
                                .map((p, i, arr) => (
                                    <div key={p} className="flex items-center gap-1.5">
                                        {i > 0 && arr[i - 1] !== p - 1 && <span className="text-slate-300 font-bold px-1">...</span>}
                                        <button
                                            onClick={() => onPageChange(p)}
                                            className={clsx(
                                                "w-8 h-8 flex items-center justify-center rounded-md text-xs font-black transition-all shadow-xs",
                                                p === page
                                                    ? "bg-[#14b8a6] text-white border-[#14b8a6]"
                                                    : "bg-white border border-[#E2E8F0] text-slate-500 hover:border-[#14b8a6] hover:text-[#14b8a6] active:scale-95"
                                            )}
                                        >
                                            {p}
                                        </button>
                                    </div>
                                ))}
                        </div>

                        <button
                            onClick={() => onPageChange(page + 1)}
                            disabled={page >= Math.ceil(total / limit)}
                            className="w-8 h-8 flex items-center justify-center rounded-md bg-white border border-[#E2E8F0] text-slate-500 hover:border-[#14b8a6] hover:text-[#14b8a6] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs active:scale-90"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LandingPageTable;
