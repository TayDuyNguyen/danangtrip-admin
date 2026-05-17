import { ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

interface Props {
    currentPage: number;
    totalItems: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    className?: string;
}

const Pagination = ({ currentPage, totalItems, pageSize, onPageChange, className }: Props) => {
    const totalPages = Math.ceil(totalItems / pageSize);

    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (currentPage > 3) pages.push('...');

            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);

            for (let i = start; i <= end; i++) {
                if (!pages.includes(i)) pages.push(i);
            }

            if (currentPage < totalPages - 2) pages.push('...');
            if (!pages.includes(totalPages)) pages.push(totalPages);
        }
        return pages;
    };

    return (
        <div className={clsx("flex items-center gap-2", className)}>
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:border-[#14b8a6] hover:text-[#14b8a6] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm active:scale-90"
            >
                <ChevronLeft size={18} />
            </button>

            <div className="flex items-center gap-1.5">
                {getPageNumbers().map((p, idx) => (
                    <div key={idx} className="flex items-center">
                        {p === '...' ? (
                            <span className="text-slate-300 font-bold px-1 select-none">...</span>
                        ) : (
                            <button
                                onClick={() => onPageChange(p as number)}
                                className={clsx(
                                    "w-10 h-10 flex items-center justify-center rounded-xl text-[13px] font-black transition-all shadow-sm",
                                    p === currentPage
                                        ? "bg-[#14b8a6] text-white border-[#14b8a6]"
                                        : "bg-white border border-slate-200 text-slate-500 hover:border-[#14b8a6] hover:text-[#14b8a6] active:scale-95"
                                )}
                            >
                                {p}
                            </button>
                        )}
                    </div>
                ))}
            </div>

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:border-[#14b8a6] hover:text-[#14b8a6] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm active:scale-90"
            >
                <ChevronRight size={18} />
            </button>
        </div>
    );
};

export default Pagination;
