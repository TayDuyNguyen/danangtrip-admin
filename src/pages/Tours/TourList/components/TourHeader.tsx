import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronRight, Download, Plus } from 'lucide-react';
import { ROUTES } from '@/routes/routes';

interface Props {
    onExport: () => void;
    isExporting?: boolean;
}

const TourHeader = ({ onExport, isExporting }: Props) => {
    const { t } = useTranslation(['tour', 'common']);
    const navigate = useNavigate();

    return (
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5 mb-[24px]">
            <div className="space-y-1">
                {/* Breadcrumb — 12px Inter 500 #94A3B8 */}
                <nav className="flex items-center gap-2 text-[12px] font-medium text-[#94A3B8] font-sans uppercase tracking-wider">
                    <span>{t('title.breadcrumb_parent')}</span>
                    <ChevronRight size={12} strokeWidth={3} className="text-[#CBD5E1]" />
                    <span className="text-[#94A3B8]">{t('title.list') as string}</span>
                </nav>
                
                {/* Title — 24px Inter 700 #1E293B letter-spacing -0.3px */}
                <h1 className="text-[24px] font-bold text-[#1E293B] -tracking-[0.3px] leading-tight font-sans">
                    {t('title.list')}
                </h1>
                
                {/* Subtitle — 14px Inter 400 #64748B */}
                <p className="text-[14px] font-medium text-[#64748B] font-sans">
                    {t('title.subtitle')}
                </p>
            </div>

            <div className="flex items-center gap-3">
                {/* Xuất Excel — border #E2E8F0 bg white text #64748B radius-10 px-16 py-10 */}
                <button
                    onClick={onExport}
                    disabled={isExporting}
                    className="flex items-center gap-2 px-[16px] py-[10px] bg-white border border-[#E2E8F0] text-[#64748B] rounded-md text-[14px] font-bold hover:bg-slate-50 hover:border-[#CBD5E1] transition-all disabled:opacity-50 active:scale-95 shadow-sm"
                >
                    <Download size={18} className={isExporting ? 'animate-bounce' : ''} />
                    {t('title.export')}
                </button>
                
                {/* Thêm Tour mới — bg #14B8A6 text white radius-10 px-20 py-10 shadow */}
                <button
                    onClick={() => navigate(ROUTES.TOURS_CREATE)}
                    className="flex items-center gap-2 px-[20px] py-[10px] bg-[#14b8a6] text-white rounded-md text-[14px] font-bold shadow-lg shadow-[#14b8a6]/20 hover:bg-[#0f766e] transition-all active:scale-95"
                >
                    <Plus size={20} strokeWidth={3} />
                    {t('title.add')}
                </button>
            </div>
        </div>
    );
};

export default TourHeader;
