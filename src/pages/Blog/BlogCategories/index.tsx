import { useRef, useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { FolderPlus, Folder, FileText, Search, AlertCircle, RefreshCcw, ArrowUpDown, CheckCircle2, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import Breadcrumbs from '@/components/common/Breadcrumbs';
import StatCard from '@/components/common/StatCard';
import LoadingReact from '@/components/loading';
import { BlogCategoryTable } from './components/BlogCategoryTable';
import { BlogCategoryForm } from './components/BlogCategoryForm';
import { BlogCategoryDeleteDialog } from './components/BlogCategoryDeleteDialog';

import {
    useBlogCategoriesQuery,
    useCreateBlogCategoryMutation,
    useUpdateBlogCategoryMutation,
    useDeleteBlogCategoryMutation,
    useReorderBlogCategoriesMutation,
} from '@/hooks/useBlogQueries';
import type { BlogCategoryViewModel } from '@/types';
import type { BlogCategoryFormValues } from '@/validations/blogCategory.schema';

const normalizeReorderList = (items: BlogCategoryViewModel[]) =>
    items.map((category, index) => ({
        ...category,
        sortOrder: index + 1,
    }));

const BlogCategories = () => {
    const { t } = useTranslation(['blog', 'common']);
    const formSectionRef = useRef<HTMLDivElement>(null);

    const [search, setSearch] = useState('');
    const [isReorderMode, setIsReorderMode] = useState(false);
    const [reorderList, setReorderList] = useState<BlogCategoryViewModel[]>([]);
    const [editingCategory, setEditingCategory] = useState<BlogCategoryViewModel | null>(null);
    const [deletingCategory, setDeletingCategory] = useState<BlogCategoryViewModel | null>(null);
    const [formResetSignal, setFormResetSignal] = useState(0);
    const [isFormDirty, setIsFormDirty] = useState(false);

    const { data: categories = [], isLoading, isError, refetch } = useBlogCategoriesQuery();
    const createMutation = useCreateBlogCategoryMutation();
    const updateMutation = useUpdateBlogCategoryMutation();
    const deleteMutation = useDeleteBlogCategoryMutation();
    const reorderMutation = useReorderBlogCategoriesMutation();

    const totalCategories = categories.length;
    const totalPosts = useMemo(() => {
        return categories.reduce((sum, item) => sum + (item.postCount || 0), 0);
    }, [categories]);

    const filteredCategories = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return categories;
        return categories.filter((item) => {
            return (
                item.name.toLowerCase().includes(query) ||
                item.slug.toLowerCase().includes(query) ||
                (item.description && item.description.toLowerCase().includes(query))
            );
        });
    }, [categories, search]);

    const displayCategories = isReorderMode ? reorderList : filteredCategories;
    const hasActiveSearch = search.trim() !== '';
    const canReorder = categories.length >= 2;

    const scrollToForm = useCallback(() => {
        formSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    const confirmDiscardFormChanges = useCallback((): boolean => {
        if (!isFormDirty) return true;
        return window.confirm(
            t('common:notices.unsaved_changes_body', {
                defaultValue: 'Bạn có những thay đổi chưa được lưu. Bạn có chắc chắn muốn rời khỏi trang này không?',
            }),
        );
    }, [isFormDirty, t]);

    const handleAddClick = () => {
        if (!confirmDiscardFormChanges()) return;
        setEditingCategory(null);
        scrollToForm();
    };

    const handleEditClick = (category: BlogCategoryViewModel) => {
        if (!confirmDiscardFormChanges()) return;
        setEditingCategory(category);
        scrollToForm();
    };

    const handleDeleteClick = (category: BlogCategoryViewModel) => {
        if ((category.postCount || 0) > 0) return;
        setDeletingCategory(category);
    };

    const handleReorderCancel = () => {
        setIsReorderMode(false);
        setReorderList([]);
    };

    const handleReorderToggle = () => {
        if (isReorderMode) {
            handleReorderCancel();
            return;
        }
        setReorderList(normalizeReorderList([...categories].sort((left, right) => left.sortOrder - right.sortOrder)));
        setIsReorderMode(true);
    };

    const handleReorderChange = (items: BlogCategoryViewModel[]) => {
        setReorderList(normalizeReorderList(items));
    };

    const handleReorderSave = () => {
        const normalizedList = normalizeReorderList(reorderList);
        setReorderList(normalizedList);

        reorderMutation.mutate(
            normalizedList.map((category, index) => ({
                id: category.id,
                sort_order: index + 1,
            })),
            {
                onSuccess: async () => {
                    await refetch();
                    setIsReorderMode(false);
                    setReorderList([]);
                },
            },
        );
    };

    const handleFormSubmit = (values: BlogCategoryFormValues) => {
        const payload = {
            name: values.name,
            slug: values.slug,
            description: values.description || null,
        };

        if (editingCategory) {
            updateMutation.mutate(
                { id: editingCategory.id, payload },
                {
                    onSuccess: () => {
                        setEditingCategory(null);
                        setIsFormDirty(false);
                    },
                },
            );
            return;
        }

        createMutation.mutate(payload, {
            onSuccess: () => {
                setEditingCategory(null);
                setIsFormDirty(false);
                setFormResetSignal((value) => value + 1);
            },
        });
    };

    const handleConfirmDelete = () => {
        if (!deletingCategory) return;
        deleteMutation.mutate(deletingCategory.id, {
            onSuccess: () => {
                setDeletingCategory(null);
                if (editingCategory?.id === deletingCategory.id) {
                    setEditingCategory(null);
                    setFormResetSignal((value) => value + 1);
                }
            },
        });
    };

    const handleResetSearch = () => {
        setSearch('');
    };

    if (isLoading && categories.length === 0) {
        return <LoadingReact />;
    }

    if (isError && categories.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
                <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-[32px] bg-red-50 text-red-500">
                    <AlertCircle size={48} />
                </div>
                <h2 className="text-2xl font-black tracking-tight text-slate-900">
                    {t('blog:category.validation.load_error')}
                </h2>
                <p className="mt-2 max-w-md font-medium text-slate-500">
                    {t('blog:error.try_again')}
                </p>
                <button
                    type="button"
                    data-testid="blog-category-retry"
                    onClick={() => refetch()}
                    className="mt-8 flex items-center gap-2 rounded-2xl bg-[#14b8a6] px-8 py-3.5 font-black text-white shadow-xl shadow-[#14b8a6]/20 transition-all hover:scale-105 hover:bg-[#0f766e] active:scale-95"
                >
                    <RefreshCcw size={20} />
                    <span>{t('blog:actions.btn_reset', { defaultValue: 'Thử lại' })}</span>
                </button>
            </div>
        );
    }

    return (
        <div className="w-full animate-in fade-in slide-in-from-bottom-4 px-4 py-8 duration-700">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                <div>
                    <Breadcrumbs
                        items={[
                            { label: t('blog:breadcrumb'), path: '/admin/blog-posts' },
                            { label: t('blog:category.title') },
                        ]}
                    />
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 mt-2">
                        {t('blog:category.title')}
                    </h1>
                    <p className="text-slate-500 text-sm font-medium mt-1">
                        {t('blog:category.subtitle')}
                    </p>
                </div>

                <button
                    type="button"
                    data-testid="blog-category-add-button"
                    onClick={handleAddClick}
                    className="flex items-center justify-center gap-2 bg-[#0066CC] hover:bg-[#004999] text-white rounded-2xl px-6 py-3.5 font-black text-sm transition-all shadow-lg shadow-[#0066CC]/20 active:scale-95 shrink-0"
                >
                    <FolderPlus size={18} />
                    <span>{t('blog:form.categories.add_new')}</span>
                </button>
            </div>

            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">
                {t('blog:category.stats_scope_note')}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8" data-testid="blog-category-stats">
                <StatCard
                    title={t('blog:category.stats.total')}
                    value={totalCategories}
                    icon={Folder}
                    accent="secondary"
                />
                <StatCard
                    title={t('blog:category.stats.total_posts')}
                    value={totalPosts}
                    icon={FileText}
                    accent="teal"
                />
            </div>

            <div className="mb-8 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 px-6 py-5 border border-slate-200/60 rounded-3xl bg-white shadow-sm">
                <div className="relative flex-1 max-w-xl">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <Search size={18} />
                    </div>
                    <input
                        type="text"
                        data-testid="blog-category-search"
                        placeholder={t('blog:category.table.search_placeholder')}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full rounded-2xl border border-slate-200/80 bg-white py-3 pl-11 pr-4 font-bold text-sm text-slate-900 outline-hidden transition-all placeholder:text-slate-400 focus:border-[#0066CC] focus:ring-4 focus:ring-[#0066CC]/5"
                    />
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                    {hasActiveSearch && (
                        <button
                            type="button"
                            data-testid="blog-category-reset-search"
                            onClick={handleResetSearch}
                            className="flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 font-black text-sm text-slate-600 transition-all hover:bg-slate-50"
                        >
                            <RotateCcw size={16} />
                            <span>{t('blog:category.reset_search')}</span>
                        </button>
                    )}
                    <button
                        type="button"
                        data-testid="blog-category-reorder-button"
                        onClick={handleReorderToggle}
                        disabled={hasActiveSearch || !canReorder}
                        className={`flex items-center gap-3 rounded-2xl border px-5 py-3 font-black text-sm transition-all disabled:opacity-50 disabled:grayscale ${
                            isReorderMode
                                ? 'border-[#d9f99d] bg-[#f4fce3] text-[#0f766e] ring-4 ring-[#14b8a6]/10'
                                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 active:scale-95'
                        }`}
                        title={
                            hasActiveSearch
                                ? t('blog:category.reorder.disabled_title')
                                : !canReorder
                                  ? t('blog:category.reorder.disabled_min_title')
                                  : undefined
                        }
                    >
                        <ArrowUpDown size={18} />
                        <span>
                            {isReorderMode
                                ? t('blog:category.reorder.button_sorting')
                                : t('blog:category.reorder.button_sort')}
                        </span>
                    </button>
                    <div className="flex items-center justify-between gap-3 text-xs font-bold text-slate-400 rounded-2xl border border-slate-100 bg-slate-50/40 px-4 py-3">
                        <span>
                            {filteredCategories.length} {t('blog:category.table.count_suffix')}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 items-start">
                <div className="flex-1 w-full bg-white border border-slate-200/60 rounded-3xl overflow-hidden shadow-sm">
                    {displayCategories.length > 0 ? (
                        <BlogCategoryTable
                            categories={displayCategories}
                            editingId={editingCategory?.id}
                            onEdit={handleEditClick}
                            onDelete={handleDeleteClick}
                            isReorderMode={isReorderMode}
                            onReorderChange={handleReorderChange}
                        />
                    ) : (
                        <div className="py-16" data-testid="blog-category-empty">
                            <Folder size={48} className="text-slate-300/60 mx-auto mb-4" />
                            <h3 className="text-base font-black text-slate-800 text-center">
                                {categories.length === 0
                                    ? t('blog:category.empty_title')
                                    : t('blog:category.empty_search_title')}
                            </h3>
                            <p className="text-xs font-medium text-slate-400 mt-1 text-center">
                                {categories.length === 0
                                    ? t('blog:category.empty_subtitle')
                                    : t('blog:category.empty_search_subtitle')}
                            </p>
                        </div>
                    )}

                    <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/30 text-center sm:text-left">
                        <p className="text-xs font-medium text-slate-400 flex items-center justify-center sm:justify-start gap-1.5">
                            {isReorderMode ? t('blog:category.reorder.bar_hint') : t('blog:category.table.drag_helper')}
                        </p>
                    </div>
                </div>

                <div
                    id="blog-category-form-section"
                    ref={formSectionRef}
                    className="w-full lg:w-[380px] shrink-0"
                >
                    <BlogCategoryForm
                        initialData={editingCategory}
                        isSubmitting={createMutation.isPending || updateMutation.isPending}
                        onSubmit={handleFormSubmit}
                        onReset={() => {
                            setEditingCategory(null);
                            setIsFormDirty(false);
                        }}
                        resetSignal={formResetSignal}
                        onDirtyChange={setIsFormDirty}
                    />
                </div>
            </div>

            <AnimatePresence>
                {isReorderMode && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        data-testid="blog-category-reorder-bar"
                        className="fixed bottom-8 left-1/2 z-50 flex -translate-x-1/2 items-center gap-8 rounded-[32px] border border-slate-800 bg-slate-900 px-8 py-5 text-white shadow-2xl"
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0066CC]">
                                <ArrowUpDown size={18} />
                            </div>
                            <div>
                                <p className="text-sm font-black tracking-tight">{t('blog:category.reorder.bar_title')}</p>
                                <p className="text-[11px] font-medium text-slate-400">{t('blog:category.reorder.bar_hint')}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                data-testid="blog-category-reorder-cancel"
                                onClick={handleReorderCancel}
                                className="rounded-xl px-6 py-3 font-black text-slate-400 transition-all hover:bg-white/10 hover:text-white"
                            >
                                {t('blog:category.reorder.cancel')}
                            </button>
                            <button
                                type="button"
                                data-testid="blog-category-reorder-save"
                                onClick={handleReorderSave}
                                disabled={reorderMutation.isPending}
                                className="flex items-center gap-2 rounded-xl bg-[#0066CC] px-8 py-3 font-black text-white shadow-lg shadow-[#0066CC]/20 transition-all hover:bg-[#004999] disabled:opacity-50"
                            >
                                {reorderMutation.isPending ? (
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                ) : (
                                    <CheckCircle2 size={18} />
                                )}
                                <span>{t('blog:category.reorder.save')}</span>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <BlogCategoryDeleteDialog
                isOpen={!!deletingCategory}
                categoryName={deletingCategory?.name ?? ''}
                onClose={() => setDeletingCategory(null)}
                onConfirm={handleConfirmDelete}
                isDeleting={deleteMutation.isPending}
            />
        </div>
    );
};

export default BlogCategories;
