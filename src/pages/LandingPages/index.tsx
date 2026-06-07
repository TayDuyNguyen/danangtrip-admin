import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Globe } from 'lucide-react';
import SectionHeader from '@/components/common/SectionHeader';
import { Button } from '@/components/ui/Button';
import LandingPageFilter from './components/LandingPageFilter';
import LandingPageTable from './components/LandingPageTable';
import LandingPageFormDrawer from './components/LandingPageFormDrawer';
import { useDebounce } from '@/hooks/useDebounce';
import {
    useLandingPages,
    useCreateLandingPage,
    useUpdateLandingPage,
    useUpdateLandingPageStatus,
    useDeleteLandingPage
} from '@/hooks/useLandingPageQueries';
import type { LandingPage, LandingPageType, LandingPageStatus, CreateLandingPageInput } from '@/types/landingPage.types';

const LandingPages = () => {
    const { t } = useTranslation('landing_pages');

    // Filter & Pagination States
    const [search, setSearch] = useState('');
    const [pageType, setPageType] = useState<LandingPageType | ''>('');
    const [status, setStatus] = useState<LandingPageStatus | ''>('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);

    // Debounce search value to avoid redundant api queries
    const debouncedSearch = useDebounce(search, 400);

    // Drawer State
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedLanding, setSelectedLanding] = useState<LandingPage | null>(null);

    // React Query List Fetching
    const { data, isLoading } = useLandingPages({
        search: debouncedSearch,
        page_type: pageType,
        status,
        per_page: limit,
        page
    });

    // Mutations
    const createMutation = useCreateLandingPage();
    const updateMutation = useUpdateLandingPage();
    const updateStatusMutation = useUpdateLandingPageStatus();
    const deleteMutation = useDeleteLandingPage();

    const handleSearchChange = (value: string) => {
        setSearch(value);
        setPage(1);
    };

    const handlePageTypeChange = (value: LandingPageType | '') => {
        setPageType(value);
        setPage(1);
    };

    const handleStatusChange = (value: LandingPageStatus | '') => {
        setStatus(value);
        setPage(1);
    };

    const handleEdit = (landing: LandingPage) => {
        setSelectedLanding(landing);
        setIsDrawerOpen(true);
    };

    const handleCreate = () => {
        setSelectedLanding(null);
        setIsDrawerOpen(true);
    };

    const handleDelete = (id: number, slug: string) => {
        const confirmDelete = window.confirm(t('delete_confirm', { slug }));
        if (confirmDelete) {
            deleteMutation.mutate(id);
        }
    };

    const handleStatusToggle = (id: number, currentStatus: LandingPageStatus) => {
        const nextStatus: LandingPageStatus = currentStatus === 'published' ? 'draft' : 'published';
        updateStatusMutation.mutate({ id, status: nextStatus });
    };

    const handleFormSubmit = async (payload: CreateLandingPageInput) => {
        if (selectedLanding) {
            await updateMutation.mutateAsync({
                id: selectedLanding.id,
                data: payload
            });
        } else {
            await createMutation.mutateAsync(payload);
        }
        setIsDrawerOpen(false);
    };

    const totalItems = data?.total || 0;
    const landingPagesList = data?.data || [];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <SectionHeader 
                    icon={Globe}
                    title={t('title')} 
                    subtitle={t('subtitle')} 
                />
                
                <Button
                    onClick={handleCreate}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3.5 text-xs font-black uppercase tracking-wider rounded-xl hover:scale-105 active:scale-95 self-start md:self-auto shadow-md shadow-[#14b8a6]/20"
                >
                    <Plus size={16} />
                    {t('add_new')}
                </Button>
            </div>

            {/* Filter Bar */}
            <LandingPageFilter
                search={search}
                onSearchChange={handleSearchChange}
                pageType={pageType}
                onPageTypeChange={handlePageTypeChange}
                status={status}
                onStatusChange={handleStatusChange}
            />

            {/* Data Table */}
            <LandingPageTable
                data={landingPagesList}
                isLoading={isLoading}
                total={totalItems}
                page={page}
                limit={limit}
                onPageChange={setPage}
                onLimitChange={(v) => {
                    setLimit(v);
                    setPage(1);
                }}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onStatusToggle={handleStatusToggle}
            />

            {/* Form Drawer */}
            {isDrawerOpen && (
                <LandingPageFormDrawer
                    isOpen
                    onClose={() => setIsDrawerOpen(false)}
                    selectedLanding={selectedLanding}
                    onSubmit={handleFormSubmit}
                    isSubmitting={createMutation.isPending || updateMutation.isPending}
                />
            )}
        </div>
    );
};

export default LandingPages;
