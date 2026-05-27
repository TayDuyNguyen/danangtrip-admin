import { useTranslation } from 'react-i18next';
import { Download, ShoppingCart } from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';

interface Props {
    onExport: () => void;
    isExporting?: boolean;
}

const BookingHeader = ({ onExport, isExporting }: Props) => {
    const { t } = useTranslation(['booking', 'common']);

    return (
        <div className="flex flex-col gap-3 mb-[24px]">
            {/* Breadcrumbs */}
            <Breadcrumbs
                icon={ShoppingCart}
                items={[
                    { label: 'sidebar.orders' }
                ]}
            />

            {/* Title row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none">
                        {t('booking:page.title')}
                    </h1>
                    <p className="text-sm font-semibold text-slate-400 mt-1.5">
                        {t('booking:page.subtitle')}
                    </p>
                </div>

                <button
                    onClick={onExport}
                    disabled={isExporting}
                    className="px-5 py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 rounded-2xl transition-all duration-300 font-bold text-sm flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                >
                    <Download size={16} className={isExporting ? 'animate-bounce' : ''} />
                    {isExporting ? t('common:actions.exporting') : t('common:actions.export_excel')}
                </button>
            </div>
        </div>
    );
};

export default BookingHeader;
