import { Edit2, Trash2, GripVertical, MapPinned } from 'lucide-react';
import * as Icons from 'lucide-react';
import type { ComponentType, CSSProperties } from 'react';
import { cn } from '@/utils/cn';
import { resolveCategoryIconName } from '@/utils/categoryIcon';
import type { Category } from '@/dataHelper/category.dataHelper';
import { useTranslation } from 'react-i18next';

interface CategoryCardProps {
    category: Category;
    displayOrder?: number;
    onEdit: (category: Category) => void;
    onDelete: (category: Category) => void;
    onStatusChange: (id: number, status: 'active' | 'inactive') => void;
    isReorderMode?: boolean;
}

const CategoryCard = ({ category, displayOrder, onEdit, onDelete, onStatusChange, isReorderMode }: CategoryCardProps) => {
    const { t } = useTranslation('location');

    const iconName = resolveCategoryIconName(category.icon, 'MapPinned');
    const IconComponent = (Icons as unknown as Record<string, ComponentType<{ size?: number; className?: string; style?: CSSProperties }>>)[iconName] || MapPinned;
    const nextStatus = category.status === 'active' ? 'inactive' : 'active';
    const progress = Math.min((category.locationsCount / 50) * 100, 100);
    const visibleOrder = displayOrder ?? category.sortOrder;
    const iconForegroundColor = category.iconBackground.toLowerCase() === '#000000' || category.iconBackground.toLowerCase() === '#1e293b'
        ? '#ffffff'
        : '#334155';

    return (
        <div
            className={cn(
                'group flex flex-col gap-5 rounded-[32px] border bg-white transition-all',
                isReorderMode
                    ? 'cursor-grab border-[#d9f99d] p-4 shadow-lg shadow-[#14b8a6]/10 active:cursor-grabbing'
                    : 'border-slate-200/60 p-6 shadow-sm hover:shadow-xl hover:shadow-slate-200/40',
            )}
        >
            <div className="flex items-start gap-4">
                <div
                    className={cn(
                        'relative flex shrink-0 items-center justify-center rounded-3xl transition-transform group-hover:scale-105',
                        isReorderMode ? 'h-12 w-12' : 'h-16 w-16',
                    )}
                    style={{ backgroundColor: category.iconBackground }}
                >
                    <IconComponent size={isReorderMode ? 22 : 28} style={{ color: iconForegroundColor }} />
                    {isReorderMode && (
                        <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border border-[#d9f99d] bg-white shadow-sm">
                            <GripVertical size={14} className="text-[#0f766e]" />
                        </div>
                    )}
                </div>

                <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center justify-between gap-2">
                        <h3 className={cn('truncate font-black tracking-tight text-slate-900', isReorderMode ? 'text-base' : 'text-[17px]')}>
                            {category.name}
                        </h3>
                        {!isReorderMode ? (
                            <button
                                onClick={() => onStatusChange(category.id, nextStatus)}
                                className={cn(
                                    'shrink-0 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider transition-all active:scale-90',
                                    category.status === 'active'
                                        ? 'bg-[#dff7f4] text-[#0f766e] hover:bg-[#ccfbf1]'
                                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200',
                                )}
                            >
                                {t(`status.${category.status}`)}
                            </button>
                        ) : (
                            <div className="rounded-full bg-[#f4fce3] px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#0f766e]">
                                # {visibleOrder}
                            </div>
                        )}
                    </div>
                    <p className="truncate text-sm font-medium text-slate-400">{category.slug}</p>
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                        {t('categories.table.items_count')}:
                    </span>
                    <span className="font-black text-slate-900">{category.locationsCount}</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-[#14b8a6] transition-all duration-1000" style={{ width: `${progress}%` }} />
                </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-50 pt-2">
                <div className="flex items-center gap-2">
                    <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                        {t('categories.form.order')}:
                    </span>
                    <div
                        className={cn(
                            'flex h-9 w-12 items-center justify-center rounded-xl border text-sm font-black transition-all',
                            isReorderMode
                                ? 'border-[#14b8a6] bg-[#14b8a6] text-white shadow-lg shadow-[#14b8a6]/25'
                                : 'border-slate-100 bg-slate-50 text-slate-900',
                        )}
                    >
                        {visibleOrder}
                    </div>
                </div>

                {!isReorderMode && (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onEdit(category)}
                            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-all hover:border-[#ccfbf1] hover:text-[#14b8a6] hover:shadow-lg hover:shadow-[#14b8a6]/10"
                        >
                            <Edit2 size={16} />
                        </button>
                        <button
                            onClick={() => onDelete(category)}
                            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-all hover:border-red-200 hover:text-red-600 hover:shadow-lg hover:shadow-red-500/10"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CategoryCard;
