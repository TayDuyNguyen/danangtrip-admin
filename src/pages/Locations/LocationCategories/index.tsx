import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LayoutGrid, CheckCircle2, XCircle, Search, AlertCircle, RefreshCcw, Filter, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CustomSelect from '@/components/ui/CustomSelect';
import { cn } from '@/utils/cn';

import LoadingReact from '@/components/loading';
import CategoryHeader from './components/CategoryHeader';
import CategoryGrid from './components/CategoryGrid';
import CategoryFormModal from './components/CategoryFormModal';
import CategoryDeleteDialog from './components/CategoryDeleteDialog';
import { useCategoriesQuery, useCategoryMutations } from '@/hooks/useCategoryQueries';
import type { Category } from '@/dataHelper/category.dataHelper';
import type { CategoryFormValues } from '@/validations/category.schema';
import { useDebounce } from '@/hooks/useDebounce';

const normalizeReorderList = (items: Category[]) =>
    items.map((category, index) => ({
        ...category,
        sortOrder: index + 1,
    }));

const LocationCategories = () => {
    const { t } = useTranslation('location');
    const [searchInput, setSearchInput] = useState('');
    const debouncedSearch = useDebounce(searchInput, 300);
    const [statusFilter, setStatusFilter] = useState<'active' | 'inactive' | undefined>(undefined);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isReorderMode, setIsReorderMode] = useState(false);
    const [reorderList, setReorderList] = useState<Category[]>([]);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

    const { data, isLoading, isError, refetch } = useCategoriesQuery({
        search: debouncedSearch || undefined,
        status: statusFilter,
        all: true,
        with_stats: true,
    });
    const { createMutation, updateMutation, deleteMutation, statusMutation, reorderMutation } = useCategoryMutations();

    const categories = useMemo(() => data?.items || [], [data?.items]);
    const stats = data?.stats || { total: 0, active: 0, inactive: 0 };
    const hasActiveFilters = searchInput.trim() !== '' || statusFilter !== undefined;
    const nextSortOrder = categories.length > 0 ? Math.max(...categories.map((category) => category.sortOrder)) + 1 : 1;
    const displayCategories = isReorderMode ? reorderList : categories;

    const statusFilterOptions = useMemo(
        () => [
            { value: '', label: t('status.all') },
            { value: 'active', label: t('status.active') },
            { value: 'inactive', label: t('status.inactive') },
        ],
        [t],
    );

    const statusUpdatingId = statusMutation.isPending ? (statusMutation.variables?.id ?? null) : null;

    const handleAdd = () => {
        setEditingCategory(null);
        setIsDialogOpen(true);
    };

    const handleEdit = (category: Category) => {
        setEditingCategory(category);
        setIsDialogOpen(true);
    };

    const handleDeleteClick = (category: Category) => setDeletingCategory(category);

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

    const handleReorderChange = (items: Category[]) => {
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
                },
            },
        );
    };

    const handleFormSubmit = (values: CategoryFormValues) => {
        const payload = {
            name: values.name,
            slug: values.slug,
            description: values.description,
            status: values.status as 'active' | 'inactive',
            sort_order: editingCategory?.sortOrder ?? nextSortOrder,
            image: values.image,
            icon: values.icon,
            icon_background: values.icon_background,
        };

        if (editingCategory) {
            updateMutation.mutate(
                { id: editingCategory.id, data: payload },
                {
                    onSuccess: () => setIsDialogOpen(false),
                },
            );
            return;
        }

        createMutation.mutate(payload, {
            onSuccess: () => setIsDialogOpen(false),
        });
    };

    const handleConfirmDelete = () => {
        if (!deletingCategory) {
            return;
        }

        deleteMutation.mutate(deletingCategory.id, {
            onSuccess: () => setDeletingCategory(null),
        });
    };

    const handleResetFilters = () => {
        setSearchInput('');
        setStatusFilter(undefined);
    };

    const handleStatusChange = (id: number, status: 'active' | 'inactive') => {
        statusMutation.mutate({ id, status });
    };

    if (isLoading && categories.length === 0) {
        return <LoadingReact />;
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
                <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-[32px] bg-red-50 text-red-500">
                    <AlertCircle size={48} />
                </div>
                <h2 className="text-2xl font-black tracking-tight text-slate-900">{t('categories.messages.load_error')}</h2>
                <p className="mt-2 max-w-md font-medium text-slate-500">{t('categories.messages.load_error_subtitle')}</p>
                <button
                    type="button"
                    data-testid="location-category-retry"
                    onClick={() => refetch()}
                    className="mt-8 flex items-center gap-2 rounded-2xl bg-[#14b8a6] px-8 py-3.5 font-black text-white shadow-xl shadow-[#14b8a6]/20 transition-all hover:scale-105 hover:bg-[#0f766e] active:scale-95"
                >
                    <RefreshCcw size={20} />
                    <span>{t('form.actions.retry')}</span>
                </button>
            </div>
        );
    }

    return (
        <div className="w-full animate-in fade-in slide-in-from-bottom-4 px-4 py-8 duration-700">
            <CategoryHeader onAdd={handleAdd} />

            <div className="mb-3">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">{t('categories.stats_scope_note')}</p>
            </div>
            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3" data-testid="location-category-stats">
                <div className="group flex items-center gap-5 rounded-[32px] border border-slate-200/60 bg-white p-7 shadow-sm transition-all hover:shadow-xl hover:shadow-[#14b8a6]/5">
                    <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-[#dff7f4] text-[#14b8a6] transition-transform group-hover:scale-110">
                        <LayoutGrid size={28} />
                    </div>
                    <div>
                        <p className="mb-1 text-[11px] font-black uppercase tracking-widest text-slate-400">{t('categories.stats.total')}</p>
                        <p className="text-3xl font-black text-slate-900">{stats.total}</p>
                    </div>
                </div>
                <div className="group flex items-center gap-5 rounded-[32px] border border-slate-200/60 bg-white p-7 shadow-sm transition-all hover:shadow-xl hover:shadow-[#14b8a6]/5">
                    <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-blue-100 text-[#0f766e] transition-transform group-hover:scale-110">
                        <CheckCircle2 size={28} />
                    </div>
                    <div>
                        <p className="mb-1 text-[11px] font-black uppercase tracking-widest text-slate-400">{t('categories.stats.active')}</p>
                        <p className="text-3xl font-black text-slate-900">{stats.active}</p>
                    </div>
                </div>
                <div className="group flex items-center gap-5 rounded-[32px] border border-slate-200/60 bg-white p-7 shadow-sm transition-all hover:shadow-xl hover:shadow-slate-500/5">
                    <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-50 text-slate-600 transition-transform group-hover:scale-110">
                        <XCircle size={28} />
                    </div>
                    <div>
                        <p className="mb-1 text-[11px] font-black uppercase tracking-widest text-slate-400">{t('categories.stats.inactive')}</p>
                        <p className="text-3xl font-black text-slate-900">{stats.inactive}</p>
                    </div>
                </div>
            </div>

            <div className="mb-8 flex flex-col items-stretch justify-between gap-4 rounded-[32px] border border-slate-100 bg-white p-4 shadow-sm xl:flex-row xl:items-center">
                <div className="flex flex-1 flex-col items-center gap-4 md:flex-row">
                    <div className="group relative w-full flex-1">
                        <div className="absolute left-5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center text-slate-400 transition-colors group-focus-within:text-[#14b8a6]">
                            <Search size={20} />
                        </div>
                        <input
                            type="text"
                            data-testid="location-category-search"
                            placeholder={t('categories.search_placeholder')}
                            value={searchInput}
                            onChange={(event) => setSearchInput(event.target.value)}
                            className="w-full rounded-3xl border-none bg-slate-50/50 py-4 pl-14 pr-6 font-bold text-slate-900 outline-hidden transition-all placeholder:text-slate-400 focus:bg-white focus:ring-4 focus:ring-[#14b8a6]/10"
                        />
                    </div>

                    <div className="w-full min-w-[220px] md:w-auto">
                        <CustomSelect
                            options={statusFilterOptions}
                            value={statusFilterOptions.find((option) => option.value === (statusFilter || ''))}
                            onChange={(option) => setStatusFilter((option as { value: 'active' | 'inactive' })?.value || undefined)}
                            placeholder={t('status.all')}
                            leftIcon={<Filter size={16} className="text-slate-400" />}
                        />
                    </div>

                    {hasActiveFilters && (
                        <button
                            type="button"
                            onClick={handleResetFilters}
                            data-testid="location-category-reset-filters"
                            className="flex h-[58px] shrink-0 items-center gap-2 rounded-2xl border border-slate-200 px-5 font-black text-slate-600 transition-all hover:bg-slate-50"
                        >
                            <RotateCcw size={18} />
                            <span>{t('categories.reset_filters')}</span>
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={handleReorderToggle}
                        disabled={searchInput !== '' || statusFilter !== undefined}
                        className={cn(
                            'flex h-[58px] shrink-0 items-center gap-3 rounded-2xl border px-6 font-black transition-all disabled:opacity-50 disabled:grayscale',
                            isReorderMode
                                ? 'border-[#d9f99d] bg-[#f4fce3] text-[#0f766e] ring-4 ring-[#14b8a6]/10'
                                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 active:scale-95',
                        )}
                        title={searchInput !== '' || statusFilter !== undefined ? t('categories.reorder.disabled_title') : undefined}
                    >
                        <RefreshCcw size={20} className={cn(isReorderMode && 'animate-spin-slow')} />
                        <span>{isReorderMode ? t('categories.reorder.button_sorting') : t('categories.reorder.button_sort')}</span>
                    </button>
                </div>

                <div className="flex shrink-0 items-center gap-3 rounded-3xl border border-slate-100/50 bg-slate-50/50 px-6 py-4">
                    <span className="text-[13px] font-black uppercase tracking-widest text-slate-500">{t('categories.reorder.results_label')}</span>
                    <span className="flex h-8 min-w-[32px] items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-black text-slate-900 shadow-sm">
                        {data?.meta?.total ?? categories.length}
                    </span>
                </div>
            </div>

            <CategoryGrid
                categories={displayCategories}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
                onStatusChange={handleStatusChange}
                onAdd={handleAdd}
                hasActiveFilters={hasActiveFilters}
                statusUpdatingId={statusUpdatingId}
                isReorderMode={isReorderMode}
                onReorderChange={handleReorderChange}
            />

            <AnimatePresence>
                {isReorderMode && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-8 left-1/2 z-50 flex -translate-x-1/2 items-center gap-8 rounded-[32px] border border-slate-800 bg-slate-900 px-8 py-5 text-white shadow-2xl"
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 animate-bounce items-center justify-center rounded-xl bg-[#14b8a6]">
                                <RefreshCcw size={20} />
                            </div>
                            <div>
                                <p className="text-sm font-black tracking-tight">{t('categories.reorder.bar_title')}</p>
                                <p className="text-[11px] font-medium text-slate-400">{t('categories.reorder.bar_hint')}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={handleReorderCancel}
                                className="rounded-xl px-6 py-3 font-black text-slate-400 transition-all hover:bg-white/10 hover:text-white"
                            >
                                {t('categories.reorder.cancel')}
                            </button>
                            <button
                                type="button"
                                onClick={handleReorderSave}
                                disabled={reorderMutation.isPending}
                                className="flex items-center gap-2 rounded-xl bg-[#14b8a6] px-8 py-3 font-black text-white shadow-lg shadow-[#14b8a6]/20 transition-all hover:bg-[#0f766e]"
                            >
                                {reorderMutation.isPending ? (
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                ) : (
                                    <CheckCircle2 size={18} />
                                )}
                                <span>{t('categories.reorder.save')}</span>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <CategoryFormModal
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                initialData={editingCategory}
                onSubmit={handleFormSubmit}
                isSubmitting={createMutation.isPending || updateMutation.isPending}
            />

            <CategoryDeleteDialog
                isOpen={!!deletingCategory}
                categoryName={deletingCategory?.name || ''}
                onClose={() => setDeletingCategory(null)}
                onConfirm={handleConfirmDelete}
                isDeleting={deleteMutation.isPending}
            />
        </div>
    );
};

export default LocationCategories;
