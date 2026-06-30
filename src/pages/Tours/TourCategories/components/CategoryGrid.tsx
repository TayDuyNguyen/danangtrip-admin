import type { TourCategory } from '@/dataHelper/tourCategory.dataHelper';
import CategoryCard from './CategoryCard';
import { FolderOpen, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Reorder } from 'framer-motion';

interface CategoryGridProps {
    categories: TourCategory[];
    onEdit: (category: TourCategory) => void;
    onDelete: (category: TourCategory) => void;
    onStatusChange: (id: number, status: string) => void;
    onAdd?: () => void;
    hasActiveFilters?: boolean;
    statusUpdatingId?: number | null;
    isReorderMode?: boolean;
    onReorderChange?: (newOrder: TourCategory[]) => void;
}

const CategoryGrid = ({
    categories,
    onEdit,
    onDelete,
    onStatusChange,
    onAdd,
    hasActiveFilters = false,
    statusUpdatingId = null,
    isReorderMode,
    onReorderChange,
}: CategoryGridProps) => {
    const { t } = useTranslation('tour');

    if (categories.length === 0) {
        return (
            <div
                data-testid="tour-category-empty"
                className="py-20 flex flex-col items-center justify-center text-center bg-white rounded-[32px] border border-dashed border-slate-200"
            >
                <div className="w-24 h-24 bg-slate-50 rounded-[32px] flex items-center justify-center mb-6">
                    <FolderOpen size={48} className="text-slate-200" />
                </div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                    {hasActiveFilters ? t('categories.empty_title') : t('categories.empty_title')}
                </h3>
                <p className="text-slate-500 font-medium mt-2 max-w-md">
                    {t('categories.empty_subtitle')}
                </p>
                {!hasActiveFilters && onAdd && (
                    <button
                        type="button"
                        onClick={onAdd}
                        className="mt-8 inline-flex items-center gap-2 bg-[#14b8a6] text-white px-8 py-3.5 rounded-2xl font-black hover:bg-[#0f766e] transition-all shadow-xl shadow-[#14b8a6]/20"
                    >
                        <Plus size={18} />
                        {t('categories.empty_cta')}
                    </button>
                )}
            </div>
        );
    }

    if (isReorderMode && onReorderChange) {
        return (
            <Reorder.Group
                axis="y"
                values={categories}
                onReorder={onReorderChange}
                className="flex w-full flex-col gap-4"
            >
                {categories.map((category, index) => (
                    <Reorder.Item
                        key={category.id}
                        value={category}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="touch-none"
                    >
                        <CategoryCard
                            category={category}
                            displayOrder={index + 1}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onStatusChange={onStatusChange}
                            statusUpdatingId={statusUpdatingId}
                            isReorderMode
                        />
                    </Reorder.Item>
                ))}
            </Reorder.Group>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
            {categories.map((category) => (
                <CategoryCard
                    key={category.id}
                    category={category}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onStatusChange={onStatusChange}
                    statusUpdatingId={statusUpdatingId}
                />
            ))}
        </div>
    );
};

export default CategoryGrid;
