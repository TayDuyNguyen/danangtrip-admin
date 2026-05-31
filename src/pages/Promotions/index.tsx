import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
    usePromotions, 
    useCreatePromotion, 
    useUpdatePromotion, 
    useUpdatePromotionStatus, 
    useDeletePromotion 
} from '@/hooks/usePromotionQueries';
import type { Promotion, PromotionFilters, PromotionFormInput } from '@/types/promotion.types';
import PromotionFilter from './components/PromotionFilter';
import PromotionTable from './components/PromotionTable';
import PromotionFormDrawer from './components/PromotionFormDrawer';
import { Tag, Plus, CheckCircle, Percent, TrendingUp, AlertTriangle } from 'lucide-react';

const PromotionsPage = () => {
    const { t } = useTranslation('promotions');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [rowSelection, setRowSelection] = useState({});

    // Filter states
    const [filters, setFilters] = useState<PromotionFilters>({
        search: '',
        status: '',
        valid_now: false,
        sort_by: 'created_at',
        sort_dir: 'desc',
    });

    // Modal/Drawer states
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editPromotion, setEditPromotion] = useState<Promotion | null>(null);
    const [deleteConfig, setDeleteConfig] = useState<{ id: number; code: string } | null>(null);

    // Queries
    const { data: listData, isLoading } = usePromotions({
        ...filters,
        page,
        per_page: limit,
    });

    // Mutations
    const createMutation = useCreatePromotion();
    const updateMutation = useUpdatePromotion();
    const statusMutation = useUpdatePromotionStatus();
    const deleteMutation = useDeletePromotion();

    const promotions = useMemo(() => listData?.data || [], [listData]);
    const total = listData?.total || 0;

    // Derived stats from visible data or queries
    const stats = useMemo(() => {
        const list = promotions;
        const totalCount = total;
        const activeCount = list.filter(p => p.status === 'active').length;
        const totalUsed = list.reduce((sum, p) => sum + p.used_count, 0);
        
        return {
            totalCount,
            activeCount,
            totalUsed,
        };
    }, [promotions, total]);

    const handleFilterChange = (newFilters: PromotionFilters) => {
        setFilters(newFilters);
        setPage(1);
    };

    const handleLimitChange = (newLimit: number) => {
        setLimit(newLimit);
        setPage(1);
    };

    // Open add form
    const handleAddClick = () => {
        setEditPromotion(null);
        setIsFormOpen(true);
    };

    // Open edit form
    const handleEditClick = (promo: Promotion) => {
        setEditPromotion(promo);
        setIsFormOpen(true);
    };

    // Toggle status
    const handleStatusToggle = (id: number, currentStatus: string) => {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        statusMutation.mutate({ id, status: newStatus });
    };

    // Handle delete confirmation click
    const handleDeleteClick = (id: number, code: string) => {
        setDeleteConfig({ id, code });
    };

    const handleConfirmDelete = () => {
        if (!deleteConfig) return;
        deleteMutation.mutate(deleteConfig.id, {
            onSuccess: () => {
                setDeleteConfig(null);
            }
        });
    };

    // Form submit inside drawer
    const handleFormSubmit = (data: PromotionFormInput) => {
        if (editPromotion) {
            updateMutation.mutate(
                { id: editPromotion.id, data },
                {
                    onSuccess: () => {
                        setIsFormOpen(false);
                        setEditPromotion(null);
                    }
                }
            );
        } else {
            createMutation.mutate(data, {
                onSuccess: () => {
                    setIsFormOpen(false);
                }
            });
        }
    };

    return (
        <div className="p-4 lg:p-10 mx-auto min-h-screen bg-white font-sans text-slate-800">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <Tag className="text-[#14b8a6]" size={32} />
                        {t('title')}
                    </h1>
                    <p className="text-slate-400 text-sm font-medium mt-1">
                        {t('subtitle')}
                    </p>
                </div>
                <button
                    onClick={handleAddClick}
                    className="flex items-center justify-center gap-2 bg-[#14b8a6] hover:bg-[#0f766e] text-white font-black px-6 py-3.5 rounded-2xl shadow-xl shadow-[#14b8a6]/20 transition-all hover:scale-105 active:scale-95 text-sm shrink-0"
                >
                    <Plus size={18} />
                    <span>{t('actions.add_new')}</span>
                </button>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                {/* Total codes */}
                <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 flex items-center justify-between group cursor-pointer hover:border-slate-200 transition-colors">
                    <div className="space-y-1.5">
                        <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                            Tổng số mã
                        </p>
                        <p className="text-3xl font-black text-slate-800 tracking-tight">
                            {stats.totalCount}
                        </p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 shrink-0 group-hover:scale-110 transition-transform">
                        <Percent size={22} />
                    </div>
                </div>

                {/* Active codes */}
                <div className="bg-[#f4fce3] border border-[#d9f99d] rounded-3xl p-6 flex items-center justify-between group cursor-pointer hover:bg-[#eafac8] transition-colors">
                    <div className="space-y-1.5">
                        <p className="text-[11px] font-black uppercase tracking-widest text-green-800 opacity-70">
                            Đang hoạt động
                        </p>
                        <p className="text-3xl font-black text-green-800 tracking-tight">
                            {stats.activeCount}
                        </p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-[#d9f99d] flex items-center justify-center text-green-800 shrink-0 group-hover:scale-110 transition-transform">
                        <CheckCircle size={22} />
                    </div>
                </div>

                {/* Total usages */}
                <div className="bg-[#dff7f4] border border-[#ccfbf1] rounded-3xl p-6 flex items-center justify-between group cursor-pointer hover:bg-[#cff5ef] transition-colors">
                    <div className="space-y-1.5">
                        <p className="text-[11px] font-black uppercase tracking-widest text-[#0f766e] opacity-70">
                            Lượt sử dụng thành công
                        </p>
                        <p className="text-3xl font-black text-[#0f766e] tracking-tight">
                            {stats.totalUsed}
                        </p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-[#ccfbf1] flex items-center justify-center text-[#0f766e] shrink-0 group-hover:scale-110 transition-transform">
                        <TrendingUp size={22} />
                    </div>
                </div>
            </div>

            {/* Filters */}
            <PromotionFilter 
                filters={filters}
                onFilterChange={handleFilterChange}
            />

            {/* Table */}
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
                rowSelection={rowSelection}
                onRowSelectionChange={setRowSelection}
            />

            {/* Drawer Form */}
            <PromotionFormDrawer
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                initialData={editPromotion}
                onSubmit={handleFormSubmit}
                isSubmitting={createMutation.isPending || updateMutation.isPending}
            />

            {/* Delete Confirmation Popup */}
            {deleteConfig && (
                <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs transition-opacity duration-300">
                    <div className="w-full max-w-md bg-white border border-[#E2E8F0] rounded-[32px] p-8 shadow-2xl animate-in zoom-in-95 duration-150 relative">
                        <div className="flex items-center gap-4 text-red-500 mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center shrink-0">
                                <AlertTriangle size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-slate-900">Xác nhận xóa</h3>
                                <p className="text-sm font-medium text-slate-400">Hành động này không thể hoàn tác.</p>
                            </div>
                        </div>
                        <p className="text-sm font-bold text-slate-600 mb-6 leading-relaxed">
                            {t('actions.delete_confirm', { code: deleteConfig.code, defaultValue: `Bạn có chắc chắn muốn xóa mã khuyến mãi ${deleteConfig.code}?` })}
                        </p>
                        <div className="flex items-center justify-end gap-3">
                            <button
                                onClick={() => setDeleteConfig(null)}
                                className="rounded-2xl px-6 py-3 font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                disabled={deleteMutation.isPending}
                                className="flex items-center gap-1.5 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-black px-6 py-3 shadow-lg shadow-red-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                            >
                                {deleteMutation.isPending ? (
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                ) : null}
                                <span>Đồng ý xóa</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PromotionsPage;
