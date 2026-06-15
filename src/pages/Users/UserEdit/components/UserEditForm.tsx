import { useState, useEffect, useRef } from "react";
import { useForm, Controller, useWatch, type Resolver } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
    User,
    Mail,
    Phone,
    Calendar,
    MapPin,
    Users,
    FileText,
    Info,
    AlertTriangle,
    Trash2,
    Ban,
    LockOpen,
    ExternalLink
} from "lucide-react";

import { TextInput } from "@/components/ui/TextInput";
import CustomSelect, { type Option } from "@/components/ui/CustomSelect";
import ToggleSwitch from "@/components/ui/ToggleSwitch";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/routes/routes";
import { useAuth, useUserStore } from "@/store";
import { UnsavedChangesGuard } from "@/components/common/UnsavedChangesGuard";
import { ConfirmDeleteUserDialog } from "../../UserDetail/components/ConfirmDeleteUserDialog";
import CreateAdminConfirmDialog from "../../UserCreate/components/CreateAdminConfirmDialog";

import { editUserSchema, type EditUserInput } from "@/validations/user.schema";
import { useUserMutations } from "@/hooks/useUserQueries";
import type { UserItem } from "@/dataHelper";
import { showMutationErrorToast } from "@/utils/mutationErrorToast";

interface UserEditFormProps {
    user: UserItem;
    onSavePendingChange?: (pending: boolean) => void;
}

const ActionSpinner = ({ className = "" }: { className?: string }) => (
    <span
        className={`inline-block h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
        aria-hidden="true"
    />
);

export const UserEditForm = ({ user, onSavePendingChange }: UserEditFormProps) => {
    const { t, i18n } = useTranslation("user");
    const navigate = useNavigate();
    const { user: currentAdmin } = useAuth();
    const { updateUserMutation, updateStatusMutation, updateRoleMutation, deleteMutation } = useUserMutations();

    const isSelf = currentAdmin?.id === user.id;

    // Quick Actions dialog active states
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [adminConfirmOpen, setAdminConfirmOpen] = useState(false);
    const [pendingRole, setPendingRole] = useState<"admin" | "user" | null>(null);
    const [bypassGuard, setBypassGuard] = useState(false);

    const {
        register,
        control,
        handleSubmit,
        setError,
        setValue,
        getValues,
        reset,
        formState: { errors, isDirty }
    } = useForm<EditUserInput>({
        resolver: yupResolver(editUserSchema(t)) as Resolver<EditUserInput>,
        defaultValues: {
            full_name: user.fullName || "",
            email: user.email || "",
            phone: user.phone || "",
            birthdate: user.birthdate || "",
            gender: user.gender || "",
            city: user.city || "",
            role: user.role === "admin" ? "admin" : "user",
            status: user.status === "banned" ? "banned" : "active"
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    // Reset values when user prop changes (preserve unsaved edits on same user)
    const loadedUserIdRef = useRef<number | null>(null);

    useEffect(() => {
        if (!user) return;

        const formValues = {
            full_name: user.fullName || "",
            email: user.email || "",
            phone: user.phone || "",
            birthdate: user.birthdate || "",
            gender: user.gender || "",
            city: user.city || "",
            role: user.role === "admin" ? "admin" : "user",
            status: user.status === "banned" ? "banned" : "active"
        } as EditUserInput;

        if (loadedUserIdRef.current !== user.id) {
            loadedUserIdRef.current = user.id;
            reset(formValues);
            return;
        }

        if (!isDirty) {
            reset(formValues);
            return;
        }

        const serverStatus = user.status === "banned" ? "banned" : "active";
        if (getValues("status") !== serverStatus) {
            setValue("status", serverStatus, { shouldDirty: false });
        }

        const serverRole = user.role === "admin" ? "admin" : "user";
        if (getValues("role") !== serverRole) {
            setValue("role", serverRole, { shouldDirty: false });
        }
    }, [user, reset, isDirty, setValue, getValues]);

    useEffect(() => {
        onSavePendingChange?.(
            updateUserMutation.isPending || updateRoleMutation.isPending || updateStatusMutation.isPending
        );
    }, [
        onSavePendingChange,
        updateUserMutation.isPending,
        updateRoleMutation.isPending,
        updateStatusMutation.isPending,
    ]);

    const submitUser = (data: EditUserInput) => {
        updateUserMutation.mutate(
            {
                id: user.id,
                data: {
                    full_name: data.full_name,
                    email: data.email,
                    phone: data.phone || null,
                    birthdate: data.birthdate || null,
                    gender: data.gender || null,
                    city: data.city || null,
                }
            },
            {
                onSuccess: (res: unknown) => {
                    setAdminConfirmOpen(false);
                    setPendingRole(null);
                    setBypassGuard(true);
                    toast.success(t("edit.toast_update_success", "Cập nhật thông tin người dùng thành công!"));
                    reset(data);

                    const apiRes = res as { data?: { user?: { full_name: string; email: string; phone: string | null; birthdate: string | null; gender: string | null; city: string | null; avatar: string | null } } };
                    if (isSelf && apiRes?.data?.user) {
                        const updatedUser = apiRes.data.user;
                        const currentUser = useUserStore.getState().user;
                        if (currentUser) {
                            useUserStore.setState({
                                user: {
                                    ...currentUser,
                                    full_name: updatedUser.full_name,
                                    email: updatedUser.email,
                                    phone: updatedUser.phone,
                                    birthdate: updatedUser.birthdate,
                                    gender: updatedUser.gender,
                                    city: updatedUser.city,
                                    avatar: updatedUser.avatar,
                                }
                            });
                        }
                    }

                    setTimeout(() => {
                        navigate(ROUTES.USERS_DETAIL.replace(":id", String(user.id)));
                    }, 100);
                },
                onError: (error: unknown) => {
                    const axiosError = error as { response?: { status?: number; data?: { message?: string; errors?: Record<string, string[]> } } };
                    const responseData = axiosError?.response?.data;

                    if (axiosError?.response?.status === 422 && responseData?.errors) {
                        const backendErrors = responseData.errors;
                        Object.keys(backendErrors).forEach((key) => {
                            setError(key as keyof EditUserInput, {
                                type: "server",
                                message: backendErrors[key][0]
                            });
                        });

                        const firstErrorKey = Object.keys(backendErrors)[0];
                        const element = document.getElementsByName(firstErrorKey)[0];
                        if (element) {
                            element.scrollIntoView({ behavior: "smooth", block: "center" });
                        }
                        return;
                    }

                    showMutationErrorToast(t("toast.network_error"), error);
                }
            }
        );
    };

    const onSubmit = (data: EditUserInput) => {
        submitUser(data);
    };

    const applyRoleChange = (nextRole: "admin" | "user") => {
        if (isSelf) {
            toast.error(t("toast.self_action_error"));
            return;
        }
        if (user.role === nextRole || updateRoleMutation.isPending) return;

        if (nextRole === "admin" && user.role !== "admin") {
            setPendingRole("admin");
            setAdminConfirmOpen(true);
            return;
        }

        updateRoleMutation.mutate(
            { id: user.id, role: nextRole },
            {
                onSuccess: () => {
                    toast.success(t("detail.toast_role_success", "Cập nhật vai trò thành công."));
                    setValue("role", nextRole, { shouldDirty: false });
                },
                onError: (err: unknown) => {
                    showMutationErrorToast(t("detail.toast_role_error"), err);
                },
            }
        );
    };

    const handleConfirmAdminRole = () => {
        if (pendingRole === "admin") {
            updateRoleMutation.mutate(
                { id: user.id, role: "admin" },
                {
                    onSuccess: () => {
                        toast.success(t("detail.toast_role_success", "Cập nhật vai trò thành công."));
                        setValue("role", "admin", { shouldDirty: false });
                        setAdminConfirmOpen(false);
                        setPendingRole(null);
                    },
                    onError: (err: unknown) => {
                        showMutationErrorToast(t("detail.toast_role_error"), err);
                    },
                }
            );
        }
    };

    const handleCloseAdminConfirm = () => {
        if (updateUserMutation.isPending || updateRoleMutation.isPending) return;
        setAdminConfirmOpen(false);
        setPendingRole(null);
    };

    // Watch email changes to show warning
    const watchedEmail = useWatch({
        control,
        name: "email",
        defaultValue: user.email || "",
    });
    const showEmailWarning = watchedEmail && watchedEmail !== user.email;

    // Quick Action handlers
    const applyStatusChange = (nextStatus: "active" | "banned") => {
        if (isSelf) {
            toast.error(t("toast.self_action_error"));
            return;
        }
        if (user.status === nextStatus || updateStatusMutation.isPending) return;

        updateStatusMutation.mutate(
            { id: user.id, status: nextStatus },
            {
                onSuccess: () => {
                    toast.success(
                        nextStatus === "banned"
                            ? t("detail.toast_blocked_success", "Đã khóa tài khoản thành công.")
                            : t("detail.toast_unblocked_success", "Đã mở khóa tài khoản thành công.")
                    );
                    setValue("status", nextStatus, { shouldDirty: false });
                },
                onError: (err: unknown) => {
                    showMutationErrorToast(t("detail.toast_status_error"), err);
                }
            }
        );
    };

    const handleStatusToggle = () => {
        applyStatusChange(user.status === "active" ? "banned" : "active");
    };

    const handleDeleteSubmit = () => {
        if (isSelf) {
            toast.error(t("toast.self_action_error"));
            return;
        }

        deleteMutation.mutate(user.id, {
            onSuccess: () => {
                toast.success(t("edit.toast_delete_success", "Đã xóa tài khoản người dùng thành công."));
                setIsDeleteDialogOpen(false);
                setBypassGuard(true);
                setTimeout(() => {
                    navigate(ROUTES.USERS_LIST);
                }, 100);
            },
            onError: (err: unknown) => {
                showMutationErrorToast(t("detail.toast_delete_error"), err);
            }
        });
    };

    // Gender selection options
    const genderOptions: Option[] = [
        { value: "male", label: t("detail.gender_male") },
        { value: "female", label: t("detail.gender_female") },
        { value: "other", label: t("detail.gender_other") }
    ];

    const dateLocale = i18n.language?.startsWith("vi") ? "vi-VN" : "en-US";
    const formattedJoinDate = user.createdAt ? new Date(user.createdAt).toLocaleString(dateLocale) : "N/A";
    const formattedUpdateDate = user.updatedAt ? new Date(user.updatedAt).toLocaleString(dateLocale) : "N/A";

    return (
        <form
            id="user-edit-form"
            noValidate
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col lg:flex-row gap-8 items-start w-full"
        >
            {/* React Router Unsaved Changes Guard */}
            <UnsavedChangesGuard isDirty={isDirty && !bypassGuard} />

            {/* Left Column: Form Fields */}
            <div className="flex-1 space-y-6 w-full lg:max-w-[70%]">
                {/* Account Credentials Card */}
                <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/60 shadow-xs transition-all duration-300 hover:shadow-md">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                        <div className="flex items-center justify-center w-10 h-10 bg-[#eff6ff] rounded-xl text-[#0066cc]">
                            <FileText className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-slate-800 tracking-tight">
                                {t("edit.section_account_info")}
                            </h3>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Họ tên đầy đủ */}
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                                {t("detail.label_full_name")} <span className="text-red-500">*</span>
                            </label>
                            <TextInput
                                placeholder={t("create.placeholder_full_name")}
                                {...register("full_name")}
                                invalid={!!errors.full_name}
                                leftIcon={<User className="w-4 h-4 text-slate-400" />}
                            />
                            {errors.full_name && (
                                <p className="text-xs text-red-500 font-semibold">{errors.full_name.message}</p>
                            )}
                        </div>

                        {/* Username READONLY */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                                {t("detail.label_username")}
                            </label>
                            <div className="flex items-center gap-2 h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl">
                                <span className="text-sm font-semibold text-slate-400">@</span>
                                <span className="text-sm font-mono text-slate-600 font-semibold truncate">
                                    {(user.username || "@user").replace(/^@/, "") || "—"}
                                </span>
                                <span className="ml-auto px-2 py-0.5 text-[10px] font-bold text-slate-400 bg-slate-200/50 rounded-md uppercase tracking-wide shrink-0">
                                    {t("edit.username_readonly_badge", "Không thể thay đổi")}
                                </span>
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                                {t("detail.label_email")} <span className="text-red-500">*</span>
                            </label>
                            <TextInput
                                type="email"
                                placeholder={t("create.placeholder_email")}
                                {...register("email")}
                                invalid={!!errors.email}
                                leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
                                autoComplete="off"
                            />
                            {errors.email && (
                                <p className="text-xs text-red-500 font-semibold">{errors.email.message}</p>
                            )}

                            {/* Email change warning */}
                            {showEmailWarning && (
                                <div className="bg-amber-50 border border-amber-200/60 rounded-xl p-3 mt-2 flex gap-2.5 animate-in fade-in slide-in-from-top-1 duration-200">
                                    <AlertTriangle className="text-amber-500 w-4 h-4 shrink-0 mt-0.5" />
                                    <span className="text-xs font-semibold text-amber-800 leading-normal">
                                        {t("edit.email_warning", "Thay đổi địa chỉ email sẽ yêu cầu người dùng xác thực lại tài khoản.")}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Password Info Box */}
                        <div className="md:col-span-2 bg-[#eff6ff]/60 border border-[#b3d9ff]/50 rounded-2xl p-4 flex gap-3">
                            <Info className="w-5 h-5 text-[#0066cc] shrink-0 mt-0.5" />
                            <span className="text-xs font-semibold text-[#1e293b] leading-relaxed">
                                {t("edit.password_warning", "Để đổi mật khẩu, vui lòng yêu cầu người dùng sử dụng chức năng 'Quên mật khẩu' hoặc liên hệ quản trị viên cấp cao.")}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Additional Information Card */}
                <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/60 shadow-xs transition-all duration-300 hover:shadow-md">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                        <div className="flex items-center justify-center w-10 h-10 bg-[#eff6ff] rounded-xl text-[#0066cc]">
                            <FileText className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-slate-800 tracking-tight uppercase tracking-wider">
                                {t("create.section_additional_info")}
                            </h3>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Số điện thoại */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                                {t("detail.label_phone")}
                            </label>
                            <TextInput
                                type="tel"
                                placeholder={t("create.placeholder_phone")}
                                {...register("phone")}
                                invalid={!!errors.phone}
                                leftIcon={<Phone className="w-4 h-4 text-slate-400" />}
                            />
                            {errors.phone && (
                                <p className="text-xs text-red-500 font-semibold">{errors.phone.message}</p>
                            )}
                        </div>

                        {/* Ngày sinh */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                                {t("detail.label_birthdate")}
                            </label>
                            <TextInput
                                type="date"
                                {...register("birthdate")}
                                invalid={!!errors.birthdate}
                                leftIcon={<Calendar className="w-4 h-4 text-slate-400" />}
                            />
                            {errors.birthdate && (
                                <p className="text-xs text-red-500 font-semibold">{errors.birthdate.message}</p>
                            )}
                        </div>

                        {/* Giới tính */}
                        <Controller
                            name="gender"
                            control={control}
                            render={({ field }) => (
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                                        {t("detail.label_gender")}
                                    </label>
                                    <CustomSelect
                                        options={genderOptions}
                                        value={genderOptions.find((o) => o.value === field.value) || null}
                                        onChange={(opt: Option | null) => field.onChange(opt?.value || "")}
                                        placeholder={t("create.placeholder_gender")}
                                    />
                                </div>
                            )}
                        />

                        {/* Thành phố */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                                {t("detail.label_city")}
                            </label>
                            <TextInput
                                placeholder={t("create.placeholder_city")}
                                {...register("city")}
                                invalid={!!errors.city}
                                leftIcon={<MapPin className="w-4 h-4 text-slate-400" />}
                            />
                            {errors.city && (
                                <p className="text-xs text-red-500 font-semibold">{errors.city.message}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column: Sidebar settings */}
            <div className="w-full lg:w-80 space-y-6 shrink-0 lg:sticky lg:top-28">
                {/* Account Config Card */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-xs">
                    <h4 className="text-sm font-bold text-slate-800 tracking-tight mb-5 flex items-center gap-2">
                        <Users className="w-4 h-4 text-[#14b8a6]" />
                        {t("create.settings_title")}
                    </h4>

                    {/* Role Selection — applies immediately via PATCH */}
                    <div className="space-y-3 mb-6">
                        <div className="flex items-center justify-between gap-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                                {t("create.settings_role")}
                            </label>
                            {updateRoleMutation.isPending && (
                                <ActionSpinner className="text-[#14b8a6]" />
                            )}
                        </div>
                        <div className="flex flex-col gap-2" data-testid="user-edit-role-group">
                            {/* Option User */}
                            <label
                                className={`flex items-start gap-3 p-3 rounded-2xl border transition-all ${isSelf || updateRoleMutation.isPending ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                                    } ${user.role === "user"
                                        ? "bg-slate-50 border-slate-300 shadow-2xs"
                                        : "border-slate-100 hover:bg-slate-50/50"
                                    }`}
                            >
                                <input
                                    type="radio"
                                    name="user-edit-role"
                                    value="user"
                                    disabled={isSelf || updateRoleMutation.isPending}
                                    checked={user.role === "user"}
                                    onChange={() => applyRoleChange("user")}
                                    className="mt-1 accent-[#14b8a6] cursor-pointer disabled:cursor-not-allowed"
                                />
                                <div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-xs font-extrabold text-slate-700">USER</span>
                                        <span className="px-1.5 py-0.5 text-[8px] font-black uppercase text-slate-400 bg-slate-100 rounded-md">
                                            DEFAULT
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-bold leading-normal mt-0.5">
                                        {t("detail.role_user_desc")}
                                    </p>
                                </div>
                            </label>

                            {/* Option Admin */}
                            <label
                                className={`flex items-start gap-3 p-3 rounded-2xl border transition-all ${isSelf || updateRoleMutation.isPending ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                                    } ${user.role === "admin"
                                        ? "bg-rose-50/30 border-rose-200 shadow-2xs"
                                        : "border-slate-100 hover:bg-slate-50/50"
                                    }`}
                            >
                                <input
                                    type="radio"
                                    name="user-edit-role"
                                    value="admin"
                                    disabled={isSelf || updateRoleMutation.isPending}
                                    checked={user.role === "admin"}
                                    onChange={() => applyRoleChange("admin")}
                                    className="mt-1 accent-rose-500 cursor-pointer disabled:cursor-not-allowed"
                                />
                                <div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-xs font-extrabold text-rose-700">ADMIN</span>
                                        <span className="px-1.5 py-0.5 text-[8px] font-black uppercase text-rose-600 bg-rose-50 rounded-md">
                                            FULL POWER
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-rose-500/80 font-bold leading-normal mt-0.5">
                                        {t("detail.role_admin_desc")}
                                    </p>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Status Toggle Switch — applies immediately via PATCH (same as quick lock) */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                            <span className="text-xs font-extrabold text-slate-700 block">
                                {t("create.settings_status")}
                            </span>
                            <span className="text-[10px] font-medium text-slate-400">
                                {t("create.settings_status_desc")}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0" data-testid="user-edit-status-toggle">
                            {updateStatusMutation.isPending && (
                                <ActionSpinner className="text-[#14b8a6]" />
                            )}
                            <ToggleSwitch
                                enabled={user.status === "active"}
                                disabled={isSelf || updateStatusMutation.isPending}
                                onChange={(enabled: boolean) =>
                                    applyStatusChange(enabled ? "active" : "banned")
                                }
                            />
                        </div>
                    </div>

                    {/* Account Metadata block */}
                    <div className="mt-5 pt-4 border-t border-slate-100 space-y-3 font-sans">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            {t("edit.info_section", "THÔNG TIN")}
                        </span>

                        <div className="flex justify-between items-center text-xs font-semibold">
                            <span className="text-slate-400">{t("edit.joined_date_label", "Ngày tham gia")}</span>
                            <span className="text-slate-600 text-right">{formattedJoinDate}</span>
                        </div>

                        <div className="flex justify-between items-center text-xs font-semibold">
                            <span className="text-slate-400">{t("edit.last_updated_label", "Cập nhật lần cuối")}</span>
                            <span className="text-slate-600 text-right">{formattedUpdateDate}</span>
                        </div>

                        <div className="flex justify-between items-center text-xs font-semibold pt-1">
                            <span className="text-slate-400">{t("detail.label_email_verification_status", "Xác thực email")}</span>
                            {user.isEmailVerified ? (
                                <span className="px-2 py-0.5 text-[9px] font-black bg-emerald-50 text-emerald-600 border border-emerald-200/50 rounded-md">
                                    {t("edit.verification_verified", "ĐÃ XÁC THỰC")}
                                </span>
                            ) : (
                                <span className="px-2 py-0.5 text-[9px] font-black bg-amber-50 text-amber-600 border border-amber-200/50 rounded-md">
                                    {t("edit.verification_unverified", "CHƯA XÁC THỰC")}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Card mới: Thao tác nhanh */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-xs space-y-3">
                    <h4 className="text-sm font-bold text-slate-800 tracking-tight mb-2">
                        {t("edit.quick_actions_title", "Thao tác nhanh")}
                    </h4>

                    {/* Xem hồ sơ */}
                    <button
                        type="button"
                        aria-label={t("edit.quick_action_view_profile", "Xem hồ sơ")}
                        onClick={() => navigate(ROUTES.USERS_DETAIL.replace(":id", String(user.id)))}
                        className="w-full flex items-center gap-2 h-10 px-4 border border-slate-200 hover:border-[#0066cc] hover:text-[#0066cc] bg-white text-slate-600 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                        <User size={13} />
                        <span>{t("edit.quick_action_view_profile", "Xem hồ sơ")}</span>
                        <ExternalLink size={11} className="ml-auto opacity-60" />
                    </button>

                    {/* Xem đơn hàng */}
                    <button
                        type="button"
                        aria-label={t("edit.quick_action_view_bookings", "Xem đơn hàng")}
                        onClick={() => navigate(`${ROUTES.BOOKINGS_LIST}?user_id=${user.id}`)}
                        className="w-full flex items-center gap-2 h-10 px-4 border border-slate-200 hover:border-[#0066cc] hover:text-[#0066cc] bg-white text-slate-600 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                        <FileText size={13} />
                        <span>{t("edit.quick_action_view_bookings", "Xem đơn hàng")}</span>
                        <ExternalLink size={11} className="ml-auto opacity-60" />
                    </button>

                    {/* Khóa/Mở khóa tài khoản */}
                    {!isSelf && (
                        user.status === "active" ? (
                            <button
                                type="button"
                                aria-label={t("edit.quick_action_lock", "Khóa tài khoản")}
                                onClick={handleStatusToggle}
                                disabled={updateStatusMutation.isPending}
                                className="w-full flex items-center gap-2 h-10 px-4 border border-rose-100 hover:bg-rose-50 text-rose-600 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {updateStatusMutation.isPending ? (
                                    <ActionSpinner className="text-rose-500" />
                                ) : (
                                    <Ban size={13} />
                                )}
                                <span>
                                    {updateStatusMutation.isPending
                                        ? t("edit.btn_submitting")
                                        : t("edit.quick_action_lock", "Khóa tài khoản")}
                                </span>
                            </button>
                        ) : (
                            <button
                                type="button"
                                aria-label={t("edit.quick_action_unlock", "Mở khóa tài khoản")}
                                onClick={handleStatusToggle}
                                disabled={updateStatusMutation.isPending}
                                className="w-full flex items-center gap-2 h-10 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {updateStatusMutation.isPending ? (
                                    <ActionSpinner className="text-white" />
                                ) : (
                                    <LockOpen size={13} />
                                )}
                                <span>
                                    {updateStatusMutation.isPending
                                        ? t("edit.btn_submitting")
                                        : t("edit.quick_action_unlock", "Mở khóa tài khoản")}
                                </span>
                            </button>
                        )
                    )}

                    {/* Xóa tài khoản */}
                    {!isSelf && (
                        <button
                            type="button"
                            aria-label={t("edit.quick_action_delete", "Xóa tài khoản")}
                            onClick={() => setIsDeleteDialogOpen(true)}
                            disabled={deleteMutation.isPending}
                            className="w-full flex items-center gap-2 h-10 px-4 border border-rose-100 hover:bg-rose-50 text-rose-600 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {deleteMutation.isPending ? (
                                <ActionSpinner className="text-rose-500" />
                            ) : (
                                <Trash2 size={13} />
                            )}
                            <span>
                                {deleteMutation.isPending
                                    ? t("edit.btn_submitting")
                                    : t("edit.quick_action_delete", "Xóa tài khoản")}
                            </span>
                        </button>
                    )}
                </div>

                {/* Mobile/Form footer actions */}
                <div className="flex flex-col gap-3 w-full md:hidden">
                    <Button
                        form="user-edit-form"
                        type="submit"
                        disabled={updateUserMutation.isPending}
                        className="w-full rounded-2xl bg-[#14b8a6] hover:bg-[#0d9488] text-white h-14 font-bold shadow-lg shadow-[#14b8a6]/20 transition-all hover:scale-[1.01] active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                        isLoading={updateUserMutation.isPending}
                    >
                        {updateUserMutation.isPending
                            ? t("edit.btn_submitting")
                            : t("edit.btn_submit")}
                    </Button>
                    <Button
                        variant="ghost"
                        className="w-full text-slate-500 font-bold h-12 cursor-pointer"
                        onClick={() => navigate(ROUTES.USERS_LIST)}
                    >
                        {t("edit.btn_cancel")}
                    </Button>
                </div>
            </div>

            {/* Confirm Delete Dialog */}
            <ConfirmDeleteUserDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={handleDeleteSubmit}
                userName={user.fullName}
                isDeleting={deleteMutation.isPending}
            />

            <CreateAdminConfirmDialog
                isOpen={adminConfirmOpen}
                onClose={handleCloseAdminConfirm}
                onConfirm={handleConfirmAdminRole}
                userName={user.fullName}
                isMutating={updateUserMutation.isPending || updateRoleMutation.isPending}
            />
        </form>
    );
};

export default UserEditForm;
