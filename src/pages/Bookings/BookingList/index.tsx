import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { RefreshCw } from 'lucide-react';

import { 
    useAdminBookingsQuery, 
    useAdminBookingStatsQuery, 
    useBookingMutations 
} from '@/hooks/useBookingQueries';
import type { 
    BookingListFilters, 
    BookingItem 
} from '@/dataHelper/booking.dataHelper';
import EmptyState from '@/components/common/EmptyState';

import BookingHeader from './components/BookingHeader';
import BookingStats from './components/BookingStats';
import BookingFilter from './components/BookingFilter';
import BookingTable from './components/BookingTable';
import BookingCancelDialog from './components/BookingCancelDialog';
import BookingConfirmPaymentDialog from './components/BookingConfirmPaymentDialog';

const buildSearchParams = (filters: BookingListFilters) => {
    const newParams = new URLSearchParams();

    if (filters.status && filters.status !== 'all') {
        newParams.set('status', filters.status);
    }
    if (filters.payment_status && filters.payment_status !== 'all') {
        newParams.set('payment_status', filters.payment_status);
    }
    if (filters.user_id) {
        newParams.set('user_id', String(filters.user_id));
    }
    if (filters.tour_schedule_id) {
        newParams.set('tour_schedule_id', String(filters.tour_schedule_id));
    }

    return newParams;
};

const BookingList = () => {
    const { t } = useTranslation(['booking', 'common']);
    const [searchParams, setSearchParams] = useSearchParams();
    const userId = searchParams.get('user_id') || undefined;
    const tourScheduleId = searchParams.get('tour_schedule_id') || undefined;
    const initialStatus = (searchParams.get('status') || 'all') as BookingListFilters['status'];
    const initialPaymentStatus = (searchParams.get('payment_status') || 'all') as BookingListFilters['payment_status'];
    
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [filters, setFilters] = useState<BookingListFilters>({
        search: '',
        status: initialStatus,
        payment_status: initialPaymentStatus,
        user_id: userId,
        tour_schedule_id: tourScheduleId,
        date_from: '',
        date_to: '',
        sort: 'booked_at',
        order: 'desc'
    });

    const [cancelConfig, setCancelConfig] = useState<BookingItem | null>(null);
    const [confirmPaymentConfig, setConfirmPaymentConfig] = useState<BookingItem | null>(null);

    const activeFilters: BookingListFilters = {
        ...filters,
        status: (searchParams.get('status') || filters.status || 'all') as BookingListFilters['status'],
        payment_status: (searchParams.get('payment_status') || filters.payment_status || 'all') as BookingListFilters['payment_status'],
        user_id: userId,
        tour_schedule_id: tourScheduleId,
    };

    const { 
        data: listData, 
        isLoading: isListLoading,
        isFetching: isListFetching,
        isError: isListError,
        refetch: refetchList,
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

    const { 
        updateStatusMutation, 
        confirmPaymentMutation,
        exportMutation 
    } = useBookingMutations();

    const bookings = listData?.data || [];
    const total = listData?.meta.total || 0;

    const handleFilterChange = (newFilters: BookingListFilters) => {
        const resolved: BookingListFilters = {
            ...newFilters,
            user_id: newFilters.user_id !== undefined ? newFilters.user_id : userId,
            tour_schedule_id: newFilters.tour_schedule_id !== undefined ? newFilters.tour_schedule_id : tourScheduleId,
        };

        setSearchParams(buildSearchParams(resolved));
        setFilters(resolved);
        setPage(1);
    };

    const handleConfirmBooking = (id: number) => {
        updateStatusMutation.mutate(
            { id, status: 'confirmed' },
            {
                onSuccess: () => toast.success(t('booking:messages.confirm_success')),
                onError: () => toast.error(t('booking:messages.update_error'))
            }
        );
    };

    const handleConfirmPaymentClick = (booking: BookingItem) => {
        setConfirmPaymentConfig(booking);
    };

    const handleConfirmPaymentSubmit = () => {
        if (!confirmPaymentConfig) return;

        confirmPaymentMutation.mutate(confirmPaymentConfig.id, {
            onSuccess: () => {
                toast.success(t('booking:messages.confirm_payment_success', { defaultValue: 'Đã xác nhận thanh toán thành công' }));
                setConfirmPaymentConfig(null);
            },
            onError: () => {
                toast.error(t('booking:messages.update_error'));
                setConfirmPaymentConfig(null);
            }
        });
    };

    const handleCancelClick = (booking: BookingItem) => {
        setCancelConfig(booking);
    };

    const handleConfirmCancel = (reason: string) => {
        if (!cancelConfig) return;

        updateStatusMutation.mutate(
            { id: cancelConfig.id, status: 'cancelled', reason },
            {
                onSuccess: () => {
                    toast.success(t('booking:messages.cancel_success'));
                    setCancelConfig(null);
                },
                onError: () => toast.error(t('booking:messages.update_error'))
            }
        );
    };

    const handleExport = () => {
        exportMutation.mutate(
            { ...activeFilters, fallbackFilename: `bookings_export_${new Date().getTime()}.xlsx` },
            {
                onSuccess: () => toast.success(t('booking:messages.export_success')),
                onError: () => toast.error(t('booking:messages.export_error'))
            }
        );
    };

    return (
        <main className="p-1 sm:p-2 max-w-[1600px] mx-auto flex flex-col gap-6 font-sans">
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

            {isListError ? (
                <div className="bg-white border border-[#E2E8F0] rounded-2xl p-10 flex flex-col items-center text-center">
                    <EmptyState
                        title={t('booking:messages.list_load_error')}
                        description={t('booking:messages.list_load_error_desc')}
                    />
                    <button
                        type="button"
                        onClick={() => void refetchList()}
                        className="mt-2 px-6 py-2.5 bg-[#14b8a6] text-white rounded-xl text-[13px] font-bold hover:bg-[#0f766e] transition-colors inline-flex items-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4" />
                        {t('common:actions.retry', 'Thử lại')}
                    </button>
                </div>
            ) : (
                <BookingTable 
                    data={bookings}
                    isLoading={isListLoading && !listData}
                    isRefreshing={isListFetching && !isListLoading}
                    total={total}
                    page={page}
                    limit={limit}
                    onPageChange={setPage}
                    onLimitChange={setLimit}
                    onRefresh={refetchList}
                    onConfirm={handleConfirmBooking}
                    onConfirmPayment={handleConfirmPaymentClick}
                    onCancel={handleCancelClick}
                    sorting={{ sortBy: filters.sort || 'booked_at', sortOrder: filters.order || 'desc' }}
                    onSort={(field) => {
                        const order = filters.sort === field && filters.order === 'desc' ? 'asc' : 'desc';
                        handleFilterChange({ ...filters, sort: field, order });
                    }}
                />
            )}

            <BookingConfirmPaymentDialog
                isOpen={!!confirmPaymentConfig}
                onClose={() => setConfirmPaymentConfig(null)}
                onConfirm={handleConfirmPaymentSubmit}
                bookingCode={confirmPaymentConfig?.code || ''}
                customerName={confirmPaymentConfig?.customer.name || ''}
                isSubmitting={confirmPaymentMutation.isPending}
            />

            <BookingCancelDialog
                isOpen={!!cancelConfig}
                onClose={() => setCancelConfig(null)}
                onConfirm={handleConfirmCancel}
                bookingCode={cancelConfig?.code || ''}
                bookingId={cancelConfig?.id || ''}
                customerName={cancelConfig?.customer.name || ''}
                isSubmitting={updateStatusMutation.isPending}
            />
        </main>
    );
};

export default BookingList;
