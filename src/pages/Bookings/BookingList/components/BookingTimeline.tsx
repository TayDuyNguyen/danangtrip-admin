import { useTranslation } from 'react-i18next';
import BookingCard from './BookingCard';
import type { BookingItem } from '@/dataHelper/booking.dataHelper';
import { ShoppingCart } from 'lucide-react';

interface Props {
    data: BookingItem[];
    isLoading?: boolean;
    onView: (booking: BookingItem) => void;
    onConfirm: (id: number) => void;
    onCancel: (booking: BookingItem) => void;
}

const BookingTimeline = ({ data, isLoading, onView, onConfirm, onCancel }: Props) => {
    const { t } = useTranslation('booking');

    if (isLoading) {
        return (
            <div className="relative pl-12 space-y-6">
                <div className="absolute left-[24px] top-0 bottom-0 w-[2px] bg-slate-100" />
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white border border-slate-100 rounded-3xl p-6 h-48 animate-pulse" />
                ))}
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
        </div>
    );
};

export default BookingTimeline;
