import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Edit, ArrowLeft, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/routes/routes";
import { useAdminUserDetailQuery } from "@/hooks/useUserQueries";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import UserEditForm from "./components/UserEditForm";
import { Skeleton } from "@/components/ui/Skeleton";

export const UserEdit = () => {
    const { t } = useTranslation("user");
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams<{ id: string }>();

    // Query user details
    const { data: user, isLoading, isError } = useAdminUserDetailQuery(id || "");

    useEffect(() => {
        const listFilterKeys = ["q", "sort_by", "sort_order", "page", "per_page", "role", "status"];
        const params = new URLSearchParams(location.search);
        if (listFilterKeys.some((key) => params.has(key))) {
            navigate(location.pathname, { replace: true });
        }
    }, [location.pathname, location.search, navigate]);

    const handleBack = () => {
        navigate(ROUTES.USERS_LIST);
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
                <div className="max-w-[1600px] mx-auto px-4 md:px-8 h-20 flex items-center">
                    {/* Header Left: Breadcrumb + Title */}
                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            className="rounded-full w-10 h-10 p-0 hover:bg-slate-100 cursor-pointer flex items-center justify-center border-0 bg-transparent text-slate-600"
                            onClick={handleBack}
                        >
                            <ArrowLeft className="w-5 h-5 text-slate-600" />
                        </button>
                        <div>
                            <div className="mb-1">
                                <Breadcrumbs
                                    icon={Users}
                                    items={[
                                        { label: t("breadcrumb"), path: ROUTES.USERS_LIST },
                                        { label: t("edit.breadcrumb_edit", "Chỉnh sửa") },
                                    ]}
                                />
                            </div>
                            <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none">
                                {t("edit.title", "Chỉnh sửa Người dùng")}
                            </h1>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Form Content */}
            <div className="max-w-[1600px] mx-auto px-4 md:px-8 mt-8">
                {isLoading ? (
                    <div>
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
                        {/* Form Component */}
                        {user && <UserEditForm user={user} />}
                    </>
                )}
            </div>
        </div>
    );
};

export default UserEdit;
