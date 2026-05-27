import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { UserPlus, Sparkles } from "lucide-react";
import { ROUTES } from "@/routes/routes";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import UserCreateForm from "./components/UserCreateForm";

export const UserCreate = () => {
    const { t } = useTranslation("user");
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#f8fafc] pb-20 font-sans">
            <div className="max-w-[1600px] mx-auto px-4 md:px-8 mt-8">
                <div className="mb-8">
                    <Breadcrumbs
                        icon={UserPlus}
                        items={[
                            { label: t("breadcrumb"), path: ROUTES.USERS_LIST },
                            { label: t("create.breadcrumb_create") },
                        ]}
                        actions={[
                            {
                                label: t("create.btn_cancel"),
                                onClick: () => navigate(ROUTES.USERS_LIST),
                                variant: "outline",
                            },
                            {
                                label: t("create.btn_submit"),
                                form: "user-create-form",
                                type: "submit",
                                icon: Sparkles,
                                variant: "primary",
                            },
                        ]}
                    />
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-2 mt-4">
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
