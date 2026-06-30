import { useState, useMemo } from 'react';
import CategoryHeader from './components/CategoryHeader';
import CategoryGrid from './components/CategoryGrid';
import CategoryDialog from './components/CategoryDialog';
import CategoryDeleteDialog from './components/CategoryDeleteDialog';
import { useTourCategoriesQuery, useTourCategoryMutations } from '@/hooks/useTourCategoryQueries';
import type { TourCategory } from '@/dataHelper/tourCategory.dataHelper';
import LoadingReact from '@/components/loading';
import { LayoutGrid, CheckCircle2, XCircle, Search, AlertCircle, RefreshCcw, Filter, RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import CustomSelect from '@/components/ui/CustomSelect';
import { cn } from '@/utils/cn';
import { motion, AnimatePresence } from 'framer-motion';
import { useDebounce } from '@/hooks/useDebounce';

const normalizeReorderList = (items: TourCategory[]) =>
    items.map((category, index) => ({
        ...category,
        sort_order: index + 1,
    }));

const TourCategories = () => {
    const { t } = useTranslation('tour');
    
    // Search & Filter State
    const [searchInput, setSearchInput] = useState('');
    const debouncedSearch = useDebounce(searchInput, 300);
    const [statusFilter, setStatusFilter] = useState<'active' | 'inactive' | undefined>(undefined);

    // State for Dialogs
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isReorderMode, setIsReorderMode] = useState(false);
    const [reorderList, setReorderList] = useState<TourCategory[]>([]);
    const [editingCategory, setEditingCategory] = useState<TourCategory | null>(null);
    const [deletingCategory, setDeletingCategory] = useState<TourCategory | null>(null);

    // Queries & Mutations
    const { data, isLoading, isError, refetch } = useTourCategoriesQuery({ 
        search: debouncedSearch,
        status: statusFilter,
        all: true,
        with_stats: true 
    });
    const { createMutation, updateMutation, deleteMutation, statusMutation, reorderMutation } = useTourCategoryMutations();

    const categories = data?.items || [];
    const stats = data?.stats || { totalTours: 0, totalCategories: 0, active: 0, inactive: 0 };
    const hasActiveFilters = searchInput.trim() !== '' || statusFilter !== undefined;

    const statusFilterOptions = useMemo(
        () => [
            { value: '', label: t('status.all') },
            { value: 'active', label: t('status.active') },
            { value: 'inactive', label: t('status.inactive') },
        ],
        [t]
    );

    const statusUpdatingId = statusMutation.isPending ? (statusMutation.variables?.id ?? null) : null;

    // Calculate next sort order for new category
    const nextSortOrder = categories.length > 0 
        ? Math.max(...categories.map(c => c.sort_order)) + 1 
        : 1;

    // Update reorderList when categories change
    const displayCategories = isReorderMode ? reorderList : categories;

    const handleAddClick = () => {
        setEditingCategory(null);
        setIsDialogOpen(true);
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
        setReorderList(normalizeReorderList([...categories].sort((a, b) => a.sort_order - b.sort_order)));
        setIsReorderMode(true);
    };

    const handleReorderChange = (items: TourCategory[]) => {
        setReorderList(normalizeReorderList(items));
    };

    const handleReorderSave = () => {
        const normalizedList = normalizeReorderList(reorderList);
        setReorderList(normalizedList);

        const items = normalizedList.map((cat, index) => ({
            id: cat.id,
            sort_order: index + 1 // Normalize to 1..N
        }));

        reorderMutation.mutate(items, {
            onSuccess: async () => {
                await refetch();
                setIsReorderMode(false);
            }
        });
    };

    const handleEditClick = (category: TourCategory) => {
        setEditingCategory(category);
        setIsDialogOpen(true);
    };

    const handleDeleteClick = (category: TourCategory) => {
        setDeletingCategory(category);
    };

    const handleFormSubmit = (formData: { 
        name: string; 
        slug: string; 
        icon: string; 
        description: string; 
        sort_order: number; 
        status: 'active' | 'inactive';
        icon_background: string;
    }) => {
        const apiData = {
            name: formData.name,
            slug: formData.slug,
            icon: formData.icon,
            icon_background: formData.icon_background,
            description: formData.description,
            sort_order: formData.sort_order,
            status: formData.status
        };

        if (editingCategory) {
            updateMutation.mutate({ id: editingCategory.id, data: apiData }, {
                onSuccess: () => setIsDialogOpen(false)
            });
        } else {
            createMutation.mutate(apiData, {
                onSuccess: () => setIsDialogOpen(false)
            });
        }
    };

    const handleConfirmDelete = () => {
        if (deletingCategory) {
            deleteMutation.mutate(deletingCategory.id, {
                onSuccess: () => setDeletingCategory(null)
            });
        }
    };

    const handleResetFilters = () => {
        setSearchInput('');
        setStatusFilter(undefined);
    };

    const handleStatusChange = (id: number, status: string) => {
        statusMutation.mutate({ id, status });
    };

    if (isLoading && categories.length === 0) {
        return <LoadingReact />;
    }

    if (isError) {
        return (
            <div className="w-full py-20 px-4 flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 bg-red-50 rounded-[32px] flex items-center justify-center mb-6 text-red-500 animate-bounce">
                    <AlertCircle size={48} />
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">{t('categories.messages.load_error')}</h2>
                <p className="text-slate-500 font-medium mt-2 max-w-md">
                    {t('categories.messages.load_error_subtitle')}
                </p>
                <button
                    type="button"
                    data-testid="tour-category-retry"
                    onClick={() => refetch()}
                    className="mt-8 px-8 py-3.5 bg-[#14b8a6] text-white rounded-2xl font-black hover:bg-[#0f766e] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[#14b8a6]/20 flex items-center gap-2"
                >
                    <RefreshCcw size={20} />
                    <span>{t('form.actions.retry')}</span>
                </button>
            </div>
        );
    }

    return (
        <div className="w-full py-8 px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <CategoryHeader onAdd={handleAddClick} />
            
            {/* Stats Row */}
            <div className="mb-3">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    {t('categories.stats_scope_note')}
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8" data-testid="tour-category-stats">
                <div className="bg-white p-7 rounded-[32px] border border-slate-200/60 shadow-sm flex items-center gap-5 group hover:shadow-xl hover:shadow-[#14b8a6]/5 transition-all">
                    <div className="w-14 h-14 bg-[#dff7f4] rounded-3xl flex items-center justify-center text-[#14b8a6] group-hover:scale-110 transition-transform">
                        <LayoutGrid size={28} />
                    </div>
                    <div>
                        <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1">{t('categories.stats_total_tours')}</p>
                        <p className="text-3xl font-black text-slate-900">{stats.totalTours}</p>
                    </div>
                </div>
                <div className="bg-white p-7 rounded-[32px] border border-slate-200/60 shadow-sm flex items-center gap-5 group hover:shadow-xl hover:shadow-[#14b8a6]/5 transition-all">
                    <div className="w-14 h-14 bg-blue-100 rounded-3xl flex items-center justify-center text-[#0f766e] group-hover:scale-110 transition-transform">
                        <CheckCircle2 size={28} />
                    </div>
                    <div>
                        <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1">{t('categories.stats_active_categories')}</p>
                        <p className="text-3xl font-black text-slate-900">{stats.active}</p>
                    </div>
                </div>
                <div className="bg-white p-7 rounded-[32px] border border-slate-200/60 shadow-sm flex items-center gap-5 group hover:shadow-xl hover:shadow-slate-500/5 transition-all">
                    <div className="w-14 h-14 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-600 group-hover:scale-110 transition-transform">
                        <XCircle size={28} />
                    </div>
                    <div>
                        <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1">{t('categories.stats_inactive_categories')}</p>
                        <p className="text-3xl font-black text-slate-900">{stats.inactive}</p>
                    </div>
                </div>
            </div>

            {/* Filter Area - Figma Style */}
            <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4 mb-8 bg-white p-4 rounded-[32px] border border-slate-100 shadow-sm">
                <div className="flex flex-col md:flex-row items-center gap-4 flex-1">
                    {/* Search */}
                    <div className="relative flex-1 w-full group">
                        <div className="absolute left-5 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-slate-400 group-focus-within:text-[#14b8a6] transition-colors">
                            <Search size={20} />
                        </div>
                        <input 
                            type="text"
                            data-testid="tour-category-search"
                            placeholder={t('categories.search_placeholder')}
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="w-full pl-14 pr-6 py-4 rounded-3xl bg-slate-50/50 border-none focus:bg-white focus:ring-4 focus:ring-[#14b8a6]/10 outline-hidden transition-all font-bold text-slate-900"
                        />
                    </div>
                    
                    {/* Status Dropdown */}
                    <div className="w-full md:w-auto min-w-[220px]">
                        <CustomSelect
                            options={statusFilterOptions}
                            value={statusFilterOptions.find(opt => opt.value === (statusFilter || ''))}
                            onChange={(opt) => setStatusFilter((opt as { value: 'active' | 'inactive' })?.value || undefined)}
                            placeholder={t('status.all')}
                            leftIcon={<Filter size={16} className="text-slate-400" />}
                        />
                    </div>

                    {hasActiveFilters && (
                        <button
                            type="button"
                            onClick={handleResetFilters}
                            data-testid="tour-category-reset-filters"
                            className="h-[58px] px-5 rounded-2xl flex items-center gap-2 font-black text-slate-600 border border-slate-200 hover:bg-slate-50 transition-all shrink-0"
                        >
                            <RotateCcw size={18} />
                            <span>{t('categories.reset_filters')}</span>
                        </button>
                    )}

                    {/* Reorder Toggle */}
                    <button
                        type="button"
                        onClick={handleReorderToggle}
                        disabled={searchInput !== '' || statusFilter !== undefined}
                        className={cn(
                            "h-[58px] px-6 rounded-2xl flex items-center gap-3 font-black transition-all border shrink-0",
                            isReorderMode 
                                ? "bg-[#f4fce3] border-[#d9f99d] text-[#0f766e] ring-4 ring-[#14b8a6]/10"
                                : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 active:scale-95 disabled:opacity-50 disabled:grayscale"
                        )}
                        title={searchInput !== '' || statusFilter !== undefined ? t('categories.reorder.disabled_title') : undefined}
                    >
                        <RefreshCcw size={20} className={cn(isReorderMode && "animate-spin-slow")} />
                        <span>{isReorderMode ? t('categories.reorder.button_sorting') : t('categories.reorder.button_sort')}</span>
                    </button>
                </div>

                <div className="flex items-center gap-3 px-6 py-4 bg-slate-50/50 rounded-3xl shrink-0 border border-slate-100/50">
                    <span className="text-[13px] font-black text-slate-500 uppercase tracking-widest">{t('categories.reorder.results_label')}</span>
                    <span className="px-3 h-8 flex items-center justify-center bg-white rounded-lg border border-slate-200 text-sm font-black text-slate-900 shadow-sm min-w-[32px]">
                        {data?.meta?.total ?? categories.length}
                    </span>
                </div>
            </div>
            
            <CategoryGrid 
                categories={displayCategories}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
                onStatusChange={handleStatusChange}
                onAdd={handleAddClick}
                hasActiveFilters={hasActiveFilters}
                statusUpdatingId={statusUpdatingId}
                isReorderMode={isReorderMode}
                onReorderChange={handleReorderChange}
            />

            {/* Reorder Floating Bar */}
            <AnimatePresence>
                {isReorderMode && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-8 py-5 rounded-[32px] shadow-2xl flex items-center gap-8 border border-slate-800"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#14b8a6] rounded-xl flex items-center justify-center animate-bounce">
                                <RefreshCcw size={20} />
                            </div>
                            <div>
                                <p className="text-sm font-black tracking-tight">{t('categories.reorder.bar_title')}</p>
                                <p className="text-[11px] text-slate-400 font-medium">{t('categories.reorder.bar_hint')}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={handleReorderCancel}
                                className="px-6 py-3 rounded-xl font-black text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                            >
                                {t('categories.reorder.cancel')}
                            </button>
                            <button
                                onClick={handleReorderSave}
                                disabled={reorderMutation.isPending}
                                className="px-8 py-3 bg-[#14b8a6] text-white rounded-xl font-black hover:bg-[#0f766e] transition-all shadow-lg shadow-[#14b8a6]/20 flex items-center gap-2"
                            >
                                {reorderMutation.isPending ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <CheckCircle2 size={18} />
                                )}
                                <span>{t('categories.reorder.save')}</span>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <CategoryDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                onSubmit={handleFormSubmit}
                initialData={editingCategory}
                nextSortOrder={nextSortOrder}
                isLoading={createMutation.isPending || updateMutation.isPending}
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

export default TourCategories;
