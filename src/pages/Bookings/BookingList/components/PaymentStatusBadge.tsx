import { useTranslation } from 'react-i18next';
import { twMerge } from 'tailwind-merge';
import type { PaymentStatus } from '@/dataHelper/booking.dataHelper';

interface Props {
    status: PaymentStatus;
    className?: string;
}

const PaymentStatusBadge = ({ status, className }: Props) => {
    const { t } = useTranslation('booking');

    const styles: Record<PaymentStatus, string> = {
        pending: 'bg-[#FEF3C7] text-[#F59E0B] border-[#FDE68A]',
        paid: 'bg-[#D1FAE5] text-[#10B981] border-[#A7F3D0]',
        refunded: 'bg-[#EEF2FF] text-[#6366F1] border-[#E0E7FF]',
    };

    return (
        <span className={twMerge(
            'inline-flex items-center justify-center px-3 py-1 rounded-full text-[10px] font-bold uppercase border leading-none font-sans whitespace-nowrap',
            styles[status] || styles.pending,
            className
        )}>
            {t(`payment_status.${status}`)}
        </span>
    );
};

export default PaymentStatusBadge;
