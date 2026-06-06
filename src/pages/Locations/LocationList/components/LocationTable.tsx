import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { clsx } from 'clsx';
import { 
    Eye, 
    Edit2, 
    Trash2, 
    MapPin,
    Star as StarIcon, 
    Heart,
    ChevronLeft,
    ChevronRight,
    RefreshCw
} from 'lucide-react';
import type { LocationViewModel } from '@/dataHelper/location.dataHelper';
import ToggleSwitch from '@/components/ui/ToggleSwitch';
import Badge from '@/components/ui/Badge';
import LoadingReact from '@/components/loading';
import CustomSelect from '@/components/ui/CustomSelect';
import type { Option } from '@/components/ui/CustomSelect';

interface LocationTableProps {
    items: LocationViewModel[];
    isLoading: boolean;
    isRefreshing?: boolean;
    selectedIds: number[];
    // pagination
    page: number;
    limit: number;
    total: number;
    onPageChange: (page: number) => void;
    onLimitChange: (limit: number) => void;
    onRefresh?: () => void;
    // row actions
    onSelectRow: (id: number) => void;
    onSelectAll: () => void;
    onToggleFeatured: (id: number, enabled: boolean) => void;
    onView: (id: number) => void;
    onEdit: (id: number) => void;
    onDelete: (id: number) => void;
    onBulkAction?: (action: 'active' | 'inactive' | 'delete') => void;
    isBulkMutating?: boolean;
}

const LocationTable = ({
    items,
    isLoading,
    isRefreshing,
    selectedIds,
    page,
    limit,
    total,
    onPageChange,
    onLimitChange,
    onRefresh,
    onSelectRow,
    onSelectAll,
    onToggleFeatured,
    onView,
    onEdit,
    onDelete,
    onBulkAction,
    isBulkMutating,
}: LocationTableProps) => {
    const { t } = useTranslation(['location', 'tour', 'common']);
    const lastPage = Math.max(1, Math.ceil(total / limit));

    const isAllSelected = items.length > 0 && selectedIds.length === items.length;

    return (
        <div className="bg-white border border-[#E2E8F0] rounded-[16px] shadow-sm overflow-hidden flex flex-col group/card min-w-0">
            {/* Table Toolbar (align with tours/list) */}
            <div className="flex flex-col sm:flex-row justify-between items-center px-[24px] py-[16px] border-b border-[#E2E8F0] gap-4">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    {selectedIds.length > 0 ? (
                        <div className="flex items-center gap-4 animate-in fade-in slide-in-from-left-2 duration-150">
                            <span className="text-[13px] font-bold text-[#14b8a6] whitespace-nowrap">
                                {t('location:actions.selected', { count: selectedIds.length, defaultValue: `Đã chọn ${selectedIds.length}` })}
                            </span>
                            <div className="h-4 w-px bg-[#E2E8F0]" />
                            <div className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar">
                                <button
                                    onClick={() => onBulkAction?.('active')}
                                    disabled={isBulkMutating}
                                    className="px-3 py-1.5 bg-[#D1FAE5] text-[#10B981] rounded-md text-[12px] font-bold hover:brightness-95 transition-all duration-150 shadow-sm whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    {t('location:actions.activate', 'Kích hoạt')}
                                </button>
                                <button
                                    onClick={() => onBulkAction?.('inactive')}
                                    disabled={isBulkMutating}
                                    className="px-3 py-1.5 bg-slate-100 border border-slate-200 text-slate-700 rounded-md text-[12px] font-bold hover:brightness-95 transition-all duration-150 shadow-sm whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    {t('location:actions.deactivate', 'Tạm ẩn')}
                                </button>
                                <button
                                    onClick={() => onBulkAction?.('delete')}
                                    disabled={isBulkMutating}
                                    className="px-3 py-1.5 bg-[#FEE2E2] text-[#EF4444] rounded-md text-[12px] font-bold hover:brightness-95 transition-all duration-150 shadow-sm whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    {t('location:actions.delete', 'Xóa')}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <h2 className="text-[14px] font-bold text-[#1E293B] uppercase tracking-wider">
                                {t('location:table.title', 'Danh sách địa điểm')}
                            </h2>
                            {onRefresh && (
                                <button
                                    type="button"
                                    onClick={onRefresh}
                                    disabled={isRefreshing || isLoading}
                                    className={clsx(
                                        'p-1.5 rounded-md transition-all duration-150',
                                        isRefreshing ? 'text-[#14b8a6]' : 'text-text-secondary hover:text-[#14b8a6] active:scale-95',
                                    )}
                                    aria-label={t('common:actions.refresh', 'Làm mới')}
                                    title={t('common:actions.refresh', 'Làm mới')}
                                >
                                    <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
                                </button>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end min-w-0">
                    <span className="text-[13px] text-text-secondary font-sans flex-1 min-w-0 whitespace-nowrap truncate">
                        {t('common:pagination.showing_summary', {
                            start: total > 0 ? (page - 1) * limit + 1 : 0,
                            end: Math.min(page * limit, total),
                            total,
                        })}
                    </span>
                    <CustomSelect
                        options={[10, 20, 50].map((n) => ({
                            value: n,
                            label: t('table.items_per_page', { count: n, ns: 'tour', defaultValue: `${n} dòng` }),
                        }))}
                        value={{
                            value: limit,
                            label: t('table.items_per_page', { count: limit, ns: 'tour', defaultValue: `${limit} dòng` }),
                        }}
                        onChange={(opt) => onLimitChange(Number((opt as Option | null)?.value))}
                        containerClassName="w-[120px] shrink-0"
                        className="text-[12px]"
                        menuPortalTarget={document.body}
                        size="sm"
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-surface border-b border-[#E2E8F0]">
                        <tr className="text-[11px] uppercase font-bold text-text-secondary tracking-wider">
                            <th className="w-12 px-6 py-4">
                                <input 
                                    type="checkbox" 
                                    className="w-[16px] h-[16px] rounded border-[#E2E8F0] text-[#14b8a6] focus:ring-[#14b8a6]/20 accent-[#14b8a6] cursor-pointer"
                                    checked={isAllSelected}
                                    onChange={onSelectAll}
                                    aria-label={t('common:table.select_all', 'Chọn tất cả')}
                                />
                            </th>
                            <th className="px-6 py-4">{t('table.headers.name')}</th>
                            <th className="px-6 py-4 w-32">{t('table.headers.district')}</th>
                            <th className="px-6 py-4 w-28">{t('table.headers.price')}</th>
                            <th className="px-6 py-4 w-32">{t('table.headers.rating')}</th>
                            <th className="px-6 py-4 w-36">{t('table.headers.status')}</th>
                            <th className="px-6 py-4 w-24 text-center">{t('table.headers.featured')}</th>
                            <th className="px-6 py-4 w-32 text-right">{t('table.headers.actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {isLoading && items.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="py-[100px] text-center">
                                    <LoadingReact />
                                </td>
                            </tr>
                        ) : items.length > 0 ? (
                            items.map((item) => (
                                <tr
                                    key={item.id}
                                    className={clsx(
                                        'group transition-all duration-150 border-b border-border last:border-0',
                                        selectedIds.includes(item.id)
                                            ? 'bg-[#dff7f4] border-l-3 border-l-[#14b8a6]'
                                            : 'hover:bg-surface',
                                        (isRefreshing || isLoading) && 'opacity-60',
                                    )}
                                >
                                    <td className="px-6 py-4">
                                        <input 
                                            type="checkbox" 
                                            className="w-[16px] h-[16px] rounded border-[#E2E8F0] text-[#14b8a6] focus:ring-[#14b8a6]/20 accent-[#14b8a6] cursor-pointer"
                                            checked={selectedIds.includes(item.id)}
                                            onChange={() => onSelectRow(item.id)}
                                            aria-label={t('common:table.select_row', { name: item.name, defaultValue: `Chọn ${item.name}` })}
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden border border-slate-100 shrink-0">
                                                {item.thumbnail ? (
                                                    <img src={item.thumbnail} alt={item.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                        <MapPin size={20} />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="text-[14px] font-black text-slate-900 truncate group-hover:text-[#14b8a6] transition-colors cursor-pointer" onClick={() => onView(item.id)}>
                                                    {item.name}
                                                </h4>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                                                        {item.category}
                                                    </span>
                                                    <div className="flex items-center gap-2 text-[11px] text-slate-400 font-bold">
                                                        <span className="flex items-center gap-0.5"><Eye size={12} /> {item.viewCountStr}</span>
                                                        <span className="flex items-center gap-0.5"><Heart size={12} /> {item.favoriteCountStr}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge variant="neutral" className="font-bold">{item.district}</Badge>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-[13px] font-black text-slate-700">
                                            {t(`priceLevels.${item.priceLevelKey}`)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1">
                                            <StarIcon size={14} className="text-[#14b8a6] fill-[#14b8a6]/25" />
                                            <span className="text-[13px] font-black text-slate-900">{item.rating}</span>
                                            <span className="text-[11px] font-bold text-slate-400">({item.reviewCount})</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge variant={item.status === 'active' ? 'success' : 'error'} className="font-black uppercase tracking-tighter text-[10px]">
                                            {t(`status.${item.status}`)}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <ToggleSwitch 
                                            enabled={item.isFeatured} 
                                            onChange={(val) => onToggleFeatured(item.id, val)}
                                            size="sm"
                                        />
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1.5">
                                            <button 
                                                onClick={() => onView(item.id)}
                                                title={t('actions.view', { ns: 'common' })}
                                                className="w-[30px] h-[30px] flex items-center justify-center bg-surface border border-[#E2E8F0] rounded-[6px] text-[#64748B] hover:text-[#14b8a6] hover:border-[#14b8a6] transition-all group/btn cursor-pointer"
                                            >
                                                <Eye size={14} />
                                            </button>
                                            <button 
                                                onClick={() => onEdit(item.id)}
                                                title={t('actions.edit', { ns: 'common' })}
                                                className="w-[30px] h-[30px] flex items-center justify-center bg-surface border border-[#E2E8F0] rounded-[6px] text-[#64748B] hover:text-[#F59E0B] hover:border-[#F59E0B] transition-all group/btn cursor-pointer"
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                            <button 
                                                onClick={() => onDelete(item.id)}
                                                title={t('actions.remove', { ns: 'common' })}
                                                className="w-[30px] h-[30px] flex items-center justify-center bg-surface border border-[#E2E8F0] rounded-[6px] text-[#64748B] hover:text-[#EF4444] hover:border-[#EF4444] transition-all group/btn cursor-pointer"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={8} className="py-[80px] text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
                                            <RefreshCw size={32} className="text-[#E2E8F0]" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[#1E293B] font-bold text-[16px]">{t('common:labels.not_available', 'Không có dữ liệu')}</p>
                                            <p className="text-text-secondary text-[14px]">{t('location:no_data.subtitle', 'Không tìm thấy địa điểm nào')}</p>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Footer */}
            <div className="px-[24px] py-[16px] border-t border-[#E2E8F0] bg-surface flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-[13px] font-medium text-[#64748B] font-sans">
                    {t('common:pagination.showing_summary', {
                        start: total > 0 ? (page - 1) * limit + 1 : 0,
                        end: Math.min(page * limit, total),
                        total,
                    })}
                </div>
                <div className="flex items-center gap-1.5">
                    <button
                        type="button"
                        onClick={() => onPageChange(page - 1)}
                        disabled={page === 1}
                        className="w-[32px] h-[32px] flex items-center justify-center rounded-md bg-white border border-[#E2E8F0] text-[#64748B] hover:border-[#14b8a6] hover:text-[#14b8a6] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 shadow-sm active:scale-90"
                    >
                        <ChevronLeft size={16} />
                    </button>

                    <div className="flex items-center gap-1.5">
                        {Array.from({ length: lastPage }, (_, i) => i + 1)
                            .filter(p => p === 1 || p === lastPage || Math.abs(p - page) <= 1)
                            .map((p, i, arr) => (
                                <div key={p} className="flex items-center gap-1.5">
                                    {i > 0 && arr[i - 1] !== p - 1 && (
                                        <span className="text-slate-300 font-bold px-1">...</span>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => onPageChange(Number(p))}
                                        className={clsx(
                                            'w-[32px] h-[32px] flex items-center justify-center rounded-md text-[13px] font-bold transition-all duration-150 shadow-sm',
                                            p === page
                                                ? 'bg-[#14b8a6] text-white border-[#14b8a6]'
                                                : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:border-[#14b8a6] hover:text-[#14b8a6] active:scale-95',
                                        )}
                                    >
                                        {p}
                                    </button>
                                </div>
                            ))}
                    </div>

                    <button
                        type="button"
                        onClick={() => onPageChange(page + 1)}
                        disabled={page >= lastPage}
                        className="w-[32px] h-[32px] flex items-center justify-center rounded-md bg-white border border-[#E2E8F0] text-[#64748B] hover:border-[#14b8a6] hover:text-[#14b8a6] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 shadow-sm active:scale-90"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default memo(LocationTable);
