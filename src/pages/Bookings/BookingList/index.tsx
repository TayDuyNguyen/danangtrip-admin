import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

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
import BookingTable from './components/BookingTable';
import BookingCancelDialog from './components/BookingCancelDialog';
import BookingDetailDialog from './components/BookingDetailDialog';
import BookingConfirmPaymentDialog from './components/BookingConfirmPaymentDialog';

const BookingList = () => {
    const { t } = useTranslation('booking');
    const [searchParams, setSearchParams] = useSearchParams();
    const userId = searchParams.get('user_id') || undefined;
    const initialStatus = (searchParams.get('status') || 'all') as BookingListFilters['status'];
    const initialPaymentStatus = (searchParams.get('payment_status') || 'all') as BookingListFilters['payment_status'];
    
    // State
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [filters, setFilters] = useState<BookingListFilters>({
        search: '',
        status: initialStatus,
        payment_status: initialPaymentStatus,
        user_id: userId,
        date_from: '',
        date_to: '',
        sort: 'booked_at',
        order: 'desc'
    });

    const [cancelConfig, setCancelConfig] = useState<BookingItem | null>(null);
    const [confirmPaymentConfig, setConfirmPaymentConfig] = useState<BookingItem | null>(null);
    const [detailConfig, setDetailConfig] = useState<BookingItem | null>(null);
    const activeFilters: BookingListFilters = {
        ...filters,
        status: (searchParams.get('status') || filters.status || 'all') as BookingListFilters['status'],
        payment_status: (searchParams.get('payment_status') || filters.payment_status || 'all') as BookingListFilters['payment_status'],
        user_id: userId,
    };

    // Queries
    const { 
        data: listData, 
        isLoading: isListLoading,
        isFetching: isListFetching,
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

    // Mutations
    const { 
        updateStatusMutation, 
        confirmPaymentMutation,
        exportMutation 
    } = useBookingMutations();

    const bookings = listData?.data || [];
    const total = listData?.meta.total || 0;

    const handleFilterChange = (newFilters: BookingListFilters) => {
        const newParams = new URLSearchParams();
        if (newFilters.status && newFilters.status !== 'all') {
            newParams.set('status', newFilters.status);
        }
        if (newFilters.payment_status && newFilters.payment_status !== 'all') {
            newParams.set('payment_status', newFilters.payment_status);
        }
        if (newFilters.user_id) {
            newParams.set('user_id', String(newFilters.user_id));
        }
        setSearchParams(newParams);

        setFilters(newFilters);
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

    const handleConfirmPaymentClick = (booking: BookingItem) => {
        setDetailConfig(null);
        setConfirmPaymentConfig(booking);
    };

    const handleConfirmPaymentSubmit = () => {
        if (!confirmPaymentConfig) return;

        confirmPaymentMutation.mutate(confirmPaymentConfig.id, {
            onSuccess: () => {
                toast.success(t('messages.confirm_payment_success', { defaultValue: 'Đã xác nhận thanh toán thành công' }));
                setDetailConfig((current) => current?.id === confirmPaymentConfig.id 
                    ? { ...current, paymentStatus: 'success', status: current.status === 'pending' ? 'confirmed' : current.status } 
                    : current
                );
                setConfirmPaymentConfig(null);
            },
            onError: () => {
                toast.error(t('messages.update_error'));
                setConfirmPaymentConfig(null);
            }
        });
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

            <BookingDetailDialog
                isOpen={!!detailConfig}
                onClose={() => setDetailConfig(null)}
                booking={detailConfig}
                onConfirm={handleConfirmBooking}
                onConfirmPayment={handleConfirmPaymentClick}
                onCancel={handleCancelClick}
            />

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
                customerName={cancelConfig?.customer.name || ''}
                isSubmitting={updateStatusMutation.isPending}
            />
        </main>
    );
};

export default BookingList;
