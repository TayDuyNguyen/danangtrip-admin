import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Sparkles, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/routes/routes";
import { useNotificationMutations } from "@/hooks/useNotificationQueries";
import { useAdminUsersQuery } from "@/hooks/useUserQueries";
import NotificationSendForm from "./components/NotificationSendForm";
import NotificationPreview from "./components/NotificationPreview";
import BulkConfirmDialog from "./components/BulkConfirmDialog";
import type { UserItem } from "@/dataHelper";

interface FormValues {
    type: string;
    title: string;
    content: string;
    data: string;
}

type NotificationData = Record<string, unknown>;

export const NotificationSend = () => {
    const { t } = useTranslation("notification");
    const navigate = useNavigate();
    const { sendMutation, sendAllMutation } = useNotificationMutations();

    // Mode: individual or bulk
    const [mode, setMode] = useState<"individual" | "bulk">("individual");
    const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);

    // Form inputs state for live preview
    const [formValues, setFormValues] = useState<FormValues>({
        type: "system",
        title: "",
        content: "",
        data: "",
    });
    const [resetSignal, setResetSignal] = useState(0);

    // Confirmation dialog state for bulk sends
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [pendingBulkValues, setPendingBulkValues] = useState<FormValues | null>(null);

    // Fetch total system users count for bulk details
    const { data: usersResponse } = useAdminUsersQuery({}, 1, 1);
    const totalUserCount = usersResponse?.meta?.total || 0;

    // Handle form value changes from child form
    const handleFormValuesChange = (values: FormValues) => {
        setFormValues(values);
    };

    const clearComposeForm = () => {
        setSelectedUser(null);
        setFormValues({
            type: "system",
            title: "",
            content: "",
            data: "",
        });
        setPendingBulkValues(null);
        setIsConfirmOpen(false);
        setResetSignal((current) => current + 1);
    };

    const buildNotificationData = (link: string): NotificationData | undefined => {
        const trimmedLink = link.trim();

        return trimmedLink ? { url: trimmedLink } : undefined;
    };

    // Submitting handler
    const handleFormSubmit = (values: FormValues) => {
        const notificationData = buildNotificationData(values.data);

        if (mode === "individual") {
            if (!selectedUser) return;
            sendMutation.mutate(
                {
                    user_id: selectedUser.id,
                    type: values.type,
                    title: values.title,
                    content: values.content,
                    ...(notificationData ? { data: notificationData } : {}),
                },
                {
                    onSuccess: () => {
                        toast.success(t("send.toast.send_individual_success"));
                        clearComposeForm();
                    },
                    onError: (error: unknown) => {
                        const axiosError = error as { response?: { data?: { message?: string } } };
                        const errMsg = axiosError?.response?.data?.message || t("send.toast.send_failed");
                        toast.error(errMsg);
                    },
                }
            );
        } else {
            // Bulk mode: show confirmation dialog first
            setPendingBulkValues(values);
            setIsConfirmOpen(true);
        }
    };

    // Confirm bulk sending
    const handleConfirmBulkSend = () => {
        if (!pendingBulkValues) return;
        const notificationData = buildNotificationData(pendingBulkValues.data);

        sendAllMutation.mutate(
            {
                type: pendingBulkValues.type,
                title: pendingBulkValues.title,
                content: pendingBulkValues.content,
                ...(notificationData ? { data: notificationData } : {}),
            },
            {
                onSuccess: () => {
                    toast.success(t("send.toast.send_bulk_success", { count: totalUserCount }));
                    clearComposeForm();
                },
                onError: (error: unknown) => {
                    const axiosError = error as { response?: { data?: { message?: string } } };
                    const errMsg = axiosError?.response?.data?.message || t("send.toast.send_failed");
                    toast.error(errMsg);
                    setIsConfirmOpen(false);
                },
            }
        );
    };

    const isSubmitting = sendMutation.isPending || sendAllMutation.isPending;

    return (
        <div className="min-h-screen bg-slate-50 pb-20 font-sans">
            {/* Sticky Header */}
            <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-xs">
                <div className="max-w-[1600px] mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            className="rounded-full w-10 h-10 p-0 hover:bg-slate-100 cursor-pointer"
                            onClick={() => navigate(ROUTES.NOTIFICATIONS)}
                        >
                            <ArrowLeft className="w-5 h-5 text-slate-600" />
                        </Button>
                        <div>
                            <div className="flex items-center gap-2 mb-0.5">
                                <Send className="w-4 h-4 text-[#0066CC]" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-[#0066CC]">
                                    {t("breadcrumb")}
                                </span>
                            </div>
                            <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none">
                                {t("send.title")}
                            </h1>
                        </div>
                    </div>

                    <div className="hidden md:flex items-center gap-3">
                        <Button
                            variant="outline"
                            onClick={() => navigate(ROUTES.NOTIFICATIONS)}
                            className="rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold cursor-pointer"
                        >
                            {t("send.btn_cancel")}
                        </Button>
                        <Button
                            form="notification-send-form"
                            type="submit"
                            disabled={isSubmitting}
                            className="rounded-xl bg-[#0066CC] hover:bg-[#0052a3] text-white px-8 font-bold shadow-lg shadow-[#0066CC]/20 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
                        >
                            <Sparkles className="w-4 h-4 mr-2" />
                            {isSubmitting ? t("send.btn_sending") : t("send.btn_submit")}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="max-w-[1600px] mx-auto px-4 md:px-8 mt-8">
                {/* Page Breadcrumbs & Subtitles */}
                <div className="mb-8">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">
                        {t("send.breadcrumb")}
                    </span>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-2">
                        {t("send.title")}
                    </h2>
                    <p className="text-slate-500 max-w-2xl text-sm font-medium">
                        {t("send.subtitle")}
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 items-start w-full">
                    {/* Left Column: Form compose card */}
                    <div className="flex-1 w-full lg:max-w-[65%]">
                        <NotificationSendForm
                            mode={mode}
                            setMode={setMode}
                            selectedUser={selectedUser}
                            setSelectedUser={setSelectedUser}
                            totalUserCount={totalUserCount}
                            onValuesChange={handleFormValuesChange}
                            onSubmit={handleFormSubmit}
                            isSubmitting={isSubmitting}
                            resetSignal={resetSignal}
                        />
                    </div>

                    {/* Right Column: Sticky Sidebar cards */}
                    <div className="w-full lg:w-[35%] space-y-6 shrink-0 lg:sticky lg:top-28">
                        {/* Live Notification Preview */}
                        <NotificationPreview
                            mode={mode}
                            type={formValues.type}
                            title={formValues.title}
                            content={formValues.content}
                            selectedUser={selectedUser}
                            totalUserCount={totalUserCount}
                        />

                        {/* Guide Notes Card */}
                        <div className="bg-[#EFF6FF]/60 border border-[#B3D9FF]/50 rounded-3xl p-6">
                            <h5 className="text-xs font-extrabold text-[#0066CC] uppercase tracking-wider mb-4 flex items-center gap-2">
                                <HelpCircle className="w-4 h-4" />
                                {t("send.guide_title")}
                            </h5>
                            <ul className="space-y-3">
                                <li className="text-[11px] font-bold text-slate-600 flex items-start gap-2">
                                    <span className="text-[#0066CC] font-black mt-0.5">•</span>
                                    <span>{t("send.guide_item_1")}</span>
                                </li>
                                <li className="text-[11px] font-bold text-slate-600 flex items-start gap-2">
                                    <span className="text-[#0066CC] font-black mt-0.5">•</span>
                                    <span>{t("send.guide_item_2")}</span>
                                </li>
                                <li className="text-[11px] font-bold text-slate-600 flex items-start gap-2">
                                    <span className="text-[#0066CC] font-black mt-0.5">•</span>
                                    <span>{t("send.guide_item_3")}</span>
                                </li>
                                <li className="text-[11px] font-bold text-slate-600 flex items-start gap-2">
                                    <span className="text-[#0066CC] font-black mt-0.5">•</span>
                                    <span>{t("send.guide_item_4")}</span>
                                </li>
                            </ul>
                        </div>

                        {/* Mobile Form footer actions */}
                        <div className="flex flex-col gap-3 w-full md:hidden">
                            <Button
                                form="notification-send-form"
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full rounded-2xl bg-[#0066CC] hover:bg-[#0052a3] text-white h-14 font-bold shadow-lg shadow-[#0066CC]/20 transition-all hover:scale-[1.01] active:scale-95 cursor-pointer"
                            >
                                {isSubmitting ? t("send.btn_sending") : t("send.btn_submit")}
                            </Button>
                            <Button
                                variant="ghost"
                                className="w-full text-slate-500 font-bold h-12 cursor-pointer"
                                onClick={() => navigate(ROUTES.NOTIFICATIONS)}
                            >
                                {t("send.btn_cancel")}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Safety Confirmation Dialog for Bulk Send */}
            <BulkConfirmDialog
                isOpen={isConfirmOpen}
                onClose={() => {
                    setIsConfirmOpen(false);
                    setPendingBulkValues(null);
                }}
                onConfirm={handleConfirmBulkSend}
                isMutating={sendAllMutation.isPending}
                recipientCount={totalUserCount}
            />
        </div>
    );
};

export default NotificationSend;
