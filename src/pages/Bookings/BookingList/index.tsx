import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

import { ROUTES } from '@/routes/routes';
import { 
    useAdminBookingsQuery, 
    useAdminBookingStatsQuery, 
    useBookingMutations 
} from '@/hooks/useBookingQueries';
import type { 
    BookingListFilters, 
    BookingItem 
} from '@/dataHelper/booking.dataHelper';

import BookingHeader from './components/BookingHeader';
import BookingStats from './components/BookingStats';
import BookingFilter from './components/BookingFilter';
import BookingTimeline from './components/BookingTimeline';
import BookingCancelDialog from './components/BookingCancelDialog';
import BookingDetailDialog from './components/BookingDetailDialog';
import Pagination from '@/components/common/Pagination';

const BookingList = () => {
    const { t } = useTranslation('booking');
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const userId = searchParams.get('user_id') || undefined;
    
    // State
    const [page, setPage] = useState(1);
    const limit = 10;
    const [filters, setFilters] = useState<BookingListFilters>({
        search: '',
        status: 'all',
        payment_status: 'all',
        date_from: '',
        date_to: '',
        sort: 'booked_at',
        order: 'desc'
    });

    const [cancelConfig, setCancelConfig] = useState<BookingItem | null>(null);
    const [detailConfig, setDetailConfig] = useState<BookingItem | null>(null);
    const activeFilters: BookingListFilters = {
        ...filters,
        user_id: userId,
    };

    // Queries
    const { 
        data: listData, 
        isLoading: isListLoading,
        isFetching: isListFetching,
    } = useAdminBookingsQuery(activeFilters, page, limit);
    
    const { 
        data: statsData, 
        isLoading: isStatsLoading,
        isFetching: isStatsFetching,
    } = useAdminBookingStatsQuery({
        user_id: activeFilters.user_id,
        search: filters.search,
        date_from: filters.date_from,
        date_to: filters.date_to
    });

    // Mutations
    const { 
        updateStatusMutation, 
        exportMutation 
    } = useBookingMutations();

    const bookings = listData?.data || [];
    const total = listData?.meta.total || 0;

    const handleFilterChange = (newFilters: BookingListFilters) => {
        setFilters({ ...newFilters, user_id: undefined });
        setPage(1);
    };

    const handleConfirmBooking = (id: number) => {
        updateStatusMutation.mutate(
            { id, status: 'confirmed' },
            {
                onSuccess: () => {
                    toast.success(t('messages.confirm_success'));
                    setDetailConfig((current) => current?.id === id ? { ...current, status: 'confirmed' } : current);
                },
                onError: () => toast.error(t('messages.update_error'))
            }
        );
    };

    const handleCancelClick = (booking: BookingItem) => {
        setDetailConfig(null);
        setCancelConfig(booking);
    };

    const handleConfirmCancel = (reason: string) => {
        if (!cancelConfig) return;

        updateStatusMutation.mutate(
            { id: cancelConfig.id, status: 'cancelled', reason },
            {
                onSuccess: () => {
                    toast.success(t('messages.cancel_success'));
                    setDetailConfig((current) => current?.id === cancelConfig.id
                        ? { ...current, status: 'cancelled', cancellationReason: reason }
                        : current);
                    setCancelConfig(null);
                },
                onError: () => toast.error(t('messages.update_error'))
            }
        );
    };

    const handleExport = () => {
        exportMutation.mutate(
            { ...activeFilters, fallbackFilename: `bookings_export_${new Date().getTime()}.xlsx` },
            {
                onSuccess: () => toast.success(t('messages.export_success')),
                onError: () => toast.error(t('messages.export_error'))
            }
        );
    };

    return (
        <div className="p-4 lg:p-10 mx-auto min-h-screen bg-[#F3F2EE] font-sans">
            <BookingHeader 
                onExport={handleExport}
                isExporting={exportMutation.isPending}
            />

            <BookingStats 
                stats={statsData}
                isLoading={isStatsLoading || isStatsFetching}
            />

            <BookingFilter 
                key={JSON.stringify(activeFilters)}
                filters={activeFilters}
                onFilterChange={handleFilterChange}
            />

            <div className="mb-10">
                <BookingTimeline 
                    data={bookings}
                    isLoading={isListLoading && !listData}
                    isFetching={isListFetching}
                    onView={(booking) => navigate(ROUTES.BOOKINGS_DETAIL.replace(':id', booking.id.toString()))}
                    onConfirm={handleConfirmBooking}
                    onCancel={handleCancelClick}
                />
            </div>

            {total > 0 && (
                <div className="mt-8 bg-white border border-[#E2E8F0] rounded-[16px] px-6 py-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-[13px] font-medium text-[#64748B] font-sans">
                        {t('common:pagination.showing_summary', {
                            start: (page - 1) * limit + 1,
                            end: Math.min(page * limit, total),
                            total
                        })}
                    </div>
                    <Pagination
                        currentPage={page}
                        totalItems={total}
                        pageSize={limit}
                        onPageChange={setPage}
                    />
                </div>
            )}

            <BookingDetailDialog
                isOpen={!!detailConfig}
                onClose={() => setDetailConfig(null)}
                booking={detailConfig}
                onConfirm={handleConfirmBooking}
                onCancel={handleCancelClick}
            />

            <BookingCancelDialog
                isOpen={!!cancelConfig}
                onClose={() => setCancelConfig(null)}
                onConfirm={handleConfirmCancel}
                bookingCode={cancelConfig?.code || ''}
                customerName={cancelConfig?.customer.name || ''}
                isSubmitting={updateStatusMutation.isPending}
            />
        </div>
    );
};

export default BookingList;
