import { useTranslation } from 'react-i18next';
import { Reorder } from 'framer-motion';
import { GripVertical, Folder, Pencil, Trash2, FileText } from 'lucide-react';
import type { BlogCategoryViewModel } from '@/types';

interface BlogCategoryTableProps {
    categories: BlogCategoryViewModel[];
    editingId?: number;
    onEdit: (category: BlogCategoryViewModel) => void;
    onDelete: (category: BlogCategoryViewModel) => void;
    isReorderMode?: boolean;
    onReorderChange?: (items: BlogCategoryViewModel[]) => void;
}

interface BlogCategoryCardProps {
    category: BlogCategoryViewModel;
    editingId?: number;
    displayOrder: number;
    onEdit: (category: BlogCategoryViewModel) => void;
    onDelete: (category: BlogCategoryViewModel) => void;
    isReorderMode?: boolean;
}

const BlogCategoryCard = ({
    category,
    editingId,
    displayOrder,
    onEdit,
    onDelete,
    isReorderMode,
}: BlogCategoryCardProps) => {
    const { t } = useTranslation('blog');
    const isEditing = editingId === category.id;
    const postCount = category.postCount || 0;

    return (
        <div
            className={`rounded-[28px] border bg-white p-5 shadow-sm transition-all ${
                isEditing
                    ? 'border-[#0066CC]/30 ring-4 ring-[#0066CC]/5'
                    : 'border-slate-200/60 hover:border-slate-300 hover:shadow-md'
            }`}
        >
            <div className="flex items-start gap-4">
                <button
                    type="button"
                    className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border transition-colors ${
                        isReorderMode
                            ? 'cursor-grab border-[#0066CC]/20 bg-blue-50 text-[#0066CC] active:cursor-grabbing'
                            : 'border-slate-200 bg-slate-50 text-slate-400'
                    }`}
                    tabIndex={-1}
                >
                    <GripVertical size={18} />
                </button>

                <div className="flex min-w-0 flex-1 items-start justify-between gap-4">
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <span className="flex h-6 min-w-[28px] items-center justify-center rounded-full bg-slate-100 px-2 text-[11px] font-black text-slate-500">
                                #{displayOrder}
                            </span>
                            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-[#0066CC]">
                                {t('category.card.label')}
                            </span>
                        </div>

                        <div className="mt-4 flex items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-[#0066CC]">
                                <Folder size={20} />
                            </div>
                            <div className="min-w-0">
                                <h4 className="truncate text-base font-black text-slate-900">
                                    {category.name}
                                </h4>
                                <p className="mt-0.5 truncate font-mono text-[11px] text-slate-400">
                                    {category.slug}
                                </p>
                            </div>
                        </div>

                        {category.description ? (
                            <p className="mt-3 line-clamp-2 text-sm font-medium leading-6 text-slate-500">
                                {category.description}
                            </p>
                        ) : (
                            <p className="mt-3 text-sm font-medium italic text-slate-400">
                                {t('category.card.no_description')}
                            </p>
                        )}
                    </div>

                    {!isReorderMode && (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => onEdit(category)}
                                className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500 transition-colors hover:bg-slate-50 hover:text-[#0066CC]"
                                title={t('actions.edit')}
                                type="button"
                            >
                                <Pencil size={15} />
                            </button>
                            <button
                                onClick={() => onDelete(category)}
                                className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500 transition-colors hover:bg-slate-50 hover:text-red-500"
                                title={t('actions.delete')}
                                type="button"
                            >
                                <Trash2 size={15} />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-5 flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 px-4 py-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-500 shadow-sm">
                    <FileText size={18} />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                        {t('category.card.posts_count')}
                    </p>
                    <p className="mt-1 text-lg font-black text-slate-900">{postCount}</p>
                </div>
            </div>
        </div>
    );
};

export const BlogCategoryTable = ({
    categories,
    editingId,
    onEdit,
    onDelete,
    isReorderMode,
    onReorderChange,
}: BlogCategoryTableProps) => {
    if (isReorderMode && onReorderChange) {
        return (
            <Reorder.Group axis="y" values={categories} onReorder={onReorderChange} className="flex w-full flex-col gap-4 p-6">
                {categories.map((category, index) => (
                    <Reorder.Item key={category.id} value={category} className="touch-none">
                        <BlogCategoryCard
                            category={category}
                            editingId={editingId}
                            displayOrder={index + 1}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            isReorderMode
                        />
                    </Reorder.Item>
                ))}
            </Reorder.Group>
        );
    }

    return (
        <div className="grid gap-4 p-6 xl:grid-cols-2">
            {categories.map((category, index) => (
                <BlogCategoryCard
                    key={category.id}
                    category={category}
                    editingId={editingId}
                    displayOrder={index + 1}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
};
