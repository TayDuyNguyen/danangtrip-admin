import { useTranslation } from 'react-i18next';
import { twMerge } from 'tailwind-merge';
import type { BookingStatus } from '@/dataHelper/booking.dataHelper';

interface Props {
    status: BookingStatus;
    className?: string;
}

const BookingStatusBadge = ({ status, className }: Props) => {
    const { t } = useTranslation('booking');

    const styles: Record<BookingStatus, string> = {
        pending: 'bg-[#FEF3C7] text-[#F59E0B] border-[#FDE68A]',
        confirmed: 'bg-[#DBEAFE] text-[#3B82F6] border-[#BFDBFE]',
        completed: 'bg-[#D1FAE5] text-[#10B981] border-[#A7F3D0]',
        cancelled: 'bg-[#FEE2E2] text-[#EF4444] border-[#FECACA]',
    };

    return (
        <span className={twMerge(
            'inline-flex items-center justify-center px-3 py-1 rounded-full text-[10px] font-bold uppercase border leading-none font-sans whitespace-nowrap',
            styles[status] || styles.pending,
            className
        )}>
            {t(`status.${status}`)}
        </span>
    );
};

export default BookingStatusBadge;
