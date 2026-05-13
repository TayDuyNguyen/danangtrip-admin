import { FolderOpen } from 'lucide-react';
import { Reorder } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import type { Category } from '@/dataHelper/category.dataHelper';
import CategoryCard from './CategoryCard';

interface CategoryGridProps {
    categories: Category[];
    onEdit: (category: Category) => void;
    onDelete: (category: Category) => void;
    onStatusChange: (id: number, status: 'active' | 'inactive') => void;
    isReorderMode?: boolean;
    onReorderChange?: (items: Category[]) => void;
}

const CategoryGrid = ({ categories, onEdit, onDelete, onStatusChange, isReorderMode, onReorderChange }: CategoryGridProps) => {
    const { t } = useTranslation('location');

    if (categories.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-[32px] border border-dashed border-slate-200 bg-white py-20 text-center">
                <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-[32px] bg-slate-50">
                    <FolderOpen size={48} className="text-slate-200" />
                </div>
                <h3 className="text-xl font-black tracking-tight text-slate-900">{t('messages.no_data')}</h3>
                <p className="mt-2 font-medium text-slate-500">{t('messages.no_data_subtitle')}</p>
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
                />
            ))}
        </div>
    );
};

export default CategoryGrid;
