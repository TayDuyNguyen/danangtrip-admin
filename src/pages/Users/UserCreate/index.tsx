import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { UserPlus, Sparkles, ArrowLeft } from "lucide-react";
import { ROUTES } from "@/routes/routes";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import { Button } from "@/components/ui/Button";
import UserCreateForm from "./components/UserCreateForm";
import { useUserMutations } from "@/hooks/useUserQueries";

export const UserCreate = () => {
    const { t } = useTranslation("user");
    const navigate = useNavigate();
    const { createUserMutation } = useUserMutations();

    return (
        <div className="min-h-screen bg-[#f8fafc] pb-20 font-sans">
            <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-xs">
                <div className="max-w-[1600px] mx-auto px-4 md:px-8 h-20 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                        <Button
                            type="button"
                            variant="ghost"
                            className="rounded-full w-10 h-10 p-0 hover:bg-slate-100 shrink-0"
                            onClick={() => navigate(ROUTES.USERS_LIST)}
                            aria-label={t("create.btn_cancel")}
                        >
                            <ArrowLeft className="w-5 h-5 text-slate-600" />
                        </Button>
                        <div className="min-w-0">
                            <div className="mb-1">
                                <Breadcrumbs
                                    icon={UserPlus}
                                    items={[
                                        { label: t("breadcrumb"), path: ROUTES.USERS_LIST, isRaw: true },
                                        { label: t("create.breadcrumb_create"), isRaw: true },
                                    ]}
                                />
                            </div>
                            <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none truncate">
                                {t("create.title")}
                            </h1>
                        </div>
                    </div>

                    <div className="hidden md:flex items-center gap-3 shrink-0">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate(ROUTES.USERS_LIST)}
                            className="rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold h-11 px-5"
                        >
                            {t("create.btn_cancel")}
                        </Button>
                        <Button
                            form="user-create-form"
                            type="submit"
                            isLoading={createUserMutation.isPending}
                            className="rounded-xl bg-[#14b8a6] hover:bg-[#0d9488] text-white px-8 font-bold shadow-lg shadow-[#14b8a6]/20 h-11"
                        >
                            <Sparkles className="w-4 h-4 mr-2" />
                            {t("create.btn_submit")}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="max-w-[1600px] mx-auto px-4 md:px-8 mt-8">
                <p className="text-sm font-semibold text-slate-400 mb-8 max-w-2xl">
                    {t("create.subtitle")}
                </p>
                <UserCreateForm />
            </div>
        </div>
    );
};

export default UserCreate;
