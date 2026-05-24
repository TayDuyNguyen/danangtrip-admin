import { useTranslation } from "react-i18next";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Edit, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/routes/routes";
import { useAdminUserDetailQuery } from "@/hooks/useUserQueries";
import UserEditForm from "./components/UserEditForm";
import { Skeleton } from "@/components/ui/Skeleton";

export const UserEdit = () => {
    const { t } = useTranslation("user");
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    // Query user details
    const { data: user, isLoading, isError } = useAdminUserDetailQuery(id || "");

    const handleBack = () => {
        if (id) {
            navigate(ROUTES.USERS_DETAIL.replace(":id", id));
        } else {
            navigate(ROUTES.USERS_LIST);
        }
    };

    if (isError || (!isLoading && !user)) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#f8fafc] font-sans">
                <div className="bg-white p-8 rounded-3xl border border-slate-200/60 shadow-xl max-w-md text-center">
                    <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Edit className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">
                        {t("detail.not_found", "Không tìm thấy tài khoản")}
                    </h2>
                    <p className="text-slate-500 mb-8 text-sm font-semibold leading-relaxed">
                        {t("detail.not_found_desc", "Tài khoản người dùng này không tồn tại hoặc đã bị xóa.")}
                    </p>
                    <Button
                        onClick={() => navigate(ROUTES.USERS_LIST)}
                        className="w-full rounded-xl bg-[#14b8a6] hover:bg-[#0d9488] text-white font-bold h-12"
                    >
                        {t("detail.back_to_list", "Quay lại danh sách")}
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] pb-20 font-sans">
            {/* Sticky Header */}
            <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-xs">
                <div className="max-w-[1600px] mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            className="rounded-full w-10 h-10 p-0 hover:bg-slate-100 cursor-pointer"
                            onClick={handleBack}
                        >
                            <ArrowLeft className="w-5 h-5 text-slate-600" />
                        </Button>
                        <div>
                            <div className="flex items-center gap-2 mb-0.5">
                                <Edit className="w-4 h-4 text-[#14b8a6]" />
                                <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#14b8a6]">
                                    {t("edit.administration")}
                                </span>
                            </div>
                            <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none">
                                {t("edit.title")}
                            </h1>
                        </div>
                    </div>

                    <div className="hidden md:flex items-center gap-3">
                        {user && (
                            <Link
                                to={ROUTES.USERS_DETAIL.replace(":id", String(user.id))}
                                className="inline-flex items-center justify-center px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition-all h-10 cursor-pointer"
                            >
                                <span className="mr-1.5">{t("edit.quick_action_view_profile")}</span>
                                <span className="w-3.5 h-3.5">&rarr;</span>
                            </Link>
                        )}
                        <Button
                            variant="outline"
                            onClick={handleBack}
                            className="rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold cursor-pointer h-10"
                        >
                            {t("edit.btn_cancel")}
                        </Button>
                        <Button
                            form="user-edit-form"
                            type="submit"
                            disabled={isLoading}
                            className="rounded-xl bg-[#14b8a6] hover:bg-[#0d9488] text-white px-8 font-bold shadow-lg shadow-[#14b8a6]/20 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer h-10"
                        >
                            <Sparkles className="w-4 h-4 mr-2" />
                            {t("edit.btn_submit")}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="max-w-[1600px] mx-auto px-4 md:px-8 mt-8">
                {isLoading ? (
                    <div>
                        {/* Skeleton Header */}
                        <div className="mb-8 space-y-3">
                            <Skeleton className="w-64 h-4 rounded-md" />
                            <Skeleton className="w-96 h-8 rounded-md" />
                            <div className="flex items-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#14b8a6] border-b-transparent"></div>
                                <span className="text-xs text-[#94a3b8] font-bold">{t("common:loading", "Đang tải dữ liệu...")}</span>
                            </div>
                        </div>

                        {/* Skeleton Form Grid */}
                        <div className="flex flex-col lg:flex-row gap-8 items-start w-full">
                            <div className="flex-1 space-y-6 w-full lg:max-w-[70%]">
                                <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-xs space-y-6">
                                    <Skeleton className="w-48 h-6 rounded-md" />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="space-y-2 md:col-span-2"><Skeleton className="w-24 h-4 rounded-md" /><Skeleton className="w-full h-11 rounded-xl" /></div>
                                        <div className="space-y-2"><Skeleton className="w-24 h-4 rounded-md" /><Skeleton className="w-full h-11 rounded-xl" /></div>
                                        <div className="space-y-2"><Skeleton className="w-24 h-4 rounded-md" /><Skeleton className="w-full h-11 rounded-xl" /></div>
                                    </div>
                                </div>
                                <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-xs space-y-6">
                                    <Skeleton className="w-48 h-6 rounded-md" />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="space-y-2"><Skeleton className="w-24 h-4 rounded-md" /><Skeleton className="w-full h-11 rounded-xl" /></div>
                                        <div className="space-y-2"><Skeleton className="w-24 h-4 rounded-md" /><Skeleton className="w-full h-11 rounded-xl" /></div>
                                    </div>
                                </div>
                            </div>
                            <div className="w-full lg:w-80 space-y-6 shrink-0">
                                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
                                    <Skeleton className="w-full h-6 rounded-md" />
                                    <Skeleton className="w-full h-16 rounded-xl" />
                                    <Skeleton className="w-full h-16 rounded-xl" />
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="mb-8">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">
                                {t("breadcrumb")} / {user?.fullName} / {t("edit.breadcrumb_edit")}
                            </span>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1">
                                {t("edit.title")}
                            </h2>
                            <p className="text-slate-500 max-w-2xl text-sm font-medium leading-none">
                                {user?.username}
                            </p>
                        </div>

                        {/* Form Component */}
                        {user && <UserEditForm user={user} />}
                    </>
                )}
            </div>
        </div>
    );
};

export default UserEdit;
