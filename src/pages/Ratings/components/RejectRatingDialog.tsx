import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useTranslation } from "react-i18next";
import type { RatingViewModel } from "@/dataHelper/rating.dataHelper";
import { AlertTriangle, X } from "lucide-react";
import { TextareaField } from "@/components/ui/TextareaField";

interface RejectRatingDialogProps {
    rating: RatingViewModel | null; // Null means bulk rejection
    selectedCount?: number;         // Used for bulk rejection count
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (reason: string) => void;
    isSubmitting?: boolean;
}

export const RejectRatingDialog = ({
    rating,
    selectedCount = 0,
    isOpen,
    onClose,
    onSubmit,
    isSubmitting,
}: RejectRatingDialogProps) => {
    const { t } = useTranslation(["ratings", "common"]);

    const schema = yup.object().shape({
        rejected_reason: yup
            .string()
            .required(t("validation.required", "Lý do từ chối là bắt buộc"))
            .min(5, t("validation.min_5", "Lý do từ chối phải từ 5 ký tự trở lên"))
            .max(255, t("validation.max_255", "Lý do từ chối tối đa 255 ký tự")),
    });

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            rejected_reason: "",
        },
    });

    const handleFormSubmit = (data: { rejected_reason: string }) => {
        onSubmit(data.rejected_reason);
        reset();
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    if (!isOpen) return null;

    const isBulk = !rating;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop blur overlay */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300"
                onClick={handleClose}
            ></div>

            {/* Modal Box */}
            <div className="relative w-full max-w-lg bg-white border border-slate-100 rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden z-10">
                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute right-6 top-6 text-slate-400 hover:text-slate-900 p-1 hover:bg-slate-50 rounded-lg transition-all"
                >
                    <X size={18} />
                </button>

                {/* Title */}
                <h3 className="text-slate-900 text-xl font-bold tracking-tight mb-2">
                    {isBulk 
                        ? t("actions.reject_bulk_title", "Từ chối hàng loạt ({{count}} đánh giá)", { count: selectedCount })
                        : t("actions.reject_single_title", "Xác nhận Từ chối đánh giá")
                    }
                </h3>
                <p className="text-slate-500 text-sm mb-4">
                    {isBulk
                        ? t("actions.reject_bulk_desc", "Bạn đang ẩn hàng loạt các đánh giá được chọn khỏi hiển thị công khai. Vui lòng ghi lại lý do ẩn.")
                        : t("actions.reject_single_desc", "Bạn đang ẩn bài đánh giá này khỏi hiển thị công khai. Vui lòng nhập lý do từ chối để gửi thông báo cho khách hàng.")
                    }
                </p>

                {/* Warning Alert Banner */}
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3 text-amber-800 mb-6">
                    <AlertTriangle size={20} className="shrink-0 text-amber-600 mt-0.5" />
                    <div>
                        <p className="text-xs font-black leading-tight">{t("table.warning_title", "LƯU Ý QUAN TRỌNG:")}</p>
                        <p className="text-[11px] font-medium leading-normal mt-1 opacity-90">
                            {isBulk
                                ? t("table.warning_bulk_desc", "Hành động này sẽ cập nhật trạng thái của tất cả đánh giá đã chọn thành 'Từ chối' (Bị ẩn) và điểm đánh giá tương ứng của Tour/Địa điểm sẽ được tính toán lại.")
                                : t("table.warning_single_desc", "Khi từ chối, bài viết đánh giá sẽ bị ẩn khỏi trang chi tiết công khai. Hệ thống sẽ tự động gửi thông báo giải thích kèm lý do tới khách hàng.")
                            }
                        </p>
                    </div>
                </div>

                {/* Rating details card if single */}
                {!isBulk && rating && (
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2.5 text-xs font-bold text-slate-500 mb-6">
                        <div className="flex justify-between">
                            <span>{t("table.customer", "Khách hàng:")}</span>
                            <span className="text-slate-900">{rating.userName}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>{t("table.target", "Đánh giá cho:")}</span>
                            <span className="text-slate-900">
                                {rating.targetType === 'tour' ? `[Tour] ` : `[Địa điểm] `} 
                                {rating.targetName}
                            </span>
                        </div>
                        <div className="flex justify-between border-t border-slate-200/50 pt-2.5">
                            <span>{t("table.score", "Số điểm sao:")}</span>
                            <span className="text-[#14B8A6] text-sm font-black">{rating.score} / 5 ★</span>
                        </div>
                    </div>
                )}

                {/* Form inputs */}
                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">
                            {t("table.reject_reason_input_label", "Lý do từ chối *")}
                        </label>
                        <TextareaField
                            {...register("rejected_reason")}
                            placeholder={t("table.reject_reason_placeholder", "Nhập chi tiết lý do từ chối (Ví dụ: Chứa từ ngữ thô tục, spam, sai sự thật...)")}
                            rows={3}
                            invalid={!!errors.rejected_reason}
                            className="bg-slate-50 border-slate-100 focus:border-[#14B8A6] rounded-2xl"
                        />
                        {errors.rejected_reason && (
                            <p className="text-rose-500 text-xs font-bold mt-1.5 pl-1">
                                {errors.rejected_reason.message}
                            </p>
                        )}
                    </div>

                    {/* Dialog Actions */}
                    <div className="flex gap-3 justify-end pt-2">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={isSubmitting}
                            className="px-4 py-2.5 text-sm font-bold border border-slate-200 bg-white hover:bg-slate-50 rounded-xl text-slate-600 disabled:opacity-50 transition-all"
                        >
                            {t("actions.cancel", "Hủy bỏ")}
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-bold bg-amber-500 hover:bg-amber-600 text-white disabled:opacity-50 rounded-xl shadow-lg shadow-amber-100 hover:shadow-xl transition-all"
                        >
                            {isSubmitting && (
                                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            )}
                            <span>{t("actions.confirm_hide", "Xác nhận ẩn")}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RejectRatingDialog;
