import { ShoppingCart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/routes/routes';
import { Skeleton } from '@/components/ui/Skeleton';
import EmptyState from '@/components/common/EmptyState';
import ErrorWidget from '@/components/common/ErrorWidget';
import { formatCurrency } from '@/utils/pricing';
import { formatAdminShortDate } from '@/utils/dateDisplay';

interface BookingItem {
    id: number;
    booking_code: string;
    final_amount: number | string;
    booking_status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    created_at: string;
    tour_schedule?: {
        tour?: {
            name: string;
        };
    };
}

interface UserBookingsTableProps {
    bookings: BookingItem[];
    totalCount: number;
    isLoading: boolean;
    isError?: boolean;
    onRetry?: () => void;
    userId: number | string;
}

export const UserBookingsTable = ({
    bookings,
    totalCount,
    isLoading,
    isError = false,
    onRetry,
    userId,
}: UserBookingsTableProps) => {
    const { t, i18n } = useTranslation('user');

    const statusBadgeColors = {
        completed: "bg-emerald-50 border-emerald-200 text-emerald-700",
        confirmed: "bg-blue-50 border-blue-200 text-blue-700",
        pending: "bg-amber-50 border-amber-200 text-amber-700",
        cancelled: "bg-rose-50 border-rose-200 text-rose-700",
    };

    if (isLoading) {
        return (
            <div className="p-[1px] rounded-3xl bg-gradient-to-br from-[#14b8a6]/15 via-slate-200/20 to-transparent shadow-sm">
                <div className="bg-white rounded-[23px] overflow-hidden">
                    <div className="px-6 py-5 border-b border-[#F1F5F9] flex items-center justify-between">
                        <Skeleton className="w-48 h-6 rounded-md" />
                        <Skeleton className="w-16 h-6 rounded-full" />
                    </div>
                    <div className="p-4 space-y-3">
                        <Skeleton className="w-full h-10 rounded-lg" />
                        <Skeleton className="w-full h-10 rounded-lg" />
                        <Skeleton className="w-full h-10 rounded-lg" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        // ─── Gradient border shell ───
        <div className="p-[1px] rounded-3xl bg-gradient-to-br from-amber-300/20 via-slate-200/20 to-slate-100/10 shadow-sm hover:shadow-lg hover:from-amber-300/30 transition-all duration-300">
            <div className="bg-white rounded-[23px] overflow-hidden">
                {/* Card Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-5 border-b border-[#F1F5F9]">
                    <h3 className="text-[16px] font-black text-[#0F172A] flex items-center gap-2">
                        {/* Amber icon — semantic color for bookings/orders */}
                        <span className="p-1.5 bg-amber-50 text-amber-500 rounded-lg">
                            <ShoppingCart size={18} />
                        </span>
                        {t('detail.section_bookings', 'Lịch sử đặt tour')}
                    </h3>
                    <div className="flex items-center gap-3">
                        {!isError && (
                            <>
                                <span className="bg-[#14b8a6]/10 text-[#14b8a6] text-xs font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-[#14b8a6]/20">
                                    {totalCount} {t('detail.orders_count', 'đơn')}
                                </span>
                                {totalCount > 0 && (
                                    <Link
                                        to={`${ROUTES.BOOKINGS_LIST}?user_id=${userId}`}
                                        className="text-xs font-black text-[#14b8a6] hover:underline transition-all"
                                    >
                                        {t('detail.view_all_bookings', 'Xem tất cả →')}
                                    </Link>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Content / Table */}
                {isError ? (
                    <div className="p-6">
                        <ErrorWidget
                            title={t('detail.bookings_load_error', 'Không tải được lịch sử đặt tour')}
                            message={t('detail.bookings_load_error_desc', 'Dữ liệu đơn đặt tour tạm thời không khả dụng. Vui lòng thử lại.')}
                            onRetry={onRetry}
                        />
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="p-8 flex flex-col items-center justify-center text-center">
                        <EmptyState
                            title={t('detail.no_bookings', 'Chưa có đơn đặt tour nào')}
                            description={t('detail.no_bookings_desc', 'Người dùng này chưa thực hiện bất kỳ giao dịch đặt tour nào.')}
                        />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[600px] text-xs font-medium font-sans">
                            <thead>
                                <tr className="bg-[#F8FAFC] border-b border-[#F1F5F9] select-none">
                                    <th className="px-6 py-3 font-black text-[#94A3B8] uppercase tracking-wider w-32">{t('detail.booking_col_code', 'Mã đơn')}</th>
                                    <th className="px-6 py-3 font-black text-[#94A3B8] uppercase tracking-wider">{t('detail.booking_col_tour', 'Tour')}</th>
                                    <th className="px-6 py-3 font-black text-[#94A3B8] uppercase tracking-wider w-36">{t('detail.booking_col_date', 'Ngày đặt')}</th>
                                    <th className="px-6 py-3 font-black text-[#94A3B8] uppercase tracking-wider w-28">{t('detail.booking_col_amount', 'Tổng tiền')}</th>
                                    <th className="px-6 py-3 font-black text-[#94A3B8] uppercase tracking-wider w-32">{t('detail.booking_col_status', 'Trạng thái')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#F1F5F9]">
                                {bookings.map((item) => {
                                    const tourName = item.tour_schedule?.tour?.name || '—';
                                    return (
                                        <tr key={item.id} className="hover:bg-[#F8FAFC]/60 transition-all duration-150">
                                            {/* Booking code */}
                                            <td className="px-6 py-3.5">
                                                <Link
                                                    to={ROUTES.BOOKINGS_DETAIL.replace(':id', String(item.id))}
                                                    className="font-bold text-[#14b8a6] hover:underline"
                                                >
                                                    #{item.booking_code}
                                                </Link>
                                            </td>

                                            {/* Tour Name */}
                                            <td className="px-6 py-3.5">
                                                <span className="text-[#0F172A] font-bold line-clamp-1 truncate max-w-xs md:max-w-md" title={tourName}>
                                                    {tourName}
                                                </span>
                                            </td>

                                            {/* Created Date */}
                                            <td className="px-6 py-3.5 text-[#94A3B8]">
                                                {formatAdminShortDate(item.created_at, i18n.language)}
                                            </td>

                                            {/* Total price */}
                                            <td className="px-6 py-3.5 font-bold text-[#0F172A]">
                                                {formatCurrency(item.final_amount)}đ
                                            </td>

                                            {/* Booking status badge */}
                                            <td className="px-6 py-3.5">
                                                <span className={`inline-flex items-center px-2 py-0.5 text-[9px] font-black rounded-full border uppercase tracking-wider ${statusBadgeColors[item.booking_status]}`}>
                                                    {t(`booking_status.${item.booking_status}`, item.booking_status)}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};
