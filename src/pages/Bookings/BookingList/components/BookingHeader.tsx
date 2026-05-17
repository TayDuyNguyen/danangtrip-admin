import { useTranslation } from 'react-i18next';
import { Download } from 'lucide-react';
import { ROUTES } from '@/routes/routes';
import { NavLink } from 'react-router-dom';

interface Props {
    onExport: () => void;
    isExporting?: boolean;
}

const BookingHeader = ({ onExport, isExporting }: Props) => {
    const { t } = useTranslation('booking');

    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-24">
            <div>
                <nav className="flex items-center gap-2 mb-2 text-[12px] font-medium text-text-secondary">
                    <NavLink to={ROUTES.DASHBOARD} className="hover:text-[#14b8a6] transition-colors">
                        {t('common:breadcrumb.home')}
                    </NavLink>
                    <span className="text-slate-300">/</span>
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                        {t('breadcrumb.group')}
                    </span>
                    <span className="text-slate-300">/</span>
                    <span className="text-[#14b8a6] font-bold">
                        {t('breadcrumb.current')}
                    </span>
                </nav>
                <h2 className="text-[24px] font-black text-slate-900 leading-tight tracking-tight">
                    {t('page.title')}
                </h2>
                <p className="text-[14px] text-slate-500 font-medium mt-1">
                    {t('page.subtitle')}
                </p>
            </div>

            <button
                onClick={onExport}
                disabled={isExporting}
                className="flex items-center gap-2.5 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-slate-600 font-bold text-[14px] hover:border-[#14b8a6] hover:text-[#14b8a6] transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:active:scale-100"
            >
                <Download size={18} className={isExporting ? 'animate-bounce' : ''} />
                {isExporting ? t('common:actions.exporting') : t('common:actions.export_excel')}
            </button>
        </div>
    );
};

export default BookingHeader;
