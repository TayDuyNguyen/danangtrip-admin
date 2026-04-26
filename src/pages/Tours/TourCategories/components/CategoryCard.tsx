import { Edit2, Trash2, GripVertical } from 'lucide-react';
import * as Icons from 'lucide-react';
import { cn } from '@/utils/cn';
import type { TourCategory } from '@/dataHelper/tourCategory.dataHelper';
import { useTranslation } from 'react-i18next';

interface CategoryCardProps {
    category: TourCategory;
    onEdit: (category: TourCategory) => void;
    onDelete: (category: TourCategory) => void;
    onStatusChange: (id: number, status: string) => void;
    isReorderMode?: boolean;
}

const CategoryCard = ({ category, onEdit, onDelete, onStatusChange, isReorderMode }: CategoryCardProps) => {
    const { t } = useTranslation('tour');
    
    const formatIconName = (name: string) => {
        if (!name) return 'Map';
        // Capitalize first letter (e.g., 'mountain' -> 'Mountain')
        const pascalName = name.charAt(0).toUpperCase() + name.slice(1);
        return pascalName;
    };

    // Predefined colors from Dialog
    const colorOptions = [
        '#E0F2FE', '#FFEDD5', '#DCFCE7', '#FEF9C3', '#FEE2E2', '#E0E7FF', '#CFFAFE', '#FCE7F3'
    ];

    // Get a consistent color based on category ID or name
    const getDeterministicColor = () => {
        if (category.icon_background) return category.icon_background;
        const index = category.id % colorOptions.length;
        return colorOptions[index];
    };

    const iconName = formatIconName(category.icon);
    const IconComponent = (Icons as unknown as Record<string, React.ComponentType<{ size?: number; className?: string }>>)[iconName] || Icons.Map;
    const backgroundColor = getDeterministicColor();
    
    // Calculate progress (just for visual representation, e.g., max 50 tours)
    const progress = Math.min((category.tour_count / 50) * 100, 100);

    return (
        <div className={cn(
            "bg-white rounded-[32px] border transition-all group flex flex-col gap-5",
            isReorderMode 
                ? "p-4 border-[#d9f99d] shadow-lg shadow-[#14b8a6]/10 cursor-grab active:cursor-grabbing" 
                : "p-6 border-slate-200/60 shadow-sm hover:shadow-xl hover:shadow-slate-200/40"
        )}>
            <div className="flex items-start gap-4">
                {/* Icon Column */}
                <div 
                    className={cn(
                        "rounded-3xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform",
                        isReorderMode ? "w-12 h-12" : "w-16 h-16"
                    )}
                    style={{ backgroundColor: backgroundColor }}
                >
                    {isReorderMode ? (
                        <GripVertical size={20} className="text-[#14b8a6]" />
                    ) : (
                        <IconComponent size={28} className="text-slate-700" />
                    )}
                </div>

                {/* Info Column */}
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
                                onClick={() => onStatusChange(category.id, category.status === 'active' ? 'inactive' : 'active')}
                                className={cn(
                                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0 transition-all active:scale-90",
                                    category.status === 'active' 
                                        ? "bg-[#dff7f4] text-[#0f766e] hover:bg-[#ccfbf1]" 
                                        : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                                )}
                            >
                                {t(`status.${category.status}`)}
                            </button>
                        )}
                        {isReorderMode && (
                            <div className="px-3 py-1 bg-[#f4fce3] text-[#0f766e] text-[10px] font-black uppercase tracking-wider rounded-full">
                                # {category.sort_order}
                            </div>
                        )}
                    </div>
                    <p className="text-sm font-medium text-slate-400 truncate">
                        {category.slug}
                    </p>
                </div>
            </div>

            {/* Tour Count & Progress */}
            <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                    <span className="font-bold text-slate-400 uppercase tracking-widest text-[11px]">
                        {t('categories.table.header_tour_count')}:
                    </span>
                    <span className="font-black text-slate-900">{category.tour_count}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-[#14b8a6] rounded-full transition-all duration-1000"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                <div className="flex items-center gap-2">
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                        VỊ TRÍ:
                    </span>
                    <div className={cn(
                        "w-12 h-9 rounded-xl border flex items-center justify-center text-sm font-black transition-all",
                        isReorderMode ? "bg-[#14b8a6] border-[#14b8a6] text-white shadow-lg shadow-[#14b8a6]/25" : "bg-slate-50 border-slate-100 text-slate-900"
                    )}>
                        {category.sort_order}
                    </div>
                </div>
                
                {!isReorderMode && (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onEdit(category)}
                            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-[#14b8a6] hover:border-[#ccfbf1] hover:shadow-lg hover:shadow-[#14b8a6]/10 transition-all"
                        >
                            <Edit2 size={16} />
                        </button>
                        <button
                            onClick={() => onDelete(category)}
                            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-red-600 hover:border-red-200 hover:shadow-lg hover:shadow-red-500/10 transition-all"
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
