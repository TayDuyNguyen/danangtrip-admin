import { useState, useEffect, useMemo } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useTranslation } from "react-i18next";
import { Send, AlertTriangle, ChevronDown, ChevronUp, ShoppingCart, Star, Settings, Tag } from "lucide-react";
import { TextInput } from "@/components/ui/TextInput";
import CustomSelect, { type Option } from "@/components/ui/CustomSelect";
import RecipientSelector from "./RecipientSelector";
import type { UserItem } from "@/dataHelper";

interface NotificationFormValues {
    type: string;
    title: string;
    content: string;
    data: string;
}

interface NotificationSendFormProps {
    mode: "individual" | "bulk";
    setMode: (mode: "individual" | "bulk") => void;
    selectedUser: UserItem | null;
    setSelectedUser: (user: UserItem | null) => void;
    totalUserCount: number;
    isUsersCountLoading: boolean;
    onValuesChange: (values: NotificationFormValues) => void;
    onSubmit: (values: NotificationFormValues) => void;
    isSubmitting: boolean;
    resetSignal: number;
}

export const NotificationSendForm = ({
    mode,
    setMode,
    selectedUser,
    setSelectedUser,
    totalUserCount,
    isUsersCountLoading,
    onValuesChange,
    onSubmit,
    isSubmitting,
    resetSignal,
}: NotificationSendFormProps) => (
    <NotificationSendFormFields
        key={resetSignal}
        mode={mode}
        setMode={setMode}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        totalUserCount={totalUserCount}
        isUsersCountLoading={isUsersCountLoading}
        onValuesChange={onValuesChange}
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
    />
);

const NotificationSendFormFields = ({
    mode,
    setMode,
    selectedUser,
    setSelectedUser,
    totalUserCount,
    isUsersCountLoading,
    onValuesChange,
    onSubmit,
    isSubmitting,
}: Omit<NotificationSendFormProps, 'resetSignal'>) => {
    const { t } = useTranslation("notification");
    const [isDataCollapsed, setIsDataCollapsed] = useState(true);
    const [recipientError, setRecipientError] = useState<string | null>(null);

    const validationSchema = useMemo(
        () =>
            yup.object({
                type: yup.string().required(t("send.validation.type_required")),
                title: yup
                    .string()
                    .required(t("send.validation.title_required"))
                    .max(100, t("send.validation.title_max")),
                content: yup
                    .string()
                    .required(t("send.validation.content_required"))
                    .max(500, t("send.validation.content_max")),
                data: yup.string().test("is-valid-link", t("send.validation.data_invalid_link"), (value) => {
                    if (!value || value.trim() === "") return true;
                    return /^(https?:\/\/|\/)/i.test(value.trim());
                }),
            }),
        [t]
    );

    const {
        register,
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<NotificationFormValues>({
        resolver: yupResolver(validationSchema) as never,
        defaultValues: {
            type: "system",
            title: "",
            content: "",
            data: "",
        },
    });

    const watchedType = useWatch({ control, name: "type" });
    const watchedTitle = useWatch({ control, name: "title", defaultValue: "" });
    const watchedContent = useWatch({ control, name: "content", defaultValue: "" });
    const watchedData = useWatch({ control, name: "data", defaultValue: "" });

    useEffect(() => {
        onValuesChange({
            type: watchedType ?? "system",
            title: watchedTitle ?? "",
            content: watchedContent ?? "",
            data: watchedData ?? "",
        });
    }, [watchedType, watchedTitle, watchedContent, watchedData, onValuesChange]);

    const showDataSection = !isDataCollapsed || Boolean(errors.data);

    const handleFormSubmit = (values: NotificationFormValues) => {
        if (mode === "individual" && !selectedUser) {
            setRecipientError(t("send.validation.user_required"));
            const el = document.getElementById("recipient-section");
            if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
            return;
        }
        setRecipientError(null);
        onSubmit(values);
    };

    const typeOptions: Option[] = [
        {
            value: "booking",
            label: (
                <div className="flex items-center gap-2">
                    <ShoppingCart size={16} className="text-blue-500" />
                    <span className="text-xs font-bold text-slate-700">{t("types.booking")}</span>
                </div>
            ),
        },
        {
            value: "rating",
            label: (
                <div className="flex items-center gap-2">
                    <Star size={16} className="text-amber-500" />
                    <span className="text-xs font-bold text-slate-700">{t("types.rating")}</span>
                </div>
            ),
        },
        {
            value: "system",
            label: (
                <div className="flex items-center gap-2">
                    <Settings size={16} className="text-slate-500" />
                    <span className="text-xs font-bold text-slate-700">{t("types.system")}</span>
                </div>
            ),
        },
        {
            value: "promotion",
            label: (
                <div className="flex items-center gap-2">
                    <Tag size={16} className="text-emerald-500" />
                    <span className="text-xs font-bold text-slate-700">{t("types.promotion")}</span>
                </div>
            ),
        },
    ];

    const isBulkDisabled = isSubmitting || isUsersCountLoading || totalUserCount === 0;

    return (
        <form
            id="notification-send-form"
            data-testid="notification-send-form"
            onSubmit={handleSubmit(handleFormSubmit)}
            className="space-y-6 w-full"
        >
            <div
                className="bg-white border border-slate-200/60 rounded-2xl p-1 inline-flex gap-1 shadow-2xs"
                data-testid="notification-send-mode-switch"
            >
                <button
                    type="button"
                    data-testid="notification-send-mode-individual"
                    onClick={() => {
                        setMode("individual");
                        setRecipientError(null);
                    }}
                    disabled={isSubmitting}
                    className={`rounded-xl px-5 py-2.5 text-xs font-extrabold transition-all duration-200 cursor-pointer disabled:opacity-50 ${
                        mode === "individual"
                            ? "bg-[#0066CC] text-white shadow-sm"
                            : "text-slate-500 hover:text-[#0066CC] hover:bg-slate-50"
                    }`}
                >
                    {t("send.mode_individual")}
                </button>
                <button
                    type="button"
                    data-testid="notification-send-mode-bulk"
                    onClick={() => {
                        setMode("bulk");
                        setRecipientError(null);
                        setSelectedUser(null);
                    }}
                    disabled={isBulkDisabled}
                    title={totalUserCount === 0 ? t("send.bulk_disabled_no_users") : undefined}
                    className={`rounded-xl px-5 py-2.5 text-xs font-extrabold transition-all duration-200 cursor-pointer disabled:opacity-50 ${
                        mode === "bulk"
                            ? "bg-[#0066CC] text-white shadow-sm"
                            : "text-slate-500 hover:text-[#0066CC] hover:bg-slate-50"
                    }`}
                >
                    {t("send.mode_bulk")}
                </button>
            </div>

            {mode === "bulk" && (
                <div
                    className="bg-amber-50 border border-amber-200/50 rounded-2xl p-4 flex gap-3 text-amber-800 animate-in fade-in slide-in-from-top-1 duration-200"
                    data-testid="notification-send-bulk-warning"
                >
                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div className="text-xs font-bold leading-normal">
                        {totalUserCount === 0
                            ? t("send.bulk_disabled_no_users")
                            : t("send.bulk_warning", { count: totalUserCount.toLocaleString() })}
                    </div>
                </div>
            )}

            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/60 shadow-xs space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                    <div className="flex items-center justify-center w-10 h-10 bg-blue-50 rounded-xl text-[#0066cc]">
                        <Send size={18} />
                    </div>
                    <h3 className="text-base font-extrabold text-slate-800 tracking-tight">
                        {t("table.content")}
                    </h3>
                </div>

                {mode === "individual" && (
                    <div id="recipient-section" className="animate-in fade-in duration-200">
                        <RecipientSelector
                            selectedUser={selectedUser}
                            onSelect={(user) => {
                                setSelectedUser(user);
                                if (user) setRecipientError(null);
                            }}
                            error={recipientError || undefined}
                            disabled={isSubmitting}
                        />
                    </div>
                )}

                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                        {t("send.label_type")}
                    </label>
                    <Controller
                        name="type"
                        control={control}
                        render={({ field }) => (
                            <CustomSelect
                                options={typeOptions}
                                value={typeOptions.find((o) => o.value === field.value) || null}
                                onChange={(opt: Option | null) => field.onChange(opt?.value || "system")}
                                placeholder={t("send.label_type")}
                                isDisabled={isSubmitting}
                            />
                        )}
                    />
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                            {t("send.label_title")}
                        </label>
                        <span className="text-[10px] font-semibold text-slate-400">
                            {(watchedTitle ?? "").length}/100
                        </span>
                    </div>
                    <TextInput
                        placeholder={t("send.placeholder_title")}
                        data-testid="notification-send-title"
                        {...register("title")}
                        invalid={!!errors.title}
                        disabled={isSubmitting}
                    />
                    {errors.title && (
                        <p className="text-xs text-rose-500 font-semibold pl-1">{errors.title.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                            {t("send.label_content")}
                        </label>
                        <span className="text-[10px] font-semibold text-slate-400">
                            {(watchedContent ?? "").length}/500
                        </span>
                    </div>
                    <textarea
                        rows={4}
                        placeholder={t("send.placeholder_content")}
                        data-testid="notification-send-content"
                        {...register("content")}
                        disabled={isSubmitting}
                        className={`w-full bg-[#f8fafc] border rounded-2xl py-3 px-4 text-sm font-semibold text-slate-800 placeholder-slate-400 outline-none transition-all duration-200 resize-none disabled:opacity-50 ${
                            errors.content
                                ? "border-rose-400 focus:border-rose-500 focus:bg-white focus:ring-4 focus:ring-rose-500/10"
                                : "border-slate-200/80 focus:border-[#0066CC] focus:bg-white focus:ring-4 focus:ring-[#0066CC]/10"
                        }`}
                    />
                    {errors.content && (
                        <p className="text-xs text-rose-500 font-semibold pl-1">{errors.content.message}</p>
                    )}
                </div>

                <div className="pt-4 border-t border-slate-100">
                    <button
                        type="button"
                        data-testid="notification-send-link-toggle"
                        onClick={() => setIsDataCollapsed(!isDataCollapsed)}
                        className="flex items-center justify-between w-full py-2 text-left cursor-pointer group text-slate-500 hover:text-slate-800 transition-colors"
                        aria-expanded={showDataSection}
                    >
                        <span className="text-xs font-extrabold uppercase tracking-wider">
                            {t("send.label_data")}
                        </span>
                        {showDataSection ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>

                    {showDataSection && (
                        <div className="mt-3 space-y-2 animate-in fade-in duration-200">
                            <input
                                type="text"
                                placeholder={t("send.placeholder_data")}
                                data-testid="notification-send-link"
                                {...register("data")}
                                disabled={isSubmitting}
                                className={`w-full bg-[#f8fafc] border rounded-2xl py-3 px-4 text-sm font-semibold text-slate-800 placeholder-slate-400 outline-none transition-all duration-200 disabled:opacity-50 ${
                                    errors.data
                                        ? "border-rose-400 focus:border-rose-500 focus:bg-white focus:ring-4 focus:ring-rose-500/10"
                                        : "border-slate-200/80 focus:border-[#0066CC] focus:bg-white focus:ring-4 focus:ring-[#0066CC]/10"
                                }`}
                            />
                            <p className="text-[10px] font-bold text-slate-400 leading-normal pl-1">
                                {t("send.label_data_helper")}
                            </p>
                            {errors.data && (
                                <p className="text-xs text-rose-500 font-semibold pl-1">{errors.data.message}</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </form>
    );
};

export default NotificationSendForm;
