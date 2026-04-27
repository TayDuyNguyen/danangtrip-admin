import { useTranslation } from 'react-i18next';
import { twMerge } from 'tailwind-merge';

interface Props {
    /** Publication status: active | inactive only (sold_out is booking_availability). */
    status: 'active' | 'inactive' | string;
    className?: string;
}

const StatusBadge = ({ status, className }: Props) => {
    const { t } = useTranslation('tour');

    const styles: Record<'active' | 'inactive', string> = {
        active: 'bg-[#D1FAE5] text-[#10B981] border-[rgba(16,185,129,0.2)]',
        inactive: 'bg-[#FEE2E2] text-[#EF4444] border-[rgba(239,68,68,0.2)]',
    };

    const raw = String(status);
    const normalized =
        raw === 'available' || raw === 'sold_out' ? 'active' : raw === 'inactive' ? 'inactive' : 'active';
    const key = normalized === 'inactive' ? 'inactive' : 'active';
    const currentStyle = styles[key];

    return (
        <span className={twMerge(
            'inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase border leading-none font-sans whitespace-nowrap',
            currentStyle,
            className
        )}>
            {t(`status.${key}`, t('status.active'))}
        </span>
    );
};

export default StatusBadge;
