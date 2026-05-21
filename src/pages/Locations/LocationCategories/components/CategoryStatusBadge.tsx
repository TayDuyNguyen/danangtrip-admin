import { useTranslation } from 'react-i18next';
import { twMerge } from 'tailwind-merge';

interface Props {
    status: 'active' | 'inactive';
    className?: string;
}

const CategoryStatusBadge = ({ status, className }: Props) => {
    const { t } = useTranslation('location');

    const styles: Record<'active' | 'inactive', string> = {
        active: 'bg-[#D1FAE5] text-[#10B981] border-[rgba(16,185,129,0.2)]',
        inactive: 'bg-[#FEE2E2] text-[#EF4444] border-[rgba(239,68,68,0.2)]',
    };

    return (
        <span className={twMerge(
            'inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase border leading-none font-sans whitespace-nowrap',
            styles[status],
            className
        )}>
            {t(`status.${status}`)}
        </span>
    );
};

export default CategoryStatusBadge;
