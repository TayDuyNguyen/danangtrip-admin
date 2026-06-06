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
    Tag,
    Info,
    Calendar,
    CheckCircle,
    XCircle,
    Clock
} from 'lucide-react';
import { clsx } from 'clsx';
import type { Promotion, PromotionStatus } from '@/types/promotion.types';
import ToggleSwitch from '@/components/ui/ToggleSwitch';
import LoadingReact from '@/components/loading';
import CustomSelect, { type Option } from '@/components/ui/CustomSelect';
import Badge from '@/components/ui/Badge';

interface Props {
    data: Promotion[];
    isLoading: boolean;
    total: number;
    page: number;
    limit: number;
    onPageChange: (page: number) => void;
    onLimitChange: (limit: number) => void;
    onEdit: (promotion: Promotion) => void;
    onDelete: (id: number, code: string) => void;
    onStatusToggle: (id: number, currentStatus: PromotionStatus) => void;
    rowSelection: RowSelectionState;
    onRowSelectionChange: OnChangeFn<RowSelectionState>;
}

const columnHelper = createColumnHelper<Promotion>();

const PromotionTable = ({
    data,
    isLoading,
    total,
    page,
    limit,
    onPageChange,
    onLimitChange,
    onEdit,
    onDelete,
    onStatusToggle,
    rowSelection,
    onRowSelectionChange,
}: Props) => {
    const { t, i18n } = useTranslation('promotions');

    const columns = useMemo(() => [
        // Checkbox
        columnHelper.display({
            id: 'select',
            meta: { width: '50px' },
            header: ({ table }) => (
                <div className="flex justify-center">
                    <input
                        type="checkbox"
                        className="w-[16px] h-[16px] rounded border-[#E2E8F0] text-[#14b8a6] focus:ring-[#14b8a6]/20 accent-[#14b8a6] cursor-pointer"
                        checked={table.getIsAllPageRowsSelected()}
                        onChange={table.getToggleAllPageRowsSelectedHandler()}
                    />
                </div>
            ),
            cell: ({ row }) => (
                <div className="flex justify-center">
                    <input
                        type="checkbox"
                        className="w-[16px] h-[16px] rounded border-[#E2E8F0] text-[#14b8a6] focus:ring-[#14b8a6]/20 accent-[#14b8a6] cursor-pointer"
                        checked={row.getIsSelected()}
                        onChange={row.getToggleSelectedHandler()}
                    />
                </div>
            ),
        }),
        // # Index
        columnHelper.display({
            id: 'stt',
            meta: { width: '50px' },
            header: () => <div className="text-center w-full">#</div>,
            cell: info => (
                <div className="text-center text-[13px] font-medium text-slate-400 font-sans w-full">
                    {info.row.index + (page - 1) * limit + 1}
                </div>
            ),
        }),
        // Code & Campaign Name
        columnHelper.accessor('code', {
            id: 'code_campaign',
            meta: { width: '320px' },
            header: t('fields.code'),
            cell: info => {
                const promo = info.row.original;
                return (
                    <div className="flex items-start gap-3 py-1.5 min-w-[280px]">
                        <div className="flex flex-col gap-1 w-full">
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#dff7f4] text-[#0f766e] border border-[#ccfbf1] rounded-lg text-[13px] font-black tracking-wider uppercase shadow-xs">
                                    <Tag size={13} className="text-[#14b8a6]" />
                                    {promo.code}
                                </span>
                            </div>
                            <span className="text-[14px] font-bold text-slate-800 font-sans leading-snug mt-1 truncate max-w-[260px]" title={promo.name}>
                                {promo.name}
                            </span>
                            {promo.description && (
                                <span className="text-[11px] text-slate-400 font-medium line-clamp-1 max-w-[260px]" title={promo.description}>
                                    {promo.description}
                                </span>
                            )}
                        </div>
                    </div>
                );
            }
        }),
        // Discount Value
        columnHelper.accessor('discount_value', {
            id: 'discount',
            meta: { width: '220px' },
            header: t('fields.discount_value'),
            cell: info => {
                const promo = info.row.original;
                const isPercent = promo.discount_type === 'percent';
                const valueNum = Number(promo.discount_value);
                const minOrderNum = Number(promo.min_order_amount);
                
                return (
                    <div className="flex flex-col gap-1 font-sans">
                        <div className="flex items-baseline gap-1">
                            <span className="text-[15px] font-black text-[#0f766e]">
                                {isPercent 
                                    ? `-${valueNum}%` 
                                    : `-${valueNum.toLocaleString(i18n.language === 'vi' ? 'vi-VN' : 'en-US')} đ`}
                            </span>
                        </div>
                        {isPercent && promo.max_discount_amount && (
                            <span className="text-[11px] text-slate-500 font-medium">
                                Tối đa: {Number(promo.max_discount_amount).toLocaleString()} đ
                            </span>
                        )}
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                            {minOrderNum > 0 
                                ? `Đơn hàng ≥ ${minOrderNum.toLocaleString()} đ` 
                                : 'Không giới hạn đơn'}
                        </span>
                    </div>
                );
            }
        }),
        // Usage limits & progress
        columnHelper.accessor('used_count', {
            id: 'usage',
            meta: { width: '220px' },
            header: t('fields.used_count'),
            cell: info => {
                const promo = info.row.original;
                const used = promo.used_count;
                const limitVal = promo.usage_limit;
                const hasLimit = limitVal !== null && limitVal > 0;
                const progressPct = hasLimit ? Math.min((used / limitVal) * 100, 100) : 0;
                
                return (
                    <div className="flex flex-col gap-1.5 font-sans min-w-[160px]">
                        <div className="flex items-center justify-between text-[12px] font-bold text-slate-700">
                            <span>{used} / {hasLimit ? limitVal : '∞'} lượt</span>
                            {hasLimit && (
                                <span className={clsx(
                                    "text-[10px] font-black",
                                    progressPct >= 90 ? "text-red-500" : progressPct >= 75 ? "text-amber-500" : "text-emerald-500"
                                )}>
                                    {Math.round(progressPct)}%
                                </span>
                            )}
                        </div>
                        {hasLimit ? (
                            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                <div 
                                    className={clsx(
                                        "h-full rounded-full transition-all duration-300",
                                        progressPct >= 90 ? "bg-red-500" : progressPct >= 75 ? "bg-amber-500" : "bg-[#14b8a6]"
                                    )} 
                                    style={{ width: `${progressPct}%` }}
                                />
                            </div>
                        ) : (
                            <div className="text-[11px] text-slate-400 font-medium italic">Không giới hạn hệ thống</div>
                        )}
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                            Mỗi user: tối đa {promo.usage_per_user} lần
                        </span>
                    </div>
                );
            }
        }),
        // Validity Dates
        columnHelper.accessor('starts_at', {
            id: 'validity',
            meta: { width: '220px' },
            header: t('fields.starts_at'),
            cell: info => {
                const promo = info.row.original;
                const formatDate = (dateStr: string | null) => {
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
                
                const isExpired = promo.status === 'expired' || (promo.ends_at && new Date(promo.ends_at) < new Date());

                return (
                    <div className="flex flex-col gap-1 text-[12px] font-medium text-slate-600 font-sans">
                        <div className="flex items-center gap-1.5">
                            <Clock size={12} className="text-slate-400 shrink-0" />
                            <span>Bắt đầu: {formatDate(promo.starts_at)}</span>
                        </div>
                        <div className={clsx(
                            "flex items-center gap-1.5",
                            isExpired ? "text-red-500 font-bold" : ""
                        )}>
                            <Calendar size={12} className="shrink-0" />
                            <span>Hết hạn: {formatDate(promo.ends_at)}</span>
                        </div>
                    </div>
                );
            }
        }),
        // Status Badge
        columnHelper.accessor('status', {
            id: 'status',
            meta: { width: '130px' },
            header: t('fields.status'),
            cell: info => {
                const status = info.getValue();
                
                const badgeConfig = {
                    active: { variant: 'success' as const, label: t('status.active'), icon: CheckCircle },
                    inactive: { variant: 'neutral' as const, label: t('status.inactive'), icon: XCircle },
                    expired: { variant: 'error' as const, label: t('status.expired'), icon: Clock },
                };
                
                const config = badgeConfig[status] || { variant: 'neutral' as const, label: status, icon: Info };
                
                return (
                    <Badge variant={config.variant} className="gap-1 px-2.5 py-1">
                        <config.icon size={12} className="shrink-0" />
                        {config.label}
                    </Badge>
                );
            }
        }),
        // Toggle Active
        columnHelper.accessor('status', {
            id: 'toggle_status',
            meta: { width: '90px' },
            header: () => <div className="text-center w-full">Kích hoạt</div>,
            cell: info => {
                const promo = info.row.original;
                const isExpired = promo.status === 'expired';
                
                return (
                    <div className="flex justify-center w-full">
                        <ToggleSwitch
                            enabled={promo.status === 'active'}
                            disabled={isExpired}
                            onChange={() => onStatusToggle(promo.id, promo.status)}
                        />
                    </div>
                );
            }
        }),
        // Actions
        columnHelper.display({
            id: 'actions',
            meta: { width: '100px' },
            header: () => <div className="text-right w-full pr-4">Thao tác</div>,
            cell: info => {
                const promo = info.row.original;
                return (
                    <div className="flex items-center justify-end gap-1.5 pr-2">
                        <button 
                            onClick={() => onEdit(promo)}
                            title={t('actions.edit')}
                            className="w-[32px] h-[32px] flex items-center justify-center bg-white border border-[#E2E8F0] rounded-lg text-slate-500 hover:text-amber-500 hover:border-amber-500 transition-all hover:scale-105 active:scale-95 shadow-xs shrink-0"
                        >
                            <Edit2 size={13} />
                        </button>
                        <button 
                            onClick={() => onDelete(promo.id, promo.code)}
                            title={t('actions.remove', { ns: 'common' })}
                            className="w-[32px] h-[32px] flex items-center justify-center bg-white border border-[#E2E8F0] rounded-lg text-slate-500 hover:text-red-500 hover:border-red-500 transition-all hover:scale-105 active:scale-95 shadow-xs shrink-0"
                        >
                            <Trash2 size={13} />
                        </button>
                    </div>
                );
            }
        })
    ], [t, i18n.language, page, limit, onEdit, onDelete, onStatusToggle]);

    // eslint-disable-next-line react-hooks/incompatible-library
    const table = useReactTable({
        data,
        columns,
        state: { rowSelection },
        onRowSelectionChange,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div className="bg-white border border-[#E2E8F0] rounded-[16px] shadow-sm overflow-hidden flex flex-col group/card min-w-0">
            {/* Table Header Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-center px-[24px] py-[16px] border-b border-[#E2E8F0] gap-4">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <h2 className="text-[14px] font-black text-slate-900 uppercase tracking-wider">
                        Danh sách khuyến mãi ({total})
                    </h2>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                    <span className="text-[13px] text-slate-400 font-medium font-sans">
                        Hiển thị {total > 0 ? (page - 1) * limit + 1 : 0}–{Math.min(page * limit, total)} trong tổng {total} mục
                    </span>
                    <CustomSelect
                        options={[10, 20, 50].map(v => ({ value: v, label: t('pagination.items_per_page', { count: v, defaultValue: `${v} dòng/trang` }) }))}
                        value={{ value: limit, label: t('pagination.items_per_page', { count: limit, defaultValue: `${limit} dòng/trang` }) }}
                        onChange={(opt) => onLimitChange(Number((opt as Option)?.value))}
                        className="text-[12px] w-[140px]"
                    />
                </div>
            </div>

            {/* Scrollable Container */}
            <div className="overflow-x-auto custom-scrollbar-horizontal">
                <table className="w-full text-left border-collapse table-fixed min-w-[1300px]">
                    <thead className="bg-slate-50 border-b border-[#E2E8F0]">
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => {
                                    const meta = header.column.columnDef.meta as { width?: string } | undefined;
                                    return (
                                        <th
                                            key={header.id}
                                            className="px-[16px] py-[12px] text-[11px] font-black text-slate-500 uppercase tracking-wider text-left sticky top-0 z-10"
                                            style={{ width: meta?.width || 'auto' }}
                                        >
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                        </th>
                                    );
                                })}
                            </tr>
                        ))}
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0]">
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
                                        "group transition-all duration-150 border-b border-[#E2E8F0] last:border-0",
                                        row.getIsSelected() ? "bg-[#dff7f4]/40" : "hover:bg-slate-50/50"
                                    )}
                                >
                                    {row.getVisibleCells().map(cell => (
                                        <td key={cell.id} className="px-4 py-3.5 align-middle">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length} className="py-[80px] text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                                            <Tag size={28} />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[#1E293B] font-bold text-[15px]">{t('labels.no_data')}</p>
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
                <div className="px-[24px] py-[16px] border-t border-[#E2E8F0] bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-[13px] font-bold text-slate-400 font-sans">
                        Hiển thị {total > 0 ? (page - 1) * limit + 1 : 0}–{Math.min(page * limit, total)} trong tổng {total} mục
                    </div>

                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={() => onPageChange(page - 1)}
                            disabled={page === 1}
                            className="w-[32px] h-[32px] flex items-center justify-center rounded-md bg-white border border-[#E2E8F0] text-slate-500 hover:border-[#14b8a6] hover:text-[#14b8a6] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 shadow-sm active:scale-90"
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
                                                "w-[32px] h-[32px] flex items-center justify-center rounded-md text-[13px] font-black transition-all duration-150 shadow-sm",
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
                            className="w-[32px] h-[32px] flex items-center justify-center rounded-md bg-white border border-[#E2E8F0] text-slate-500 hover:border-[#14b8a6] hover:text-[#14b8a6] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 shadow-sm active:scale-90"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PromotionTable;
