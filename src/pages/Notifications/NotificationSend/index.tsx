import { useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Sparkles, HelpCircle, Bell } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/routes/routes";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import { UnsavedChangesGuard } from "@/components/common/UnsavedChangesGuard";
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

const ACTIVE_USER_FILTERS = { status: "active" as const };

export const NotificationSend = () => {
    const { t } = useTranslation("notification");
    const navigate = useNavigate();
    const { sendMutation, sendAllMutation } = useNotificationMutations();

    const [mode, setMode] = useState<"individual" | "bulk">("individual");
    const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
    const [formValues, setFormValues] = useState<FormValues>({
        type: "system",
        title: "",
        content: "",
        data: "",
    });
    const [resetSignal, setResetSignal] = useState(0);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [pendingBulkValues, setPendingBulkValues] = useState<FormValues | null>(null);
    const [bypassUnsavedGuard, setBypassUnsavedGuard] = useState(false);

    const { data: usersResponse, isLoading: isUsersCountLoading } = useAdminUsersQuery(
        ACTIVE_USER_FILTERS,
        1,
        1
    );
    const totalUserCount = usersResponse?.meta?.total || 0;

    const handleFormValuesChange = useCallback((values: FormValues) => {
        setFormValues(values);
    }, []);

    const clearComposeForm = useCallback(() => {
        setMode("individual");
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
    }, []);

    const navigateToList = useCallback(() => {
        setBypassUnsavedGuard(true);
        navigate(ROUTES.NOTIFICATIONS);
    }, [navigate]);

    const buildNotificationData = (link: string): NotificationData | undefined => {
        const trimmedLink = link.trim();
        return trimmedLink ? { url: trimmedLink } : undefined;
    };

    const isDirty = useMemo(
        () =>
            Boolean(
                formValues.title.trim() ||
                    formValues.content.trim() ||
                    formValues.data.trim() ||
                    selectedUser ||
                    formValues.type !== "system" ||
                    mode === "bulk"
            ),
        [formValues, selectedUser, mode]
    );

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
                        navigateToList();
                    },
                    onError: () => {
                        toast.error(t("send.toast.send_failed"));
                    },
                }
            );
            return;
        }

        if (totalUserCount === 0) {
            toast.error(t("send.bulk_disabled_no_users"));
            return;
        }

        setPendingBulkValues(values);
        setIsConfirmOpen(true);
    };

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
                onSuccess: (response) => {
                    const sentCount = response?.data?.sent_count ?? totalUserCount;
                    toast.success(t("send.toast.send_bulk_success", { count: sentCount }));
                    clearComposeForm();
                    navigateToList();
                },
                onError: () => {
                    toast.error(t("send.toast.send_failed"));
                    setIsConfirmOpen(false);
                },
            }
        );
    };

    const isSubmitting = sendMutation.isPending || sendAllMutation.isPending;

    return (
        <div className="min-h-screen bg-slate-50 pb-28 md:pb-20 font-sans" data-testid="notification-send-page">
            <UnsavedChangesGuard isDirty={isDirty && !bypassUnsavedGuard && !isSubmitting} />

            <div className="max-w-[1600px] mx-auto px-4 md:px-8 mt-8">
                <div className="mb-8">
                    <Breadcrumbs
                        icon={Bell}
                        items={[
                            { label: t("breadcrumb"), path: ROUTES.NOTIFICATIONS },
                            {
                                label: t("send.breadcrumb"),
                                ariaLabel: t("send.breadcrumb_aria"),
                            },
                        ]}
                        actions={[
                            {
                                label: t("send.btn_cancel"),
                                onClick: navigateToList,
                                variant: "outline",
                            },
                            {
                                label: isSubmitting ? t("send.btn_sending") : t("send.btn_submit"),
                                ariaLabel: t("send.btn_submit_aria"),
                                form: "notification-send-form",
                                type: "submit",
                                icon: Sparkles,
                                variant: "primary",
                                disabled: isSubmitting,
                                actionPrimaryClassName:
                                    "bg-[#0066CC] text-white shadow-md shadow-[#0066CC]/20 hover:bg-[#0052a3]",
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
                    <div className="flex-1 w-full lg:max-w-[65%]" data-testid="notification-send-form-column">
                        <NotificationSendForm
                            mode={mode}
                            setMode={setMode}
                            selectedUser={selectedUser}
                            setSelectedUser={setSelectedUser}
                            totalUserCount={totalUserCount}
                            isUsersCountLoading={isUsersCountLoading}
                            onValuesChange={handleFormValuesChange}
                            onSubmit={handleFormSubmit}
                            isSubmitting={isSubmitting}
                            resetSignal={resetSignal}
                        />
                    </div>

                    <div
                        className="w-full lg:w-[35%] space-y-6 shrink-0 lg:sticky lg:top-28"
                        data-testid="notification-send-sidebar"
                    >
                        <NotificationPreview
                            mode={mode}
                            type={formValues.type}
                            title={formValues.title}
                            content={formValues.content}
                            selectedUser={selectedUser}
                            totalUserCount={totalUserCount}
                        />

                        <div
                            className="bg-[#EFF6FF]/60 border border-[#B3D9FF]/50 rounded-3xl p-6"
                            data-testid="notification-send-guide"
                        >
                            <h5 className="text-xs font-extrabold text-[#0066CC] uppercase tracking-wider mb-4 flex items-center gap-2">
                                <HelpCircle className="w-4 h-4" />
                                {t("send.guide_title")}
                            </h5>
                            <ul className="space-y-3">
                                {[1, 2, 3, 4].map((index) => (
                                    <li
                                        key={index}
                                        className="text-[11px] font-bold text-slate-600 flex items-start gap-2"
                                    >
                                        <span className="text-[#0066CC] font-black mt-0.5">•</span>
                                        <span>{t(`send.guide_item_${index}` as "send.guide_item_1")}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <div
                className="fixed bottom-0 left-0 right-0 z-40 md:hidden border-t border-slate-200 bg-white/95 backdrop-blur-sm p-4 shadow-[0_-8px_24px_rgba(15,23,42,0.08)]"
                data-testid="notification-send-mobile-footer"
            >
                <div className="flex flex-col gap-3 w-full max-w-[1600px] mx-auto">
                    <Button
                        form="notification-send-form"
                        type="submit"
                        disabled={isSubmitting}
                        data-testid="notification-send-mobile-submit"
                        className="w-full rounded-2xl bg-[#0066CC] hover:bg-[#0052a3] text-white h-14 font-bold shadow-lg shadow-[#0066CC]/20 transition-all hover:scale-[1.01] active:scale-95 cursor-pointer"
                    >
                        {isSubmitting ? t("send.btn_sending") : t("send.btn_submit")}
                    </Button>
                    <Button
                        variant="ghost"
                        data-testid="notification-send-mobile-cancel"
                        className="w-full text-slate-500 font-bold h-12 cursor-pointer"
                        onClick={navigateToList}
                    >
                        {t("send.btn_cancel")}
                    </Button>
                </div>
            </div>

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
