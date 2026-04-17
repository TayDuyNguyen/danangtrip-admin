import React, { useState } from 'react';
import { StandardPagination, DetailedPagination, MinimalPagination } from './src/components/pagination';

const PaginationShowcase = () => {
    const [page1, setPage1] = useState(1);
    const [page2, setPage2] = useState(1);
    const [page3, setPage3] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    return (
        <div className="p-12 space-y-20 bg-slate-50 min-h-screen">
            <section className="space-y-6">
                <h2 className="text-2xl font-black text-slate-900 tracking-tighter">1. Standard Pagination</h2>
                <div className="p-8 bg-white rounded-[2.5rem] border border-slate-200/60 shadow-sm">
                    <StandardPagination 
                        currentPage={page1} 
                        totalPages={15} 
                        onPageChange={setPage1} 
                    />
                </div>
            </section>

            <section className="space-y-6">
                <h2 className="text-2xl font-black text-slate-900 tracking-tighter">2. Detailed Pagination</h2>
                <div className="p-8 bg-white rounded-[2.5rem] border border-slate-200/60 shadow-sm">
                    <DetailedPagination 
                        currentPage={page2} 
                        totalPages={10} 
                        pageSize={pageSize}
                        totalItems={100}
                        onPageChange={setPage2}
                        onPageSizeChange={setPageSize}
                    />
                </div>
            </section>

            <section className="space-y-6">
                <h2 className="text-2xl font-black text-slate-900 tracking-tighter">3. Minimal Pagination (Mobile/Sidebar)</h2>
                <div className="p-8 bg-white rounded-[2.5rem] border border-slate-200/60 shadow-sm max-w-sm mx-auto">
                    <MinimalPagination 
                        currentPage={page3} 
                        totalPages={5} 
                        onPageChange={setPage3} 
                    />
                </div>
            </section>
        </div>
    );
};

export default PaginationShowcase;
