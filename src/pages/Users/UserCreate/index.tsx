import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, UserPlus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/routes/routes";
import UserCreateForm from "./components/UserCreateForm";

export const UserCreate = () => {
    const { t } = useTranslation("user");
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#f8fafc] pb-20 font-sans">
            {/* Sticky Header */}
            <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-xs">
                <div className="max-w-[1600px] mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            className="rounded-full w-10 h-10 p-0 hover:bg-slate-100 cursor-pointer"
                            onClick={() => navigate(ROUTES.USERS_LIST)}
                        >
                            <ArrowLeft className="w-5 h-5 text-slate-600" />
                        </Button>
                        <div>
                            <div className="flex items-center gap-2 mb-0.5">
                                <UserPlus className="w-4 h-4 text-[#14b8a6]" />
                                <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#14b8a6]">
                                    {t("create.administration")}
                                </span>
                            </div>
                            <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none">
                                {t("create.title")}
                            </h1>
                        </div>
                    </div>

                    <div className="hidden md:flex items-center gap-3">
                        <Button
                            variant="outline"
                            onClick={() => navigate(ROUTES.USERS_LIST)}
                            className="rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold cursor-pointer"
                        >
                            {t("create.btn_cancel")}
                        </Button>
                        <Button
                            form="user-create-form"
                            type="submit"
                            className="rounded-xl bg-[#14b8a6] hover:bg-[#0d9488] text-white px-8 font-bold shadow-lg shadow-[#14b8a6]/20 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
                        >
                            <Sparkles className="w-4 h-4 mr-2" />
                            {t("create.btn_submit")}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="max-w-[1600px] mx-auto px-4 md:px-8 mt-8">
                <div className="mb-8">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">
                        {t("breadcrumb")} / {t("create.breadcrumb_create")}
                    </span>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-2">
                        {t("create.title")}
                    </h2>
                    <p className="text-slate-500 max-w-2xl text-sm font-medium">
                        {t("create.subtitle")}
                    </p>
                </div>

                {/* Form Component */}
                <UserCreateForm />
            </div>
        </div>
    );
};

export default UserCreate;
