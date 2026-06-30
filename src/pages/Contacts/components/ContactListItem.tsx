import type { ContactItem } from "@/dataHelper";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { Trash2 } from "lucide-react";
import Badge from "@/components/ui/Badge";

interface ContactListItemProps {
    item: ContactItem;
    isActive: boolean;
    onClick: () => void;
    onDeleteClick: () => void;
}

const getRelativeTimeString = (dateString: string, locale: string, t: TFunction) => {
    const d = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    if (isNaN(diffMs) || diffMs < 0) return t("list.time.just_now");
    
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffSec < 60) return t("list.time.just_now");
    if (diffMin < 60) return t("list.time.minutes_ago", { count: diffMin });
    if (diffHour < 24) return t("list.time.hours_ago", { count: diffHour });
    if (diffDay < 7) return t("list.time.days_ago", { count: diffDay });
    
    const loc = locale.toLowerCase().startsWith('vi') ? 'vi-VN' : 'en-GB';
    return d.toLocaleDateString(loc, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};

export const ContactListItem = ({
    item,
    isActive,
    onClick,
    onDeleteClick,
}: ContactListItemProps) => {
    const { t, i18n } = useTranslation("contact");

    const badgeVariants = {
        new: "error" as const,
        read: "warning" as const,
        replied: "success" as const,
    };

    const isNew = item.status === "new";

    return (
        <div
            onClick={onClick}
            className={`
                group px-4 py-3.5 border-b border-slate-50 cursor-pointer transition-all duration-200 relative select-none
                ${isActive 
                    ? "bg-[#EFF6FF] border-l-4 border-[#14b8a6]" 
                    : isNew 
                        ? "bg-rose-50/40 hover:bg-slate-50 border-l-4 border-transparent" 
                        : "hover:bg-slate-50/80 border-l-4 border-transparent"}
            `}
        >
            {/* Unread indicator dot */}
            {isNew && (
                <div className="absolute left-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
            )}

            {/* Row 1: Sender Name & Time */}
            <div className="flex justify-between items-start gap-2">
                <span className={`text-[13px] font-bold truncate ${isNew ? "text-slate-900 font-extrabold" : "text-slate-700"}`}>
                    {item.name}
                </span>
                <div className="flex items-center gap-1 shrink-0">
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDeleteClick();
                        }}
                        aria-label={t("actions.delete")}
                        title={t("actions.delete")}
                        data-testid={`contact-list-delete-${item.id}`}
                        className="w-7 h-7 rounded-lg border border-slate-100 bg-white hover:border-rose-100 hover:bg-rose-50 text-slate-400 hover:text-rose-500 flex items-center justify-center transition-all shrink-0 cursor-pointer"
                    >
                        <Trash2 size={13} />
                    </button>
                    <span className="text-[10px] font-medium text-slate-400">
                        {getRelativeTimeString(item.createdAt, i18n.language, t)}
                    </span>
                </div>
            </div>

            {/* Row 2: Subject */}
            <div className="mt-1">
                <p className={`text-[12px] truncate ${isNew ? "text-slate-800 font-bold" : "text-slate-500 font-medium"}`}>
                    {item.subject}
                </p>
            </div>

            {/* Row 3: Message preview & Status Badge */}
            <div className="flex justify-between items-center mt-2.5 gap-2">
                <span className="text-[11px] text-slate-400 truncate flex-1 font-medium">
                    {item.message}
                </span>
                <Badge 
                    variant={badgeVariants[item.status]} 
                    className="text-[9px] px-2 py-0.5 shrink-0 font-extrabold uppercase tracking-wide"
                >
                    {t(`stats.${item.status}`)}
                </Badge>
            </div>
        </div>
    );
};

export default ContactListItem;
