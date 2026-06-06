import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Download, Map, Plus } from 'lucide-react';
import { ROUTES } from '@/routes/routes';
import Breadcrumbs from '@/components/common/Breadcrumbs';

interface Props {
    onExport: () => void;
    isExporting?: boolean;
}

const TourHeader = ({ onExport, isExporting }: Props) => {
    const { t } = useTranslation(['tour', 'common']);
    const navigate = useNavigate();

    return (
        <div className="flex flex-col gap-3 mb-[24px]">
            <Breadcrumbs
                icon={Map}
                items={[
                    { label: 'sidebar.tours', path: '/admin/tours/list' },
                    { label: 'sidebar.tour_list' }
                ]}
            />

            {/* Title row */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none font-sans">
                        {t('title.list')}
                    </h1>
                    <p className="text-[14px] font-medium text-[#64748B] font-sans mt-1.5">
                        {t('title.subtitle')}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={onExport}
                        disabled={isExporting}
                        className="px-5 py-3 bg-white hover:bg-slate-50 border border-slate-200 text-[#64748B] hover:text-slate-900 rounded-2xl transition-all duration-300 font-bold text-sm flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50 h-11 shrink-0"
                    >
                        <Download size={16} className={isExporting ? 'animate-bounce' : ''} />
                        {t('title.export')}
                    </button>
                    <button
                        onClick={() => navigate(ROUTES.TOURS_CREATE)}
                        className="px-5 py-3 bg-[#14b8a6] hover:bg-[#0f766e] text-white rounded-2xl transition-all duration-300 font-bold text-sm flex items-center gap-2 cursor-pointer shadow-md shadow-[#14b8a6]/20 h-11 shrink-0"
                    >
                        <Plus size={16} />
                        {t('common:breadcrumb.add')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TourHeader;
