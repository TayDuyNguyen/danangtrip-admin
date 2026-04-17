import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export interface DetailedPaginationProps {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalItems: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
    pageSizeOptions?: number[];
}

const DetailedPagination = ({
    currentPage,
    totalPages,
    pageSize,
    totalItems,
    onPageChange,
    onPageSizeChange,
    pageSizeOptions = [10, 20, 50, 100]
}: DetailedPaginationProps) => {
    const { t } = useTranslation('common');
    const [jumpToPage, setJumpToPage] = useState<string>('');

    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalItems);

    const handleJumpToPage = (e: React.FormEvent) => {
        e.preventDefault();
        const page = parseInt(jumpToPage);
        if (page >= 1 && page <= totalPages) {
            onPageChange(page);
            setJumpToPage('');
        }
    };

    return (
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 py-6 border-t border-slate-100 mt-4">
            {/* Left: Summary and Page Size */}
            <div className="flex flex-col sm:flex-row items-center gap-6 w-full lg:w-auto">
                <p className="text-sm font-bold text-slate-500 whitespace-nowrap">
                    {t('pagination.showing')} <span className="text-blue-600">{startItem}</span> {t('pagination.to')} <span className="text-blue-600">{endItem}</span> {t('pagination.of')} <span className="text-slate-900">{totalItems}</span> {t('pagination.results')}
                </p>

                <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-slate-500 whitespace-nowrap">
                        {t('pagination.items_per_page')}:
                    </span>
                    <label htmlFor="pageSizeSelect" className="sr-only">{t('pagination.items_per_page')}</label>
                    <select
                        id="pageSizeSelect"
                        value={pageSize}
                        onChange={(e) => onPageSizeChange(Number(e.target.value))}
                        className="bg-slate-50 border border-slate-200 text-slate-700 text-sm font-bold rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-2 outline-none transition-all duration-300"
                    >
                        {pageSizeOptions.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Center: Numeric Navigation */}
            <div className="flex items-center gap-1.5 flex-wrap justify-center">
                <button
                    onClick={() => onPageChange(1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-xl border border-transparent text-slate-400 hover:bg-slate-50 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    title={t('pagination.first_page')}
                >
                    <ChevronsLeft size={18} />
                </button>

                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-blue-500 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 shadow-sm active:scale-95 mx-1"
                >
                    <ChevronLeft size={16} />
                    <span className="hidden sm:inline text-sm font-bold tracking-tight">
                        {t('pagination.previous')}
                    </span>
                </button>

                <div className="flex items-center gap-1">
                    {/* Simplified range showing only around current page */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) pageNum = i + 1;
                        else if (currentPage <= 3) pageNum = i + 1;
                        else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                        else pageNum = currentPage - 2 + i;

                        return (
                            <button
                                key={pageNum}
                                onClick={() => onPageChange(pageNum)}
                                className={`w-9 h-9 rounded-xl font-bold text-sm transition-all duration-300 ${
                                    currentPage === pageNum
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 ring-2 ring-blue-600/20'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-blue-600'
                                }`}
                            >
                                {pageNum}
                            </button>
                        );
                    })}
                </div>

                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-blue-500 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 shadow-sm active:scale-95 mx-1"
                >
                    <span className="hidden sm:inline text-sm font-bold tracking-tight">
                        {t('pagination.next')}
                    </span>
                    <ChevronRight size={16} />
                </button>

                <button
                    onClick={() => onPageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-xl border border-transparent text-slate-400 hover:bg-slate-50 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    title={t('pagination.last_page')}
                >
                    <ChevronsRight size={18} />
                </button>
            </div>

            {/* Right: Quick Jump */}
            <form onSubmit={handleJumpToPage} className="flex items-center gap-2 w-full lg:w-auto justify-end">
                <span className="text-sm font-bold text-slate-500 whitespace-nowrap">
                    {t('pagination.go_to')}:
                </span>
                <label htmlFor="jumpToPageInput" className="sr-only">{t('pagination.go_to')}</label>
                <input
                    id="jumpToPageInput"
                    type="number"
                    min="1"
                    max={totalPages}
                    value={jumpToPage}
                    onChange={(e) => setJumpToPage(e.target.value)}
                    className="w-16 p-2 bg-white border border-slate-200 rounded-xl text-center text-sm font-bold text-slate-700 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
                <button
                    type="submit"
                    className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white font-bold text-xs uppercase tracking-wider transition-all duration-300"
                >
                    OK
                </button>
            </form>
        </div>
    );
};

export default DetailedPagination;
