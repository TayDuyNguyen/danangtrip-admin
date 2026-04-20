import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    createColumnHelper,
} from '@tanstack/react-table';
import type { RowSelectionState, OnChangeFn } from '@tanstack/react-table';
import {
    Edit2,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Eye,
    RefreshCw,
} from 'lucide-react';
import { clsx } from 'clsx';

import type { TourItem, TourCategory } from '@/dataHelper/tour.dataHelper';
import StatusBadge from './StatusBadge';
import ToggleSwitch from './ToggleSwitch';
import LoadingReact from '@/components/loading';
import CustomSelect, { type Option } from '@/components/ui/CustomSelect';

interface Props {
    data: TourItem[];
    categories: TourCategory[];
    isLoading: boolean;
    total: number;
    page: number;
    limit: number;
    onPageChange: (page: number) => void;
    onLimitChange: (limit: number) => void;
    onEdit: (id: number) => void;
    onDelete: (id: number, name: string) => void;
    onToggleFeatured: (id: number, value: boolean) => void;
    onToggleHot: (id: number, value: boolean) => void;
    onStatusChange: (id: number, status: 'active' | 'inactive' | 'sold_out') => void;
    onBulkDelete: (ids: number[]) => void;
    onBulkStatusChange: (ids: number[], status: 'active' | 'inactive' | 'sold_out') => void;
    rowSelection: RowSelectionState;
    onRowSelectionChange: OnChangeFn<RowSelectionState>;
    onRefresh?: () => void;
    isRefreshing?: boolean;
}

const columnHelper = createColumnHelper<TourItem>();

const TourTable = ({
    data,
    categories,
    isLoading,
    total,
    page,
    limit,
    onPageChange,
    onLimitChange,
    onEdit,
    onDelete,
    onToggleFeatured,
    onToggleHot,
    onBulkDelete,
    onBulkStatusChange,
    rowSelection,
    onRowSelectionChange,
    onRefresh,
    isRefreshing,
}: Props) => {
    const { t, i18n } = useTranslation('tour');

    const columns = useMemo(() => [
        // □ Checkbox
        columnHelper.display({
            id: 'select',
            meta: { width: '50px' },
            header: ({ table }) => (
                <div className="flex justify-center">
                    <input
                        type="checkbox"
                        className="w-[16px] h-[16px] rounded border-[#E2E8F0] text-[#0066CC] focus:ring-[#0066CC]/20 accent-[#0066CC] cursor-pointer"
                        checked={table.getIsAllPageRowsSelected()}
                        onChange={table.getToggleAllPageRowsSelectedHandler()}
                    />
                </div>
            ),
            cell: ({ row }) => (
                <div className="flex justify-center">
                    <input
                        type="checkbox"
                        className="w-[16px] h-[16px] rounded border-[#E2E8F0] text-[#0066CC] focus:ring-[#0066CC]/20 accent-[#0066CC] cursor-pointer"
                        checked={row.getIsSelected()}
                        onChange={row.getToggleSelectedHandler()}
                    />
                </div>
            ),
        }),
        // # STT
        columnHelper.display({
            id: 'stt',
            meta: { width: '50px' },
            header: () => <div className="text-center w-full">#</div>,
            cell: info => <div className="text-center text-[13px] font-medium text-[#94A3B8] font-inter w-full">{info.row.index + (page - 1) * limit + 1}</div>,
        }),
        // Tour - flexible
        columnHelper.accessor('name', {
            id: 'name',
            meta: { width: 'auto' },
            header: t('table.header_tour'),
            cell: info => {
                const tour = info.row.original;
                return (
                    <div className="flex items-center gap-[12px] min-w-[250px] py-1">
                        <div className="w-[48px] h-[48px] rounded-[10px] overflow-hidden border border-[#E2E8F0] shrink-0 shadow-sm relative group/thumb">
                            <img src={tour.thumbnail || '/images/placeholder-tour.jpg'} alt={tour.name} className="w-full h-full object-cover transition-transform group-hover/thumb:scale-110 duration-500" />
                        </div>
                        <div className="flex flex-col gap-1.5 min-w-0 py-1">
                            <span className="text-[14px] font-bold text-[#1E293B] whitespace-normal wrap-break-word group-hover:text-[#0066CC] transition-colors leading-snug font-inter">
                                {tour.name}
                            </span>
                            <div className="flex flex-wrap items-center gap-1.5">
                                {tour.is_featured && (
                                    <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded text-[10px] font-black uppercase tracking-wider shrink-0">
                                        {t('filters.featured')}
                                    </span>
                                )}
                                {tour.is_hot && (
                                    <span className="px-1.5 py-0.5 bg-orange-50 text-orange-600 border border-orange-100 rounded text-[10px] font-black uppercase tracking-wider shrink-0">
                                        {t('filters.hot')}
                                    </span>
                                )}
                                {!tour.is_featured && !tour.is_hot && (
                                    <span className="px-1.5 py-0.5 bg-slate-50 text-slate-500 border border-slate-100 rounded text-[10px] font-black uppercase tracking-wider shrink-0">
                                        {t('filters.normal')}
                                    </span>
                                )}
                            </div>
                            <span className="text-[10px] font-medium text-[#94A3B8] font-inter uppercase tracking-tight truncate">{tour.slug || `${t('table.tour_code_prefix')}${tour.id.toString().padStart(3, '0')}`}</span>
                        </div>
                    </div>
                );
            },
        }),
        // Danh mục
        columnHelper.accessor('tour_category_id', {
            id: 'category',
            meta: { width: '160px' },
            header: t('table.header_category'),
            cell: info => {
                const categoryName = categories.find(c => c.id === info.getValue())?.name || info.getValue();
                return (
                    <span className="px-[8px] py-[2.5px] bg-[#EFF6FF] text-[#0066CC] border border-[#B3D9FF] rounded-full text-[11px] font-bold inline-block max-w-full">
                        {categoryName}
                    </span>
                );
            }
        }),
        // Giá
        columnHelper.accessor('price_adult', {
            meta: { width: '150px' },
            header: t('table.header_price'),
            cell: info => (
                <div className="flex items-baseline gap-1">
                    <span className="text-[13px] font-bold text-[#1E293B] font-inter whitespace-nowrap">
                        {Number(info.getValue()).toLocaleString(i18n.language === 'vi' ? 'vi-VN' : 'en-US')} {t('currency', { ns: 'common' })}
                    </span>
                    <span className="text-[11px] font-medium text-[#94A3B8]">{t('table.per_person')}</span>
                </div>
            )
        }),
        // Lịch
        columnHelper.accessor('scheduleCount', {
            meta: { width: '130px' },
            header: t('table.header_schedule'),
            cell: info => {
                const count = info.getValue() || 0;
                return (
                    <div>
                        {count > 0 ? (
                            <span className="text-[13px] font-bold text-[#10B981] font-inter whitespace-nowrap">{t('table.schedules_count', { count })}</span>
                        ) : (
                            <span className="text-[13px] font-bold text-[#EF4444] font-inter whitespace-nowrap">{t('table.no_schedule')}</span>
                        )}
                    </div>
                );
            }
        }),

        // Lượt bán
        columnHelper.accessor('booking_count', {
            meta: { width: '100px' },
            header: t('table.header_sales'),
            cell: info => <div className="text-[13px] font-bold text-[#1E293B] font-inter whitespace-nowrap">{info.getValue().toLocaleString()}</div>,
        }),
        // Trạng thái
        columnHelper.accessor('status', {
            meta: { width: '130px' },
            header: t('table.header_status'),
            cell: info => (
                <StatusBadge status={info.getValue()} />
            ),
        }),
        // Nổi bật
        columnHelper.accessor('is_featured', {
            meta: { width: '85px' },
            header: t('table.header_featured'),
            cell: info => (
                <div title={t('table.header_featured')} className="flex justify-center w-full">
                    <ToggleSwitch 
                        checked={info.getValue()} 
                        onChange={(val) => onToggleFeatured(info.row.original.id, val)}
                        color="blue"
                    />
                </div>
            ),
        }),
        // Hot
        columnHelper.accessor('is_hot', {
            meta: { width: '80px' },
            header: t('table.header_hot'),
            cell: info => (
                <div title={t('table.header_hot')} className="flex justify-center w-full">
                    <ToggleSwitch 
                        checked={info.getValue()} 
                        onChange={(val) => onToggleHot(info.row.original.id, val)}
                        color="orange"
                    />
                </div>
            ),
        }),
        // Thao tác
        columnHelper.display({
            id: 'actions',
            meta: { width: '120px' },
            header: () => <div className="text-right w-full pr-4">{t('table.header_actions')}</div>,
            cell: info => (
                <div className="flex items-center justify-end gap-1.5 pr-2">
                    <button 
                        title={t('actions.view', { ns: 'common' })}
                        className="w-[30px] h-[30px] flex items-center justify-center bg-[#F8FAFC] border border-[#E2E8F0] rounded-[6px] text-[#64748B] hover:text-[#0066CC] hover:border-[#0066CC] transition-all group/btn"
                    >
                        <Eye size={14} />
                    </button>
                    <button 
                        onClick={() => onEdit(info.row.original.id)}
                        title={t('actions.edit', { ns: 'common' })}
                        className="w-[30px] h-[30px] flex items-center justify-center bg-[#F8FAFC] border border-[#E2E8F0] rounded-[6px] text-[#64748B] hover:text-[#F59E0B] hover:border-[#F59E0B] transition-all group/btn"
                    >
                        <Edit2 size={14} />
                    </button>
                    <button 
                        onClick={() => onDelete(info.row.original.id, info.row.original.name)}
                        title={t('actions.remove', { ns: 'common' })}
                        className="w-[30px] h-[30px] flex items-center justify-center bg-[#F8FAFC] border border-[#E2E8F0] rounded-[6px] text-[#64748B] hover:text-[#EF4444] hover:border-[#EF4444] transition-all group/btn"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            ),
        }),
    ], [t, i18n.language, page, limit, categories, onEdit, onDelete, onToggleFeatured, onToggleHot]);

    // eslint-disable-next-line react-hooks/incompatible-library
    const table = useReactTable({
        data,
        columns,
        state: { rowSelection },
        onRowSelectionChange,
        getCoreRowModel: getCoreRowModel(),
    });

    const selectedIds = Object.keys(rowSelection).map(idx => data[Number(idx)]?.id).filter(Boolean) as number[];

    return (
        <div className="bg-white border border-[#E2E8F0] rounded-[16px] shadow-sm overflow-hidden flex flex-col group/card min-w-0">
            {/* Table Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-center px-[24px] py-[16px] border-b border-[#E2E8F0] gap-4">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    {selectedIds.length > 0 ? (
                        <div className="flex items-center gap-4 animate-in fade-in slide-in-from-left-2 duration-300">
                            <span className="text-[13px] font-bold text-[#0066CC] whitespace-nowrap">
                                {t('table.bulk_selected', { count: selectedIds.length })}
                            </span>
                            <div className="h-4 w-px bg-[#E2E8F0]" />
                            <div className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar">
                                <button
                                    onClick={() => onBulkStatusChange(selectedIds, 'active')}
                                    className="px-3 py-1.5 bg-[#D1FAE5] text-[#10B981] rounded-[8px] text-[12px] font-bold hover:brightness-95 transition-all shadow-sm whitespace-nowrap"
                                >
                                    {t('table.bulk_activate')}
                                </button>
                                <button
                                    onClick={() => onBulkStatusChange(selectedIds, 'inactive')}
                                    className="px-3 py-1.5 bg-[#FEE2E2] text-[#EF4444] rounded-[8px] text-[12px] font-bold hover:brightness-95 transition-all shadow-sm whitespace-nowrap"
                                >
                                    {t('table.bulk_deactivate')}
                                </button>
                                <button
                                    onClick={() => onBulkStatusChange(selectedIds, 'sold_out')}
                                    className="px-3 py-1.5 bg-[#FEF3C7] text-[#F59E0B] rounded-[8px] text-[12px] font-bold hover:brightness-95 transition-all shadow-sm whitespace-nowrap"
                                >
                                    {t('status.sold_out')}
                                </button>
                                <button
                                    onClick={() => onBulkDelete(selectedIds)}
                                    className="px-3 py-1.5 bg-[#FEE2E2] text-[#EF4444] rounded-[8px] text-[12px] font-bold hover:brightness-95 transition-all shadow-sm whitespace-nowrap"
                                >
                                    {t('table.bulk_delete')}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <h2 className="text-[14px] font-bold text-[#1E293B] uppercase tracking-wider">{t('table.title')}</h2>
                            {onRefresh && (
                                <button
                                    onClick={onRefresh}
                                    disabled={isRefreshing || isLoading}
                                    className={clsx(
                                        "p-1.5 rounded-lg transition-all",
                                        isRefreshing ? "text-[#0066CC]" : "text-[#94A3B8] hover:text-[#0066CC] active:scale-95"
                                    )}
                                >
                                    <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
                                </button>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                    <span className="text-[13px] text-[#94A3B8] font-inter">
                        {t('table.showing_summary', { 
                            start: total > 0 ? (page - 1) * limit + 1 : 0,
                            end: Math.min(page * limit, total),
                            total: total
                        })}
                    </span>
                    <CustomSelect
                        options={[10, 20, 50].map(v => ({ value: v, label: t('table.items_per_page', { count: v }) }))}
                        value={{ value: limit, label: t('table.items_per_page', { count: limit }) }}
                        onChange={(opt) => onLimitChange(Number((opt as Option)?.value))}
                        className="text-[12px] w-[120px]"
                    />
                </div>
            </div>

            <div className="overflow-x-auto custom-scrollbar-horizontal">
                <table className="w-full text-left border-collapse table-fixed min-w-[1300px]">
                    <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => {
                                    const meta = header.column.columnDef.meta as { width?: string } | undefined;
                                    return (
                                        <th
                                            key={header.id}
                                            className="px-[16px] py-[12px] text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider text-left bg-[#F8FAFC] sticky top-0 z-10"
                                            style={{ width: meta?.width || 'auto' }}
                                        >
                                            <div className="flex items-center gap-1.5 overflow-hidden">
                                                {flexRender(header.column.columnDef.header, header.getContext())}
                                            </div>
                                        </th>
                                    );
                                })}
                            </tr>
                        ))}
                    </thead>
                    <tbody className="divide-y divide-[#F1F5F9]">
                        {isLoading ? (
                            <tr>
                                <td colSpan={columns.length} className="py-[100px] text-center">
                                    <LoadingReact />
                                </td>
                            </tr>
                        ) : data.length > 0 ? (
                            table.getRowModel().rows.map(row => (
                                <tr
                                    key={row.id}
                                    className={clsx(
                                        "group transition-all duration-150 border-b border-[#F1F5F9] last:border-0",
                                        row.getIsSelected() ? "bg-[#EFF6FF] border-l-3 border-l-[#0066CC]" : "hover:bg-[#F8FAFC]"
                                    )}
                                >
                                    {row.getVisibleCells().map(cell => (
                                        <td key={cell.id} className="px-4 py-3 align-middle">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length} className="py-[80px] text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
                                            <RefreshCw size={32} className="text-[#E2E8F0]" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[#1E293B] font-bold text-[16px]">{t('messages.no_data')}</p>
                                            <p className="text-[#94A3B8] text-[14px]">{t('messages.no_data_subtitle')}</p>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="px-[24px] py-[16px] border-t border-[#E2E8F0] bg-[#F8FAFC] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-[13px] font-medium text-[#64748B] font-inter">
                    {t('table.showing_summary', { 
                        start: total > 0 ? (page - 1) * limit + 1 : 0,
                        end: Math.min(page * limit, total),
                        total: total
                    })}
                </div>

                <div className="flex items-center gap-1.5">
                    <button
                        onClick={() => onPageChange(page - 1)}
                        disabled={page === 1}
                        className="w-[32px] h-[32px] flex items-center justify-center rounded-[8px] bg-white border border-[#E2E8F0] text-[#64748B] hover:border-[#0066CC] hover:text-[#0066CC] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm active:scale-90"
                    >
                        <ChevronLeft size={16} />
                    </button>

                    <div className="flex items-center gap-1.5">
                        {Array.from({ length: Math.ceil(total / limit) }, (_, i) => i + 1)
                            .filter(p => p === 1 || p === Math.ceil(total / limit) || Math.abs(p - page) <= 1)
                            .map((p, i, arr) => (
                                <div key={p} className="flex items-center gap-1.5">
                                    {i > 0 && arr[i - 1] !== p - 1 && <span className="text-slate-300 font-bold px-1">...</span>}
                                    <button
                                        onClick={() => onPageChange(p)}
                                        className={clsx(
                                            "w-[32px] h-[32px] flex items-center justify-center rounded-[8px] text-[13px] font-bold transition-all shadow-sm",
                                            p === page
                                                ? "bg-[#0066CC] text-white border-[#0066CC]"
                                                : "bg-white border border-[#E2E8F0] text-[#64748B] hover:border-[#0066CC] hover:text-[#0066CC] active:scale-95"
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
                        className="w-[32px] h-[32px] flex items-center justify-center rounded-[8px] bg-white border border-[#E2E8F0] text-[#64748B] hover:border-[#0066CC] hover:text-[#0066CC] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm active:scale-90"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TourTable;
