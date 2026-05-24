import { useTranslation } from 'react-i18next';
import BookingCard from './BookingCard';
import type { BookingItem } from '@/dataHelper/booking.dataHelper';
import { ShoppingCart } from 'lucide-react';
import LoadingReact from '@/components/loading';

interface Props {
    data: BookingItem[];
    isLoading?: boolean;
    isFetching?: boolean;
    onView: (booking: BookingItem) => void;
    onConfirm: (id: number) => void;
    onCancel: (booking: BookingItem) => void;
}

const BookingTimeline = ({ data, isLoading, isFetching, onView, onConfirm, onCancel }: Props) => {
    const { t } = useTranslation('booking');

    if (isLoading) {
        return (
            <div className="bg-white border border-slate-100 rounded-3xl py-20 px-8 flex flex-col items-center justify-center text-center shadow-sm">
                <LoadingReact type="spin" color="#14b8a6" height={42} width={42} />
                <p className="mt-4 text-sm font-black text-[#14b8a6]">
                    {t('loading.list', 'Đang tải danh sách đơn hàng...')}
                </p>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="bg-white border border-slate-100 rounded-3xl py-20 px-8 flex flex-col items-center text-center shadow-sm">
                <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200 mb-6">
                    <ShoppingCart size={40} />
                </div>
                <h3 className="text-[18px] font-black text-slate-900 mb-2">
                    {t('empty.title')}
                </h3>
                <p className="text-[14px] text-slate-400 font-medium max-w-[280px]">
                    {t('empty.subtitle')}
                </p>
            </div>
        );
    }

    return (
        <div className="relative pl-12 space-y-8">
            {/* Vertical Line */}
            <div className="absolute left-[24px] top-0 bottom-0 w-[2px] bg-slate-200" />
            
            {data.map((booking) => (
                <BookingCard
                    key={booking.id}
                    booking={booking}
                    onView={onView}
                    onConfirm={onConfirm}
                    onCancel={onCancel}
                />
            ))}

            {isFetching && (
                <div className="relative z-10 rounded-2xl border border-[#14b8a6]/20 bg-white/95 px-5 py-4 shadow-sm">
                    <div className="flex items-center justify-center gap-2 text-sm font-black text-[#14b8a6]">
                        <LoadingReact type="spin" color="#14b8a6" height={18} width={18} />
                        {t('loading.list', 'Đang tải danh sách đơn hàng...')}
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookingTimeline;
