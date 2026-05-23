import { ShieldAlert } from "lucide-react";
import { useTranslation } from "react-i18next";

interface UpdateRoleDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    userName: string;
    isMutating?: boolean;
}

export const UpdateRoleDialog = ({
    isOpen,
    onClose,
    onConfirm,
    userName,
    isMutating = false,
}: UpdateRoleDialogProps) => {
    const { t } = useTranslation("user");

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
                onClick={isMutating ? undefined : onClose}
            ></div>

            {/* Modal */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl relative w-full max-w-md p-6 overflow-hidden animate-in scale-in duration-200 z-10">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0 shadow-sm">
                        <ShieldAlert size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-black text-slate-900 tracking-tight leading-none mb-2">
                            {t("dialog.role_title")}
                        </h3>
                        <p className="text-sm font-semibold text-slate-500 mb-6 leading-relaxed">
                            {t("dialog.role_confirm", { name: userName })}
                        </p>
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-3 border-t border-slate-50 pt-4">
                    <button
                        onClick={onClose}
                        disabled={isMutating}
                        className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-all font-bold text-sm cursor-pointer"
                    >
                        {t("dialog.btn_cancel")}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isMutating}
                        className="px-5 py-2.5 rounded-xl bg-[#14B8A6] hover:bg-[#0f766e] text-white shadow-lg shadow-[#14B8A6]/20 hover:shadow-[#0f766e]/30 disabled:opacity-50 transition-all font-bold text-sm flex items-center gap-2 cursor-pointer"
                    >
                        {isMutating && (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        )}
                        {t("dialog.btn_confirm_role")}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UpdateRoleDialog;
