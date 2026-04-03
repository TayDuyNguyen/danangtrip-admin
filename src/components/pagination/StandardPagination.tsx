import React from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const StandardPagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange
}) => {
    const { t } = useTranslation('common');

    const generatePageNumbers = () => {
        const pages: (number | string)[] = [];
        const delta = 2; // Number of pages to show around current page

        for (let i = 1; i <= totalPages; i++) {
            if (
                i === 1 ||
                i === totalPages ||
                (i >= currentPage - delta && i <= currentPage + delta)
            ) {
                pages.push(i);
            } else if (
                i === currentPage - delta - 1 ||
                i === currentPage + delta + 1
            ) {
                pages.push('...');
            }
        }

        // Filter out duplicate '...'
        return pages.filter((item, index) => pages.indexOf(item) === index);
    };

    return (
        <div className="flex items-center justify-center gap-2 py-4">
            {/* Previous Button */}
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-blue-500 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 shadow-sm active:scale-95"
            >
                <ChevronLeft size={16} />
                <span className="hidden sm:inline text-sm font-bold tracking-tight">
                    {t('pagination.previous')}
                </span>
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1.5 px-2">
                {generatePageNumbers().map((page, index) => (
                    <React.Fragment key={index}>
                        {page === '...' ? (
                            <span className="w-9 h-9 flex items-center justify-center text-slate-400 font-bold select-none">
                                ...
                            </span>
                        ) : (
                            <button
                                onClick={() => onPageChange(page as number)}
                                className={`w-9 h-9 rounded-xl font-bold text-sm transition-all duration-300 ${currentPage === page
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 ring-2 ring-blue-600/20'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-blue-600 hover:border-blue-200 border border-transparent'
                                    }`}
                            >
                                {page}
                            </button>
                        )}
                    </React.Fragment>
                ))}
            </div>

            {/* Next Button */}
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-blue-500 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 shadow-sm active:scale-95"
            >
                <span className="hidden sm:inline text-sm font-bold tracking-tight">
                    {t('pagination.next')}
                </span>
                <ChevronRight size={16} />
            </button>
        </div>
    );
};

export default StandardPagination;
