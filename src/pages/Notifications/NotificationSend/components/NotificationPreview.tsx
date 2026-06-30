import { ShoppingCart, Star, Settings, Tag, Users, Bell } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { UserItem } from "@/dataHelper";

interface NotificationPreviewProps {
    mode: "individual" | "bulk";
    type: string;
    title: string;
    content: string;
    selectedUser: UserItem | null;
    totalUserCount?: number;
}

export const NotificationPreview = ({
    mode,
    type,
    title,
    content,
    selectedUser,
    totalUserCount = 0,
}: NotificationPreviewProps) => {
    const { t } = useTranslation("notification");

    // Dynamic type configurations
    const getTypeConfig = (notifType: string) => {
        switch (notifType) {
            case "booking":
                return {
                    icon: <ShoppingCart size={20} />,
                    bgColor: "bg-blue-50 text-blue-600 border-blue-100",
                    badgeColor: "bg-blue-50 text-blue-700",
                    label: t("types.booking"),
                };
            case "rating":
                return {
                    icon: <Star size={20} />,
                    bgColor: "bg-amber-50 text-amber-500 border-amber-100",
                    badgeColor: "bg-amber-50 text-amber-700",
                    label: t("types.rating"),
                };
            case "promotion":
                return {
                    icon: <Tag size={20} />,
                    bgColor: "bg-emerald-50 text-emerald-600 border-emerald-100",
                    badgeColor: "bg-emerald-50 text-emerald-700",
                    label: t("types.promotion"),
                };
            case "system":
            default:
                return {
                    icon: <Settings size={20} />,
                    bgColor: "bg-slate-50 text-slate-500 border-slate-200",
                    badgeColor: "bg-slate-100 text-slate-700",
                    label: t("types.system"),
                };
        }
    };

    const typeConfig = getTypeConfig(type);

    return (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-xs">
            <h4 className="text-sm font-bold text-slate-800 tracking-tight mb-4 flex items-center gap-2">
                <Bell size={16} className="text-[#0066CC]" />
                {t("send.preview_title")}
            </h4>

            {/* Notification Mockup Card */}
            <div className="bg-[#F8FAFC] border border-slate-200/40 rounded-2xl p-4 transition-all duration-300">
                <div className="flex items-start gap-3">
                    {/* Notification Type Icon */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${typeConfig.bgColor}`}>
                        {typeConfig.icon}
                    </div>

                    {/* Notification Texts */}
                    <div className="flex-1 min-w-0">
                        {/* Title */}
                        <h5 className={`text-sm font-bold tracking-tight leading-tight truncate ${title ? "text-slate-900" : "text-slate-400 italic"}`}>
                            {title || t("send.preview_empty_title")}
                        </h5>

                        {/* Content */}
                        <p className={`text-xs font-semibold mt-1 leading-relaxed ${content ? "text-slate-500 break-words line-clamp-2" : "text-slate-400 italic"}`}>
                            {content || t("send.preview_empty_content")}
                        </p>

                        {/* Badges & Meta */}
                        <div className="flex items-center gap-2 mt-3">
                            <span className={`text-[10px] font-black uppercase tracking-wider rounded-md px-2 py-0.5 ${typeConfig.badgeColor}`}>
                                {typeConfig.label}
                            </span>
                            <span className="text-[10px] font-semibold text-slate-400">
                                {t("send.preview_time")}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Recipient Status */}
                <div className="mt-4 pt-3 border-t border-slate-200/50 flex items-center gap-2">
                    {mode === "individual" ? (
                        selectedUser ? (
                            <div className="flex items-center gap-2 w-full min-w-0">
                                {selectedUser.avatar ? (
                                    <img
                                        src={selectedUser.avatar}
                                        alt={selectedUser.fullName}
                                        className="w-6 h-6 rounded-full object-cover border border-slate-100"
                                    />
                                ) : (
                                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500 border border-slate-200">
                                        {selectedUser.fullName.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-bold text-slate-800 truncate leading-none">
                                        {selectedUser.fullName}
                                    </p>
                                    <p className="text-[10px] font-medium text-slate-400 truncate mt-0.5">
                                        {selectedUser.email}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-xs font-semibold text-slate-400 italic leading-none">
                                {t("send.no_user_selected")}
                            </p>
                        )
                    ) : (
                        <div className="flex items-center gap-2 text-[#0066CC]">
                            <Users size={16} />
                            <span className="text-xs font-extrabold">
                                {t("send.preview_to_all", { count: totalUserCount.toLocaleString() })}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationPreview;
