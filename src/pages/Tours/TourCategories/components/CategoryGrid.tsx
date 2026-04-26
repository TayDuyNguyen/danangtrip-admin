import type { TourCategory } from '@/dataHelper/tourCategory.dataHelper';
import CategoryCard from './CategoryCard';
import * as Icons from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Reorder } from 'framer-motion';

interface CategoryGridProps {
    categories: TourCategory[];
    onEdit: (category: TourCategory) => void;
    onDelete: (category: TourCategory) => void;
    onStatusChange: (id: number, status: string) => void;
    isReorderMode?: boolean;
    onReorderChange?: (newOrder: TourCategory[]) => void;
}

const CategoryGrid = ({ categories, onEdit, onDelete, onStatusChange, isReorderMode, onReorderChange }: CategoryGridProps) => {
    const { t } = useTranslation('tour');

    if (categories.length === 0) {
        return (
            <div className="py-20 flex flex-col items-center justify-center text-center bg-white rounded-[32px] border border-dashed border-slate-200">
                <div className="w-24 h-24 bg-slate-50 rounded-[32px] flex items-center justify-center mb-6">
                    <Icons.FolderOpen size={48} className="text-slate-200" />
                </div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">{t('messages.no_data')}</h3>
                <p className="text-slate-500 font-medium mt-2">{t('messages.no_data_subtitle')}</p>
            </div>
        );
    }

    if (isReorderMode && onReorderChange) {
        return (
            <Reorder.Group 
                axis="y" 
                values={categories} 
                onReorder={onReorderChange}
                className="flex w-full flex-col gap-4" // Chuyển sang dạng List dọc để kéo thả mượt hơn
            >
                {categories.map((category) => (
                    <Reorder.Item 
                        key={category.id} 
                        value={category}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="touch-none" // Hỗ trợ mobile và tránh xung đột scroll
                    >
                        <CategoryCard 
                            category={category} 
                            onEdit={onEdit} 
                            onDelete={onDelete} 
                            onStatusChange={onStatusChange}
                            isReorderMode={true}
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
                />
            ))}
        </div>
    );
};

export default CategoryGrid;
