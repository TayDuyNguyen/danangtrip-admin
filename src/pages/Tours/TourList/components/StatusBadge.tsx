import { useTranslation } from 'react-i18next';
import { twMerge } from 'tailwind-merge';

interface Props {
    status: 'active' | 'inactive' | 'sold_out';
    className?: string;
}

const StatusBadge = ({ status, className }: Props) => {
    const { t } = useTranslation('tour');

    const styles: Record<string, string> = {
        active: 'bg-[#D1FAE5] text-[#10B981] border-[rgba(16,185,129,0.2)]',
        inactive: 'bg-[#FEE2E2] text-[#EF4444] border-[rgba(239,68,68,0.2)]',
        sold_out: 'bg-[#FEF3C7] text-[#F59E0B] border-[rgba(245,158,11,0.2)]',
    };

    // Normalize status: map legacy 'available' to 'active'
    const normalizedStatus = (status as string) === 'available' ? 'active' : status;
    const currentStyle = styles[normalizedStatus] || styles.active;

    return (
        <span className={twMerge(
            'inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase border leading-none font-sans whitespace-nowrap',
            currentStyle,
            className
        )}>
            {t(`status.${normalizedStatus}`, t('status.active'))}
        </span>
    );
};

export default StatusBadge;
