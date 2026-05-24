import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { Download, Search, ChevronLeft, ChevronRight, Mail } from "lucide-react";
import { toast } from "sonner";

import ContactStatsRow from "./components/ContactStatsRow";
import ContactListItem from "./components/ContactListItem";
import ContactDetailPanel from "./components/ContactDetailPanel";
import DeleteContactDialog from "./components/DeleteContactDialog";

import { useAdminContactsQuery, useContactDetailQuery, useContactMutations } from "@/hooks/useContactQueries";
import type { ContactListFilters } from "@/dataHelper";

export const Contacts = () => {
    const { t } = useTranslation("contact");
    const [searchParams, setSearchParams] = useSearchParams();

    // 1. URL Sync & State Management
    const page = Number(searchParams.get("page")) || 1;
    const perPage = Number(searchParams.get("per_page")) || 10;
    const q = searchParams.get("q") || "";
    const status = searchParams.get("status") || "";
    const selectedId = searchParams.get("id") || "";

    const [searchInput, setSearchInput] = useState(q);
    const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);

    // Adjust state when URL query param 'q' changes (avoiding useEffect setState)
    const [prevQ, setPrevQ] = useState(q);
    if (q !== prevQ) {
        setPrevQ(q);
        setSearchInput(q);
    }

    const filters: ContactListFilters = {
        q: q || undefined,
        status: status || undefined,
    };

    // 2. URL State Helpers (Declared high to avoid hoisting issues, wrapped in useCallback)
    const updateParams = useCallback((newParams: { q?: string; status?: string; page?: number; per_page?: number; id?: string }) => {
        const params = new URLSearchParams();
        
        const nextQ = newParams.q !== undefined ? newParams.q : q;
        const nextStatus = newParams.status !== undefined ? newParams.status : status;
        const nextPage = newParams.page !== undefined ? newParams.page : page;
        const nextPerPage = newParams.per_page !== undefined ? newParams.per_page : perPage;
        const nextId = newParams.id !== undefined ? newParams.id : selectedId;

        if (nextQ) params.set("q", nextQ);
        if (nextStatus) params.set("status", nextStatus);
        if (nextPage > 1) params.set("page", String(nextPage));
        if (nextPerPage !== 10) params.set("per_page", String(nextPerPage));
        if (nextId) params.set("id", nextId);

        setSearchParams(params);
    }, [q, status, page, perPage, selectedId, setSearchParams]);

    // 3. Search Debounce Flow
    useEffect(() => {
        const handler = setTimeout(() => {
            if (searchInput !== q) {
                updateParams({ q: searchInput, status, page: 1, id: "" });
            }
        }, 300);

        return () => clearTimeout(handler);
    }, [searchInput, q, status, selectedId, updateParams]);

    // 4. Data Queries & Mutations
    const { data: listData, isLoading: isListLoading, isError: isListError } = useAdminContactsQuery(filters, page, perPage);
    const { data: detailData, isLoading: isDetailLoading, isError: isDetailError } = useContactDetailQuery(selectedId);
    const { replyMutation, deleteMutation, exportMutation } = useContactMutations();

    // 5. Actions Handlers
    const handleTabChange = (newStatus: string) => {
        updateParams({ status: newStatus, page: 1 });
    };

    const handleSelectContact = (id: number) => {
        updateParams({ id: String(id) });
    };

    const handleReplySubmit = (formData: { reply: string }) => {
        if (!selectedId) return;

        replyMutation.mutate(
            { id: selectedId, reply: formData.reply },
            {
                onSuccess: () => {
                    toast.success(t("toast.reply_success"));
                },
                onError: () => {
                    toast.error(t("toast.network_error"));
                },
            }
        );
    };

    const handleDeleteConfirm = () => {
        if (!deleteTarget) return;

        deleteMutation.mutate(deleteTarget.id, {
            onSuccess: () => {
                toast.success(t("toast.delete_success"));
                
                // Clear selection if deleted item was active
                const nextId = String(deleteTarget.id) === selectedId ? "" : selectedId;
                updateParams({ id: nextId, page: 1 });
                setDeleteTarget(null);
            },
            onError: () => {
                toast.error(t("toast.network_error"));
                setDeleteTarget(null);
            },
        });
    };

    const handleExport = () => {
        exportMutation.mutate(
            { ...filters, fallbackFilename: `contacts-export-${new Date().toISOString().slice(0, 10)}.xlsx` },
            {
                onSuccess: () => {
                    toast.success(t("toast.export_success"));
                },
                onError: () => {
                    toast.error(t("toast.network_error"));
                },
            }
        );
    };

    // 6. Pagination Computations
    const totalItems = listData?.meta.total || 0;
    const totalPages = listData?.meta.last_page || 1;
    
    const handlePrevPage = () => {
        if (page > 1) {
            updateParams({ page: page - 1 });
        }
    };

    const handleNextPage = () => {
        if (page < totalPages) {
            updateParams({ page: page + 1 });
        }
    };

    const totalCount = listData?.stats.total || 0;
    const newCount = listData?.stats.new || 0;
    const readCount = listData?.stats.read || 0;
    const repliedCount = listData?.stats.replied || 0;

    const tabsList = [
        { key: "", label: t("list.tabs.all") },
        { key: "new", label: t("list.tabs.new") },
        { key: "read", label: t("list.tabs.read") },
        { key: "replied", label: t("list.tabs.replied") },
    ];

    return (
        <main className="p-4 sm:p-6 max-w-7xl mx-auto flex flex-col gap-6 font-sans h-[calc(100vh-88px)] overflow-hidden">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 shrink-0">
                <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                        {t("breadcrumb")}
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none">
                        {t("title")}
                    </h1>
                    <p className="text-sm font-semibold text-slate-400 mt-1.5">
                        {t("subtitle")}
                    </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    <button
                        onClick={handleExport}
                        disabled={exportMutation.isPending}
                        className="px-5 py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 rounded-2xl transition-all duration-300 font-bold text-sm flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50 disabled:pointer-events-none select-none active:scale-[0.98]"
                    >
                        <Download size={16} />
                        {t("actions.export")}
                    </button>
                </div>
            </div>

            {/* Stats row cards */}
            <div className="shrink-0">
                <ContactStatsRow
                    total={totalCount}
                    newCount={newCount}
                    readCount={readCount}
                    repliedCount={repliedCount}
                    isLoading={isListLoading}
                    isError={isListError}
                />
            </div>

            {/* Split Master-Detail Container */}
            <div className="flex-1 flex gap-6 min-h-0 overflow-hidden">
                {/* LEFT PANEL - Master List */}
                <div className="w-[380px] bg-white/70 backdrop-blur-md border border-slate-100 rounded-3xl flex flex-col shrink-0 min-h-0 overflow-hidden shadow-2xs">
                    {/* Search & Filter Toolbar */}
                    <div className="p-4 border-b border-slate-50 flex flex-col gap-3 shrink-0">
                        {/* Search Input bar */}
                        <div className="relative">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                placeholder={t("list.search_placeholder")}
                                className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-semibold focus:outline-hidden focus:border-[#14b8a6] focus:ring-1 focus:ring-[#14b8a6]/20 transition-all"
                            />
                        </div>

                        {/* Filter status tabs */}
                        <div className="flex items-center gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                            {tabsList.map((tab) => {
                                const isTabActive = status === tab.key;
                                return (
                                    <button
                                        key={tab.key}
                                        onClick={() => handleTabChange(tab.key)}
                                        className={`
                                            px-3.5 py-1.5 rounded-xl text-[11px] font-bold shrink-0 transition-all select-none cursor-pointer
                                            ${isTabActive 
                                                ? "bg-[#14b8a6] text-white shadow-md shadow-[#14b8a6]/20" 
                                                : "bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-700"}
                                        `}
                                    >
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Contacts List Panels */}
                    <div className="flex-1 overflow-y-auto [scrollbar-width:thin]">
                        {isListLoading ? (
                            [...Array(6)].map((_, i) => (
                                <div key={i} className="px-4 py-4 border-b border-slate-50 animate-pulse flex flex-col gap-2">
                                    <div className="flex justify-between items-center">
                                        <div className="h-4 bg-slate-200 rounded-md w-24"></div>
                                        <div className="h-3 bg-slate-100 rounded-md w-12"></div>
                                    </div>
                                    <div className="h-3 bg-slate-100 rounded-md w-3/4"></div>
                                    <div className="flex justify-between items-center mt-1">
                                        <div className="h-3 bg-slate-100 rounded-md w-1/2"></div>
                                        <div className="h-4 bg-slate-200 rounded-md w-14"></div>
                                    </div>
                                </div>
                            ))
                        ) : isListError ? (
                            <div className="p-8 text-center text-rose-500 font-bold text-sm">
                                {t("toast.network_error")}
                            </div>
                        ) : listData?.data.length === 0 ? (
                            <div className="p-8 text-center text-slate-400 font-bold text-xs select-none flex flex-col items-center gap-3">
                                <Mail size={32} className="text-slate-300" />
                                <span>{t("list.empty")}</span>
                            </div>
                        ) : (
                            listData?.data.map((item) => (
                                <ContactListItem
                                    key={item.id}
                                    item={item}
                                    isActive={selectedId === String(item.id)}
                                    onClick={() => handleSelectContact(item.id)}
                                />
                            ))
                        )}
                    </div>

                    {/* Pagination Mini Footer */}
                    {totalPages > 1 && (
                        <div className="p-3 border-t border-slate-50 flex items-center justify-between shrink-0 select-none bg-slate-50/20">
                            <span className="text-[11px] font-bold text-slate-400">
                                {t("pagination.showing_range", {
                                    from: (page - 1) * perPage + 1,
                                    to: Math.min(page * perPage, totalItems),
                                    total: totalItems,
                                })}
                            </span>
                            <div className="flex items-center gap-1.5">
                                <button
                                    onClick={handlePrevPage}
                                    disabled={page === 1}
                                    className="w-7 h-7 rounded-lg border border-slate-200 hover:border-[#14b8a6] hover:text-[#14b8a6] bg-white text-slate-500 flex items-center justify-center transition-colors disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                                >
                                    <ChevronLeft size={14} />
                                </button>
                                <button
                                    onClick={handleNextPage}
                                    disabled={page === totalPages}
                                    className="w-7 h-7 rounded-lg border border-slate-200 hover:border-[#14b8a6] hover:text-[#14b8a6] bg-white text-slate-500 flex items-center justify-center transition-colors disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                                >
                                    <ChevronRight size={14} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* RIGHT PANEL - Detail Drawer */}
                <div className="flex-1 min-w-0 h-full overflow-hidden">
                    <ContactDetailPanel
                        item={detailData}
                        isLoading={isDetailLoading}
                        isError={isDetailError}
                        onDeleteClick={() => detailData && setDeleteTarget({ id: detailData.id, name: detailData.name })}
                        onReplySubmit={handleReplySubmit}
                        isReplying={replyMutation.isPending}
                    />
                </div>
            </div>

            {/* Confirm modal for contacts deletion */}
            <DeleteContactDialog
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDeleteConfirm}
                contactName={deleteTarget?.name || ""}
                isMutating={deleteMutation.isPending}
            />
        </main>
    );
};

export default Contacts;
