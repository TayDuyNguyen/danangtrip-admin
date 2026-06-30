import { Edit2, Trash2, GripVertical } from 'lucide-react';
import type { ComponentType, CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/utils/cn';
import { getCategoryIconComponent } from '@/utils/categoryIcon';
import type { TourCategory } from '@/dataHelper/tourCategory.dataHelper';
import { useTranslation } from 'react-i18next';
import { CATEGORY_CARD_COLOR_OPTIONS } from '@/constants/categoryTheme';
import { ROUTES } from '@/routes/routes';

interface CategoryCardProps {
    category: TourCategory;
    displayOrder?: number;
    onEdit: (category: TourCategory) => void;
    onDelete: (category: TourCategory) => void;
    onStatusChange: (id: number, status: string) => void;
    isReorderMode?: boolean;
    statusUpdatingId?: number | null;
}

const CategoryCard = ({
    category,
    displayOrder,
    onEdit,
    onDelete,
    onStatusChange,
    isReorderMode,
    statusUpdatingId = null,
}: CategoryCardProps) => {
    const { t } = useTranslation('tour');

    const getDeterministicColor = () => {
        if (category.icon_background) return category.icon_background;
        const index = category.id % CATEGORY_CARD_COLOR_OPTIONS.length;
        return CATEGORY_CARD_COLOR_OPTIONS[index];
    };

    const IconComponent = getCategoryIconComponent(category.icon, 'Map') as ComponentType<{
        size?: number;
        className?: string;
        style?: CSSProperties;
    }>;
    const backgroundColor = getDeterministicColor();
    const visibleOrder = displayOrder ?? category.sort_order;
    const iconForegroundColor = backgroundColor.toLowerCase() === '#000000' ? '#ffffff' : '#334155';
    const isStatusUpdating = statusUpdatingId === category.id;
    const canDelete = category.tour_count === 0;

    return (
        <div
            data-testid={`tour-category-card-${category.id}`}
            className={cn(
                "bg-white rounded-[32px] border transition-all group flex flex-col gap-5",
                isReorderMode
                    ? "p-4 border-[#d9f99d] shadow-lg shadow-[#14b8a6]/10 cursor-grab active:cursor-grabbing"
                    : "p-6 border-slate-200/60 shadow-sm hover:shadow-xl hover:shadow-slate-200/40"
            )}
        >
            <div className="flex items-start gap-4">
                <div
                    className={cn(
                        "relative rounded-3xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform",
                        isReorderMode ? "w-12 h-12" : "w-16 h-16"
                    )}
                    style={{ backgroundColor }}
                >
                    <IconComponent size={isReorderMode ? 22 : 28} style={{ color: iconForegroundColor }} />
                    {isReorderMode && (
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white border border-[#d9f99d] shadow-sm flex items-center justify-center">
                            <GripVertical size={14} className="text-[#14b8a6]" />
                        </div>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                        <h3 className={cn(
                            "font-black text-slate-900 truncate tracking-tight",
                            isReorderMode ? "text-base" : "text-[17px]"
                        )}>
                            {category.name}
                        </h3>
                        {!isReorderMode && (
                            <button
                                type="button"
                                onClick={() => onStatusChange(category.id, category.status === 'active' ? 'inactive' : 'active')}
                                disabled={isStatusUpdating}
                                aria-label={t(`status.${category.status}`)}
                                data-testid={`tour-category-status-${category.id}`}
                                className={cn(
                                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0 transition-all active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed",
                                    category.status === 'active'
                                        ? "bg-[#dff7f4] text-[#0f766e] hover:bg-[#ccfbf1]"
                                        : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                                )}
                            >
                                {isStatusUpdating ? '…' : t(`status.${category.status}`)}
                            </button>
                        )}
                        {isReorderMode && (
                            <div className="px-3 py-1 bg-[#f4fce3] text-[#0f766e] text-[10px] font-black uppercase tracking-wider rounded-full">
                                # {visibleOrder}
                            </div>
                        )}
                    </div>
                    <p className="text-sm font-medium text-slate-400 truncate">{category.slug}</p>
                    {category.description && !isReorderMode && (
                        <p className="text-sm font-medium text-slate-500 mt-2 line-clamp-2">{category.description}</p>
                    )}
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                    <span className="font-bold text-slate-400 uppercase tracking-widest text-[11px]">
                        {t('categories.table.header_tour_count')}:
                    </span>
                    {category.tour_count > 0 ? (
                        <Link
                            to={`${ROUTES.TOURS_LIST}?tour_category_id=${category.id}`}
                            className="font-black text-[#0f766e] hover:underline"
                            data-testid={`tour-category-tours-link-${category.id}`}
                        >
                            {category.tour_count}
                        </Link>
                    ) : (
                        <span className="font-black text-slate-900">{category.tour_count}</span>
                    )}
                </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                <div className="flex items-center gap-2">
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                        {t('categories.table.header_order')}:
                    </span>
                    <div className={cn(
                        "w-12 h-9 rounded-xl border flex items-center justify-center text-sm font-black transition-all",
                        isReorderMode ? "bg-[#14b8a6] border-[#14b8a6] text-white shadow-lg shadow-[#14b8a6]/25" : "bg-slate-50 border-slate-100 text-slate-900"
                    )}>
                        {visibleOrder}
                    </div>
                </div>

                {!isReorderMode && (
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => onEdit(category)}
                            aria-label={t('categories.actions.edit', { name: category.name })}
                            data-testid={`tour-category-edit-${category.id}`}
                            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-[#14b8a6] hover:border-[#ccfbf1] hover:shadow-lg hover:shadow-[#14b8a6]/10 transition-all"
                        >
                            <Edit2 size={16} />
                        </button>
                        <button
                            type="button"
                            onClick={() => onDelete(category)}
                            disabled={!canDelete}
                            aria-label={
                                canDelete
                                    ? t('categories.actions.delete', { name: category.name })
                                    : t('categories.actions.delete_blocked', { count: category.tour_count })
                            }
                            title={
                                canDelete
                                    ? t('categories.actions.delete', { name: category.name })
                                    : t('categories.actions.delete_blocked', { count: category.tour_count })
                            }
                            data-testid={`tour-category-delete-${category.id}`}
                            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-red-600 hover:border-red-200 hover:shadow-lg hover:shadow-red-500/10 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-slate-600 disabled:hover:border-slate-200 disabled:hover:shadow-none"
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
