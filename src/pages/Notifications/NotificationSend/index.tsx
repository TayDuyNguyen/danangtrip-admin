import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Sparkles, HelpCircle, Bell } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/routes/routes";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import { useNotificationMutations } from "@/hooks/useNotificationQueries";
import { useAdminUsersQuery } from "@/hooks/useUserQueries";
import { mapApiErrorMessage } from "@/utils";
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
                        toast.error(mapApiErrorMessage(t("send.toast.send_failed"), error));
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
                    toast.error(mapApiErrorMessage(t("send.toast.send_failed"), error));
                    setIsConfirmOpen(false);
                },
            }
        );
    };

    const isSubmitting = sendMutation.isPending || sendAllMutation.isPending;

    return (
        <div className="min-h-screen bg-slate-50 pb-20 font-sans">
            <div className="max-w-[1600px] mx-auto px-4 md:px-8 mt-8">
                {/* Page Breadcrumbs & Subtitles */}
                <div className="mb-8">
                    <Breadcrumbs
                        icon={Bell}
                        items={[
                            { label: t("breadcrumb"), path: ROUTES.NOTIFICATIONS },
                            { label: t("send.breadcrumb") },
                        ]}
                        actions={[
                            {
                                label: t("send.btn_cancel"),
                                onClick: () => navigate(ROUTES.NOTIFICATIONS),
                                variant: "outline",
                            },
                            {
                                label: isSubmitting ? t("send.btn_sending") : t("send.btn_submit"),
                                form: "notification-send-form",
                                type: "submit",
                                icon: Sparkles,
                                variant: "primary",
                                disabled: isSubmitting,
                            },
                        ]}
                    />
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-2 mt-4">
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
