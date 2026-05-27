import { Copy } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";

interface DuplicateConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export const DuplicateConfirmDialog = ({
    isOpen,
    onClose,
    onConfirm,
}: DuplicateConfirmDialogProps) => {
    const { t } = useTranslation("blog");

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-100 shadow-2xl relative z-10 animate-in zoom-in-95 duration-200 flex flex-col items-center text-center font-sans">
                {/* Copy Icon Container */}
                <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600 mb-4">
                    <Copy size={22} className="text-[#14B8A6]" />
                </div>

                {/* Text Description */}
                <h3 className="text-slate-900 font-bold text-lg tracking-tight mb-2">
                    {t("duplicate_confirm_title", { defaultValue: "Nhân bản bài viết này?" })}
                </h3>
                <p className="text-slate-500 text-sm font-semibold mb-6 px-2 leading-relaxed">
                    {t("duplicate_confirm_body", { defaultValue: "Một bài viết mới sẽ được tạo với nội dung được điền sẵn từ bài viết hiện tại." })}
                </p>

                {/* Footer Buttons */}
                <div className="flex items-center gap-3 w-full">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="flex-1 rounded-2xl py-3 border-slate-200 text-slate-500 hover:bg-slate-50 font-bold"
                    >
                        {t("actions.cancel", { defaultValue: "Hủy" })}
                    </Button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 rounded-2xl py-3 bg-[#14B8A6] hover:bg-[#0f766e] text-white font-bold active:scale-[0.98] transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-teal-500/20"
                    >
                        <Copy size={16} />
                        {t("actions.confirm", { defaultValue: "Xác nhận" })}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DuplicateConfirmDialog;
