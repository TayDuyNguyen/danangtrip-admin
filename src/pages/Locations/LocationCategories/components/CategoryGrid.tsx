import { FolderOpen, Plus } from 'lucide-react';
import { Reorder } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import type { Category } from '@/dataHelper/category.dataHelper';
import CategoryCard from './CategoryCard';

interface CategoryGridProps {
    categories: Category[];
    onEdit: (category: Category) => void;
    onDelete: (category: Category) => void;
    onStatusChange: (id: number, status: 'active' | 'inactive') => void;
    onAdd?: () => void;
    hasActiveFilters?: boolean;
    statusUpdatingId?: number | null;
    isReorderMode?: boolean;
    onReorderChange?: (items: Category[]) => void;
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
    const { t } = useTranslation('location');

    if (categories.length === 0) {
        return (
            <div
                data-testid="location-category-empty"
                className="flex flex-col items-center justify-center rounded-[32px] border border-dashed border-slate-200 bg-white py-20 text-center"
            >
                <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-[32px] bg-slate-50">
                    <FolderOpen size={48} className="text-slate-200" />
                </div>
                <h3 className="text-xl font-black tracking-tight text-slate-900">{t('categories.empty_title')}</h3>
                <p className="mt-2 max-w-md font-medium text-slate-500">{t('categories.empty_subtitle')}</p>
                {!hasActiveFilters && onAdd && (
                    <button
                        type="button"
                        onClick={onAdd}
                        className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-[#14b8a6] px-8 py-3.5 font-black text-white shadow-xl shadow-[#14b8a6]/20 transition-all hover:bg-[#0f766e]"
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
            <Reorder.Group axis="y" values={categories} onReorder={onReorderChange} className="flex w-full flex-col gap-4">
                {categories.map((category, index) => (
                    <Reorder.Item key={category.id} value={category} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="touch-none">
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
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 2xl:grid-cols-3">
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
