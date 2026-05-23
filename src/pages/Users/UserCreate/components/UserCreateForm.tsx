import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
    User,
    Mail,
    Lock,
    Eye,
    EyeOff,
    Phone,
    Calendar,
    MapPin,
    Users,
    Key,
    FileText,
    HelpCircle
} from "lucide-react";

import { TextInput } from "@/components/ui/TextInput";
import CustomSelect, { type Option } from "@/components/ui/CustomSelect";
import ToggleSwitch from "@/components/ui/ToggleSwitch";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/routes/routes";

import { createUserSchema, type CreateUserInput } from "@/validations/user.schema";
import { useUserMutations } from "@/hooks/useUserQueries";

export const UserCreateForm = () => {
    const { t } = useTranslation("user");
    const navigate = useNavigate();
    const { createUserMutation } = useUserMutations();

    // Password view toggles
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const {
        register,
        control,
        handleSubmit,
        setError,
        formState: { errors }
    } = useForm<CreateUserInput>({
        resolver: yupResolver(createUserSchema(t)),
        defaultValues: {
            full_name: "",
            username: "",
            email: "",
            password: "",
            password_confirmation: "",
            phone: "",
            birthdate: "",
            gender: "",
            city: "",
            role: "user",
            status: "active"
        }
    } as any); // eslint-disable-line @typescript-eslint/no-explicit-any

    const onSubmit = (data: CreateUserInput) => {
        createUserMutation.mutate(
            {
                username: data.username,
                email: data.email,
                password: data.password,
                full_name: data.full_name,
                phone: data.phone || null,
                birthdate: data.birthdate || null,
                gender: data.gender || null,
                city: data.city || null,
                role: data.role,
                status: data.status
            },
            {
                onSuccess: (response: unknown) => {
                    toast.success(t("validation.create_success"));
                    const resData = response as { data?: { user?: { id?: number } }; id?: number };
                    const createdUserId = resData?.data?.user?.id || resData?.id;
                    if (createdUserId) {
                        navigate(ROUTES.USERS_DETAIL.replace(":id", String(createdUserId)));
                    } else {
                        navigate(ROUTES.USERS_LIST);
                    }
                },
                onError: (error: unknown) => {
                    const axiosError = error as { response?: { status?: number; data?: { message?: string; errors?: Record<string, string[]> } } };
                    const responseData = axiosError?.response?.data;
                    // Handle validation errors from Laravel backend (422)
                    if (axiosError?.response?.status === 422 && responseData?.errors) {
                        const backendErrors = responseData.errors;
                        Object.keys(backendErrors).forEach((key) => {
                            setError(key as keyof CreateUserInput, {
                                type: "server",
                                message: backendErrors[key][0]
                            });
                        });
                        toast.error(responseData?.message || t("toast.network_error"));
                        
                        // Scroll to the first error input field
                        const firstErrorKey = Object.keys(backendErrors)[0];
                        const element = document.getElementsByName(firstErrorKey)[0];
                        if (element) {
                            element.scrollIntoView({ behavior: "smooth", block: "center" });
                        }
                    } else {
                        toast.error(responseData?.message || t("toast.network_error"));
                    }
                }
            }
        );
    };

    // Gender selection options
    const genderOptions: Option[] = [
        { value: "male", label: t("detail.gender_male") },
        { value: "female", label: t("detail.gender_female") },
        { value: "other", label: t("detail.gender_other") }
    ];

    return (
        <form
            id="user-create-form"
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col lg:flex-row gap-8 items-start w-full"
        >
            {/* Left Column: Form Fields */}
            <div className="flex-1 space-y-6 w-full lg:max-w-[70%]">
                {/* Account Credentials Card */}
                <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/60 shadow-xs transition-all duration-300 hover:shadow-md">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                        <div className="flex items-center justify-center w-10 h-10 bg-[#eff6ff] rounded-xl text-[#0066cc]">
                            <Key className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-slate-800 tracking-tight">
                                {t("create.section_account_info")}
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

                        {/* Username */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                                {t("detail.label_username")} <span className="text-red-500">*</span>
                            </label>
                            <TextInput
                                placeholder={t("create.placeholder_username")}
                                {...register("username")}
                                invalid={!!errors.username}
                                leftIcon={<span className="text-sm font-bold text-slate-400">@</span>}
                                autoComplete="new-username"
                            />
                            <p className="text-[10px] text-slate-400 font-semibold pl-1">
                                {t("create.helper_username")}
                            </p>
                            {errors.username && (
                                <p className="text-xs text-red-500 font-semibold mt-1">{errors.username.message}</p>
                            )}
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
                        </div>

                        {/* Password */}
                        <div className="space-y-2 relative">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                                {t("create.label_password")} <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <TextInput
                                    type={showPassword ? "text" : "password"}
                                    placeholder={t("create.placeholder_password")}
                                    {...register("password")}
                                    invalid={!!errors.password}
                                    leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            <p className="text-[10px] text-slate-400 font-semibold pl-1">
                                {t("create.helper_password")}
                            </p>
                            {errors.password && (
                                <p className="text-xs text-red-500 font-semibold mt-1">{errors.password.message}</p>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-2 relative">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                                {t("create.label_password_confirm")} <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <TextInput
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder={t("create.placeholder_password_confirm")}
                                    {...register("password_confirmation")}
                                    invalid={!!errors.password_confirmation}
                                    leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                                >
                                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {errors.password_confirmation && (
                                <p className="text-xs text-red-500 font-semibold">{errors.password_confirmation.message}</p>
                            )}
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

                    {/* Role Selection */}
                    <div className="space-y-3 mb-6">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                            {t("create.settings_role")}
                        </label>
                        <Controller
                            name="role"
                            control={control}
                            render={({ field }) => (
                                <div className="flex flex-col gap-2">
                                    {/* Option User */}
                                    <label
                                        className={`flex items-start gap-3 p-3 rounded-2xl border transition-all cursor-pointer ${
                                            field.value === "user"
                                                ? "bg-slate-50 border-slate-300 shadow-2xs"
                                                : "border-slate-100 hover:bg-slate-50/50"
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            value="user"
                                            checked={field.value === "user"}
                                            onChange={() => field.onChange("user")}
                                            className="mt-1 accent-[#14b8a6] cursor-pointer"
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
                                        className={`flex items-start gap-3 p-3 rounded-2xl border transition-all cursor-pointer ${
                                            field.value === "admin"
                                                ? "bg-rose-50/30 border-rose-200 shadow-2xs"
                                                : "border-slate-100 hover:bg-slate-50/50"
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            value="admin"
                                            checked={field.value === "admin"}
                                            onChange={() => field.onChange("admin")}
                                            className="mt-1 accent-rose-500 cursor-pointer"
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
                            )}
                        />
                    </div>

                    {/* Status Toggle Switch */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                        <div>
                            <span className="text-xs font-extrabold text-slate-700 block">
                                {t("create.settings_status")}
                            </span>
                            <span className="text-[10px] font-medium text-slate-400">
                                {t("create.settings_status_desc")}
                            </span>
                        </div>
                        <Controller
                            name="status"
                            control={control}
                            render={({ field }) => (
                                <ToggleSwitch
                                    enabled={field.value === "active"}
                                    onChange={(enabled: boolean) => field.onChange(enabled ? "active" : "banned")}
                                />
                            )}
                        />
                    </div>
                </div>

                {/* Important Notes Card */}
                <div className="bg-[#eff6ff]/60 border border-[#b3d9ff]/50 rounded-3xl p-6">
                    <h5 className="text-xs font-extrabold text-[#0066cc] uppercase tracking-wider mb-4 flex items-center gap-2">
                        <HelpCircle className="w-4 h-4" />
                        {t("create.helper_card_title")}
                    </h5>

                    <ul className="space-y-3">
                        <li className="text-[11px] font-bold text-slate-600 flex items-start gap-2">
                            <span className="text-[#0066cc] font-black mt-0.5">•</span>
                            <span>{t("create.helper_card_item1")}</span>
                        </li>
                        <li className="text-[11px] font-bold text-slate-600 flex items-start gap-2">
                            <span className="text-[#0066cc] font-black mt-0.5">•</span>
                            <span>{t("create.helper_card_item2")}</span>
                        </li>
                        <li className="text-[11px] font-bold text-slate-600 flex items-start gap-2">
                            <span className="text-[#0066cc] font-black mt-0.5">•</span>
                            <span>{t("create.helper_card_item3")}</span>
                        </li>
                        <li className="text-[11px] font-bold text-rose-600 flex items-start gap-2">
                            <span className="text-rose-500 font-black mt-0.5">•</span>
                            <span>{t("create.helper_card_item4")}</span>
                        </li>
                    </ul>
                </div>

                {/* Mobile/Form footer actions */}
                <div className="flex flex-col gap-3 w-full">
                    <Button
                        form="user-create-form"
                        type="submit"
                        className="w-full rounded-2xl bg-[#14b8a6] hover:bg-[#0d9488] text-white h-14 font-bold shadow-lg shadow-[#14b8a6]/20 transition-all hover:scale-[1.01] active:scale-95 cursor-pointer"
                        isLoading={createUserMutation.isPending}
                    >
                        {t("create.btn_submit")}
                    </Button>
                    <Button
                        variant="ghost"
                        className="w-full text-slate-500 font-bold h-12 cursor-pointer"
                        onClick={() => navigate(ROUTES.USERS_LIST)}
                    >
                        {t("create.btn_cancel")}
                    </Button>
                </div>
            </div>
        </form>
    );
};

export default UserCreateForm;
