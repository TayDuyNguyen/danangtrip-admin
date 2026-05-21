import { useTranslation } from 'react-i18next';
import { twMerge } from 'tailwind-merge';

interface Props {
    availability: 'open' | 'sold_out';
    className?: string;
}

const BookingAvailabilityBadge = ({ availability, className }: Props) => {
    const { t } = useTranslation('tour');

    const styles: Record<Props['availability'], string> = {
        open: 'bg-[#D1FAE5] text-[#059669] border-[rgba(5,150,105,0.25)]',
        sold_out: 'bg-[#FEF3C7] text-[#D97706] border-[rgba(217,119,6,0.25)]',
    };

    return (
        <span
            className={twMerge(
                'inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase border leading-none font-sans whitespace-nowrap',
                styles[availability],
                className
            )}
        >
            {t(`booking_availability.${availability}`)}
        </span>
    );
};

export default BookingAvailabilityBadge;
