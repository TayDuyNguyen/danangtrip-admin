import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface MinimalPaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const MinimalPagination = ({ 
    currentPage, 
    totalPages, 
    onPageChange 
}: MinimalPaginationProps) => {
    const { t } = useTranslation('common');

    return (
        <div className="flex items-center justify-between gap-4 py-4 w-full">
            {/* Previous Button */}
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-700 font-bold text-sm bg-white hover:bg-[#dff7f4] hover:text-[#14b8a6] hover:border-[#ccfbf1] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 shadow-sm active:scale-95"
            >
                <ChevronLeft size={18} />
                <span className="hidden sm:inline tracking-tight">{t('pagination.previous')}</span>
            </button>

            {/* Page Info */}
            <div className="flex flex-col items-center justify-center gap-0.5 px-6">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none">
                    {t('pagination.page')}
                </span>
                <div className="flex items-center gap-1.5 pt-1">
                    <span className="text-lg font-black text-[#14b8a6]">
                        {currentPage}
                    </span>
                    <span className="text-sm font-bold text-slate-300">
                        /
                    </span>
                    <span className="text-sm font-bold text-slate-500">
                        {totalPages}
                    </span>
                </div>
            </div>

            {/* Next Button */}
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-700 font-bold text-sm bg-white hover:bg-[#dff7f4] hover:text-[#14b8a6] hover:border-[#ccfbf1] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 shadow-sm active:scale-95"
            >
                <span className="hidden sm:inline tracking-tight">{t('pagination.next')}</span>
                <ChevronRight size={18} />
            </button>
        </div>
    );
};

export default MinimalPagination;
