import { useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Send, Info } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ReplyFormProps {
    email: string;
    onSubmit: (data: { reply: string }) => void;
    isSubmitting?: boolean;
}

export const ReplyForm = ({
    email,
    onSubmit,
    isSubmitting = false,
}: ReplyFormProps) => {
    const { t } = useTranslation("contact");

    const replySchema = yup.object().shape({
        reply: yup
            .string()
            .required(t("validation.reply_required"))
            .min(10, t("validation.reply_min"))
            .max(2000, t("validation.reply_max")),
    });

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(replySchema),
        defaultValues: {
            reply: "",
        },
    });

    const replyContent = useWatch({
        control,
        name: "reply",
        defaultValue: "",
    });

    const handleFormSubmit = (data: { reply: string }) => {
        onSubmit(data);
    };

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            {/* Header label */}
            <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0">
                    <Send size={14} className="rotate-315" />
                </div>
                <h4 className="text-slate-900 text-sm font-black tracking-tight">
                    {t("detail.reply_section_title")}
                </h4>
            </div>

            {/* Target email info panel */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center gap-3">
                <Send size={16} className="text-slate-400 shrink-0" />
                <span className="text-xs font-bold text-slate-500 truncate">
                    {t("detail.reply_to", { email })}
                </span>
            </div>

            {/* Textarea container */}
            <div className="relative">
                <textarea
                    rows={5}
                    {...register("reply")}
                    placeholder={t("detail.reply_placeholder")}
                    className={`
                        w-full rounded-2xl p-4 border text-sm font-medium focus:outline-hidden transition-all duration-200 resize-none
                        ${errors.reply 
                            ? "border-rose-400 focus:border-rose-500 bg-rose-50/10" 
                            : "border-slate-200 focus:border-[#14b8a6] focus:ring-1 focus:ring-[#14b8a6]/20 bg-white"}
                    `}
                    disabled={isSubmitting}
                />

                {/* Character Counter */}
                <div className="flex justify-between items-center mt-1 px-1">
                    <span className="text-[11px] font-bold text-rose-500">
                        {errors.reply?.message}
                    </span>
                    <span className={`text-[10px] font-bold ${replyContent.length > 2000 ? "text-rose-500" : "text-slate-400"}`}>
                        {replyContent.length}/2000
                    </span>
                </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                <div className="flex items-center gap-2 text-slate-400 shrink-0">
                    <Info size={14} />
                    <span className="text-[11px] font-semibold">
                        {t("detail.reply_disclaimer")}
                    </span>
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shrink-0 active:scale-[0.98] disabled:opacity-50 transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20"
                >
                    {isSubmitting ? (
                        <>
                            <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            <span>{t("actions.sending")}</span>
                        </>
                    ) : (
                        <>
                            <Send size={16} />
                            <span>{t("actions.send_reply")}</span>
                        </>
                    )}
                </button>
            </div>
        </form>
    );
};

export default ReplyForm;
