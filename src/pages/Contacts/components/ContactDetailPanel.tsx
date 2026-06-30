import { Mail, Trash2, Phone, CheckCircle, MailCheck, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import Badge from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import EmptyState from "@/components/common/EmptyState";
import ReplyForm from "./ReplyForm";
import type { ContactItem } from "@/dataHelper";

interface ContactDetailPanelProps {
    item?: ContactItem;
    isLoading?: boolean;
    isError?: boolean;
    onRetry?: () => void;
    onDeleteClick: () => void;
    onReplySubmit: (data: { reply: string }) => void;
    isReplying?: boolean;
}

export const ContactDetailPanel = ({
    item,
    isLoading = false,
    isError = false,
    onRetry,
    onDeleteClick,
    onReplySubmit,
    isReplying = false,
}: ContactDetailPanelProps) => {
    const { t } = useTranslation(["contact", "common"]);

    if (isLoading) {
        return (
            <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 border border-slate-100 shadow-2xs h-full flex flex-col gap-6 animate-pulse">
                {/* Header Skeleton */}
                <div className="flex justify-between items-start border-b border-slate-100 pb-6 shrink-0">
                    <div className="space-y-3 flex-1">
                        <Skeleton className="h-6 w-3/4 rounded-md" />
                        <div className="flex gap-2">
                            <Skeleton className="h-4 w-16 rounded-md" />
                            <Skeleton className="h-4 w-32 rounded-md" />
                        </div>
                    </div>
                    <Skeleton className="h-10 w-24 rounded-2xl shrink-0" />
                </div>

                {/* Sender Card Skeleton */}
                <div className="flex items-center gap-4 border-b border-slate-100 pb-6 shrink-0">
                    <Skeleton className="w-12 h-12 rounded-full shrink-0" />
                    <div className="space-y-2 flex-1">
                        <Skeleton className="h-5 w-40 rounded-md" />
                        <Skeleton className="h-4 w-56 rounded-md" />
                    </div>
                </div>

                {/* Content Skeleton */}
                <div className="space-y-3 flex-1 min-h-0 overflow-y-auto">
                    <Skeleton className="h-3 w-16 rounded-md" />
                    <Skeleton className="h-32 w-full rounded-2xl" />
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div
                className="bg-white/80 backdrop-blur-md rounded-3xl p-8 border border-slate-100 shadow-2xs h-full flex flex-col items-center justify-center text-center"
                data-testid="contact-detail-error"
            >
                <EmptyState
                    icon={Mail}
                    title={t("errors.detail_load_failed")}
                    description={t("errors.detail_load_failed_desc")}
                    iconClassName="bg-rose-50 text-rose-500"
                />
                {onRetry && (
                    <button
                        type="button"
                        onClick={() => void onRetry()}
                        className="mt-2 px-6 py-2.5 bg-[#14b8a6] text-white rounded-xl text-[13px] font-bold hover:bg-[#0f766e] transition-colors inline-flex items-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4" />
                        {t("actions.retry", { ns: "common", defaultValue: "Thử lại" })}
                    </button>
                )}
            </div>
        );
    }

    if (!item) {
        return (
            <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 border border-slate-100 shadow-2xs h-full flex flex-col items-center justify-center text-center select-none">
                <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 mb-4 animate-pulse">
                    <Mail size={40} />
                </div>
                <h3 className="text-slate-900 font-black text-lg tracking-tight mb-1">
                    {t("detail.empty_state_title")}
                </h3>
                <p className="text-slate-400 text-sm font-semibold">
                    {t("detail.empty_state_subtitle")}
                </p>
            </div>
        );
    }

    const badgeVariants = {
        new: "error" as const,
        read: "warning" as const,
        replied: "success" as const,
    };

    const nameInitial = item.name.charAt(0).toUpperCase();
    const formattedSentTime = item.createdAt 
        ? new Date(item.createdAt).toLocaleString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }) 
        : "";

    const formattedRepliedTime = item.repliedAt 
        ? new Date(item.repliedAt).toLocaleString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }) 
        : "";

    const isReplied = item.status === "replied";

    return (
        <div className="bg-white/85 backdrop-blur-md rounded-3xl border border-slate-100 shadow-2xs h-full flex flex-col min-h-0">
            {/* 1. Header Area */}
            <div className="p-6 sm:p-8 border-b border-slate-100 flex items-start justify-between gap-4 shrink-0">
                <div className="min-w-0">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        {t("detail.subject_label")}
                    </span>
                    <h2 className="text-slate-900 font-black text-lg leading-tight tracking-tight sm:text-xl truncate">
                        {item.subject}
                    </h2>
                    <div className="flex flex-wrap items-center gap-2.5 mt-2.5">
                        <Badge 
                            variant={badgeVariants[item.status]} 
                            className="text-[9px] px-2 py-0.5 font-extrabold uppercase tracking-wide"
                        >
                            {t(`stats.${item.status}`)}
                        </Badge>
                        <span className="text-[11px] font-bold text-slate-400 shrink-0">
                            {t("detail.sent_at", { time: formattedSentTime })}
                        </span>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={onDeleteClick}
                    aria-label={t("actions.delete")}
                    className="p-3 bg-white border border-rose-100 hover:bg-rose-50 text-rose-500 rounded-2xl transition-all duration-300 flex items-center gap-2 cursor-pointer shadow-xs font-bold text-sm shrink-0 active:scale-95"
                    title={t("actions.delete")}
                >
                    <Trash2 size={16} />
                    <span className="hidden sm:inline">{t("actions.delete")}</span>
                </button>
            </div>

            {/* Scrollable Container for Sender, Content & Reply */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 [scrollbar-width:thin]">
                {/* 2. Sender Info Card */}
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200/50 flex items-center justify-center text-slate-600 font-black shrink-0 relative overflow-hidden shadow-sm">
                        <span className="text-sm font-extrabold">{nameInitial}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                            {t("detail.sender_label")}
                        </span>
                        <h4 className="text-slate-900 font-extrabold text-[15px] truncate">
                            {item.name}
                        </h4>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-1.5 mt-1.5">
                            <a
                                href={`mailto:${item.email}`}
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#14b8a6] hover:text-[#0f766e] transition-colors truncate"
                            >
                                <Mail size={12} />
                                {item.email}
                            </a>
                            {item.phone && (
                                <a
                                    href={`tel:${item.phone}`}
                                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors shrink-0"
                                >
                                    <Phone size={12} />
                                    {item.phone}
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {/* 3. Message Content */}
                <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        {t("detail.message_label")}
                    </span>
                    <div className="bg-slate-50/50 border border-slate-100 rounded-3xl p-5 sm:p-6">
                        <p className="text-slate-800 text-sm font-medium leading-relaxed whitespace-pre-wrap">
                            {item.message}
                        </p>
                    </div>
                </div>

                {/* 4. Reply Actions / Replied History */}
                <div className="border-t border-slate-50 pt-6">
                    {isReplied ? (
                        <div className="space-y-4">
                            {/* Header info */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0">
                                        <MailCheck size={14} />
                                    </div>
                                    <h4 className="text-slate-900 text-sm font-black tracking-tight">
                                        {t("detail.replied_title")}
                                    </h4>
                                </div>
                                <span className="text-[11px] font-bold text-slate-400">
                                    {t("detail.replied_by_meta", {
                                        time: formattedRepliedTime,
                                        name: item.replierName || item.replierUsername || "Admin"
                                    })}
                                </span>
                            </div>

                            {/* Message content panel */}
                            <div className="bg-emerald-50/20 border border-emerald-100 rounded-3xl p-5 sm:p-6">
                                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block mb-2">
                                    {t("detail.replied_label")}
                                </span>
                                <p className="text-slate-800 text-sm font-semibold leading-relaxed whitespace-pre-wrap">
                                    {item.reply}
                                </p>
                            </div>

                            {/* Status label */}
                            <div className="flex items-center gap-2 text-emerald-600 px-1">
                                <CheckCircle size={14} className="shrink-0" />
                                <span className="text-[11px] font-bold">
                                    {t("detail.replied_success_email")}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <ReplyForm
                            email={item.email}
                            onSubmit={onReplySubmit}
                            isSubmitting={isReplying}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default ContactDetailPanel;
