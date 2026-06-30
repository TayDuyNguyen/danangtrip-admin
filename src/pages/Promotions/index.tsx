import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
    usePromotions,
    useCreatePromotion,
    useUpdatePromotion,
    useUpdatePromotionStatus,
    useDeletePromotion,
} from '@/hooks/usePromotionQueries';
import type { Promotion, PromotionFilters, PromotionFormInput, PromotionStatus } from '@/types/promotion.types';
import PromotionFilter from './components/PromotionFilter';
import PromotionTable from './components/PromotionTable';
import PromotionFormDrawer from './components/PromotionFormDrawer';
import PromotionDeleteDialog from './components/PromotionDeleteDialog';
import EmptyState from '@/components/common/EmptyState';
import { Tag, Plus, CheckCircle, Percent, TrendingUp, RefreshCw } from 'lucide-react';

const PromotionsPage = () => {
    const { t } = useTranslation('promotions');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [togglingId, setTogglingId] = useState<number | null>(null);

    const [filters, setFilters] = useState<PromotionFilters>({
        search: '',
        status: '',
        valid_now: false,
        sort_by: 'created_at',
        sort_dir: 'desc',
    });

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editPromotion, setEditPromotion] = useState<Promotion | null>(null);
    const [deleteConfig, setDeleteConfig] = useState<{ id: number; code: string } | null>(null);

    const {
        data: listData,
        isLoading,
        isError: isListError,
        refetch,
    } = usePromotions({
        ...filters,
        page,
        per_page: limit,
    });

    const createMutation = useCreatePromotion();
    const updateMutation = useUpdatePromotion();
    const statusMutation = useUpdatePromotionStatus();
    const deleteMutation = useDeletePromotion();

    const promotions = useMemo(() => listData?.data || [], [listData]);
    const total = listData?.total || 0;

    const stats = useMemo(() => {
        const activeOnPage = promotions.filter((p) => p.status === 'active').length;
        const usesOnPage = promotions.reduce((sum, p) => sum + p.used_count, 0);

        return {
            totalCount: total,
            activeOnPage,
            usesOnPage,
        };
    }, [promotions, total]);

    const hasActiveFilters = Boolean(filters.search || filters.status || filters.valid_now);

    const handleFilterChange = (newFilters: PromotionFilters) => {
        setFilters(newFilters);
        setPage(1);
    };

    const handleLimitChange = (newLimit: number) => {
        setLimit(newLimit);
        setPage(1);
    };

    const handleAddClick = () => {
        setEditPromotion(null);
        setIsFormOpen(true);
    };

    const handleEditClick = (promo: Promotion) => {
        setEditPromotion(promo);
        setIsFormOpen(true);
    };

    const handleStatusToggle = (id: number, currentStatus: PromotionStatus) => {
        if (currentStatus === 'expired') return;

        const newStatus: PromotionStatus = currentStatus === 'active' ? 'inactive' : 'active';
        setTogglingId(id);
        statusMutation.mutate(
            { id, status: newStatus },
            { onSettled: () => setTogglingId(null) }
        );
    };

    const handleDeleteClick = (id: number, code: string) => {
        setDeleteConfig({ id, code });
    };

    const handleConfirmDelete = () => {
        if (!deleteConfig) return;
        deleteMutation.mutate(deleteConfig.id, {
            onSuccess: () => {
                setDeleteConfig(null);
            },
        });
    };

    const handleFormSubmit = (data: PromotionFormInput) => {
        if (editPromotion) {
            updateMutation.mutate(
                { id: editPromotion.id, data },
                {
                    onSuccess: () => {
                        setIsFormOpen(false);
                        setEditPromotion(null);
                    },
                }
            );
        } else {
            createMutation.mutate(data, {
                onSuccess: () => {
                    setIsFormOpen(false);
                },
            });
        }
    };

    return (
        <div className="p-4 lg:p-10 mx-auto min-h-screen bg-white font-sans text-slate-800">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <Tag className="text-[#14b8a6]" size={32} />
                        {t('title')}
                    </h1>
                    <p className="text-slate-400 text-sm font-medium mt-1">{t('subtitle')}</p>
                </div>
                <button
                    type="button"
                    onClick={handleAddClick}
                    className="flex items-center justify-center gap-2 bg-[#14b8a6] hover:bg-[#0f766e] text-white font-black px-6 py-3.5 rounded-2xl shadow-xl shadow-[#14b8a6]/20 transition-all hover:scale-105 active:scale-95 text-sm shrink-0"
                >
                    <Plus size={18} />
                    <span>{t('actions.add_new')}</span>
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 flex items-center justify-between group hover:border-slate-200 transition-colors">
                    <div className="space-y-1.5">
                        <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                            {t('stats.total_codes')}
                        </p>
                        <p className="text-3xl font-black text-slate-800 tracking-tight">{stats.totalCount}</p>
                        {hasActiveFilters && (
                            <p className="text-[10px] font-medium text-slate-400">{t('stats.total_codes_hint')}</p>
                        )}
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 shrink-0 group-hover:scale-110 transition-transform">
                        <Percent size={22} />
                    </div>
                </div>

                <div className="bg-[#f4fce3] border border-[#d9f99d] rounded-3xl p-6 flex items-center justify-between group hover:bg-[#eafac8] transition-colors">
                    <div className="space-y-1.5">
                        <p className="text-[11px] font-black uppercase tracking-widest text-green-800 opacity-70">
                            {t('stats.active_on_page')}
                        </p>
                        <p className="text-3xl font-black text-green-800 tracking-tight">{stats.activeOnPage}</p>
                        <p className="text-[10px] font-medium text-green-800/60">{t('stats.page_scope_hint')}</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-[#d9f99d] flex items-center justify-center text-green-800 shrink-0 group-hover:scale-110 transition-transform">
                        <CheckCircle size={22} />
                    </div>
                </div>

                <div className="bg-[#dff7f4] border border-[#ccfbf1] rounded-3xl p-6 flex items-center justify-between group hover:bg-[#cff5ef] transition-colors">
                    <div className="space-y-1.5">
                        <p className="text-[11px] font-black uppercase tracking-widest text-[#0f766e] opacity-70">
                            {t('stats.uses_on_page')}
                        </p>
                        <p className="text-3xl font-black text-[#0f766e] tracking-tight">{stats.usesOnPage}</p>
                        <p className="text-[10px] font-medium text-[#0f766e]/60">{t('stats.page_scope_hint')}</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-[#ccfbf1] flex items-center justify-center text-[#0f766e] shrink-0 group-hover:scale-110 transition-transform">
                        <TrendingUp size={22} />
                    </div>
                </div>
            </div>

            <PromotionFilter filters={filters} onFilterChange={handleFilterChange} />

            {isListError ? (
                <div
                    className="bg-white border border-[#E2E8F0] rounded-2xl p-10 flex flex-col items-center text-center"
                    data-testid="promotion-list-error"
                >
                    <EmptyState
                        title={t('messages.list_load_error')}
                        description={t('messages.list_load_error_desc')}
                    />
                    <button
                        type="button"
                        onClick={() => void refetch()}
                        className="mt-2 px-6 py-2.5 bg-[#14b8a6] text-white rounded-xl text-[13px] font-bold hover:bg-[#0f766e] transition-colors inline-flex items-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4" />
                        {t('actions.retry', { ns: 'common', defaultValue: 'Thử lại' })}
                    </button>
                </div>
            ) : (
                <PromotionTable
                    data={promotions}
                    isLoading={isLoading}
                    total={total}
                    page={page}
                    limit={limit}
                    onPageChange={setPage}
                    onLimitChange={handleLimitChange}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteClick}
                    onStatusToggle={handleStatusToggle}
                    togglingId={togglingId}
                />
            )}

            <PromotionFormDrawer
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                initialData={editPromotion}
                onSubmit={handleFormSubmit}
                isSubmitting={createMutation.isPending || updateMutation.isPending}
            />

            {deleteConfig && (
                <PromotionDeleteDialog
                    code={deleteConfig.code}
                    isDeleting={deleteMutation.isPending}
                    onCancel={() => setDeleteConfig(null)}
                    onConfirm={handleConfirmDelete}
                />
            )}
        </div>
    );
};

export default PromotionsPage;
