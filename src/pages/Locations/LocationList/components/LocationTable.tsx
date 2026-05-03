import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
    Eye, 
    Edit2, 
    Trash2, 
    MapPin, 
    Star as StarIcon, 
    Heart 
} from 'lucide-react';
import type { LocationViewModel } from '@/dataHelper/location.dataHelper';
import ToggleSwitch from '@/components/ui/ToggleSwitch';
import Badge from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';

interface LocationTableProps {
    items: LocationViewModel[];
    isLoading: boolean;
    selectedIds: number[];
    onSelectRow: (id: number) => void;
    onSelectAll: () => void;
    onToggleFeatured: (id: number, enabled: boolean) => void;
    onView: (id: number) => void;
    onEdit: (id: number) => void;
    onDelete: (id: number) => void;
}

const LocationTable = ({
    items,
    isLoading,
    selectedIds,
    onSelectRow,
    onSelectAll,
    onToggleFeatured,
    onView,
    onEdit,
    onDelete
}: LocationTableProps) => {
    const { t } = useTranslation('location');

    const isAllSelected = items.length > 0 && selectedIds.length === items.length;

    if (isLoading) {
        return (
            <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                <div className="p-6 space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50/50 border-b border-slate-100">
                        <tr className="text-[11px] uppercase font-black text-slate-400 tracking-widest">
                            <th className="w-12 px-6 py-4">
                                <input 
                                    type="checkbox" 
                                    className="w-4 h-4 rounded border-slate-300 text-[#14b8a6] focus:ring-[#14b8a6]"
                                    checked={isAllSelected}
                                    onChange={onSelectAll}
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
                        {items.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-6 py-4">
                                    <input 
                                        type="checkbox" 
                                        className="w-4 h-4 rounded border-slate-300 text-[#14b8a6] focus:ring-[#14b8a6]"
                                        checked={selectedIds.includes(item.id)}
                                        onChange={() => onSelectRow(item.id)}
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
                                    <span className="text-[13px] font-black text-slate-700">{item.priceLevelLabel}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-1">
                                        <StarIcon size={14} className="text-amber-400 fill-amber-400" />
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
                                    <div className="flex justify-end gap-1">
                                        <button 
                                            onClick={() => onView(item.id)}
                                            className="p-2 text-slate-400 hover:text-[#14b8a6] hover:bg-[#14b8a6]/5 rounded-lg transition-all"
                                        >
                                            <Eye size={18} />
                                        </button>
                                        <button 
                                            onClick={() => onEdit(item.id)}
                                            className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-all"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button 
                                            onClick={() => onDelete(item.id)}
                                            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            {items.length === 0 && !isLoading && (
                <div className="p-12 text-center">
                    <p className="text-slate-400 font-bold">{t('common:labels.not_available')}</p>
                </div>
            )}
        </div>
    );
};

export default memo(LocationTable);
