import { Ban } from "lucide-react";
import { useTranslation } from "react-i18next";

interface BlockUserDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    userName: string;
    isMutating?: boolean;
}

export const BlockUserDialog = ({
    isOpen,
    onClose,
    onConfirm,
    userName,
    isMutating = false,
}: BlockUserDialogProps) => {
    const { t } = useTranslation("user");

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-100 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="block-user-dialog-title"
            data-testid="block-user-dialog"
        >
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
                onClick={isMutating ? undefined : onClose}
            />

            <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl relative w-full max-w-md p-6 overflow-hidden animate-in scale-in duration-200 z-10">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0 shadow-sm">
                        <Ban size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3
                            id="block-user-dialog-title"
                            className="text-lg font-black text-slate-900 tracking-tight leading-none mb-2"
                        >
                            {t("dialog.block_title")}
                        </h3>
                        <p className="text-sm font-semibold text-slate-500 mb-4 leading-relaxed">
                            {t("dialog.block_confirm", { name: userName })}
                        </p>

                        <div className="bg-amber-50/50 border border-amber-200/50 rounded-2xl p-4 mb-6">
                            <p className="text-xs font-bold text-amber-800 leading-relaxed">
                                {t("dialog.block_warning")}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-slate-50 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isMutating}
                        className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-all font-bold text-sm cursor-pointer"
                    >
                        {t("dialog.btn_cancel")}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isMutating}
                        data-testid="block-user-dialog-confirm"
                        className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-500/20 hover:shadow-rose-600/30 disabled:opacity-50 transition-all font-bold text-sm flex items-center gap-2 cursor-pointer"
                    >
                        {isMutating && (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        )}
                        {t("dialog.btn_confirm_block")}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BlockUserDialog;
