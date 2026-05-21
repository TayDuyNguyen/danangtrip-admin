import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useTranslation } from "react-i18next";
import type { PaymentItem } from "@/dataHelper/payment.dataHelper";
import { AlertTriangle, X } from "lucide-react";

interface RefundPaymentDialogProps {
    payment: PaymentItem | null;
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { refund_reason: string }) => void;
    isSubmitting?: boolean;
}

export const RefundPaymentDialog = ({
    payment,
    isOpen,
    onClose,
    onSubmit,
    isSubmitting,
}: RefundPaymentDialogProps) => {
    const { t } = useTranslation("payment");

    const schema = yup.object().shape({
        refund_reason: yup
            .string()
            .required(t("validation.reason_required", "Lý do hoàn tiền là bắt buộc"))
            .min(10, t("validation.reason_min", "Lý do hoàn tiền phải từ 10 ký tự trở lên"))
            .max(255, t("validation.reason_max", "Lý do hoàn tiền tối đa 255 ký tự")),
    });

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            refund_reason: "",
        },
    });

    const handleFormSubmit = (data: { refund_reason: string }) => {
        onSubmit(data);
        reset();
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(val);
    };

    if (!isOpen || !payment) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop blur overlay */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300"
                onClick={onClose}
            ></div>

            {/* Modal Box */}
            <div className="relative w-full max-w-lg bg-white border border-slate-100 rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden z-10">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute right-6 top-6 text-slate-400 hover:text-slate-900 p-1 hover:bg-slate-50 rounded-lg transition-all"
                >
                    <X size={18} />
                </button>

                {/* Title */}
                <h3 className="text-slate-900 text-xl font-bold tracking-tight mb-2">
                    {t("refund.dialog_title", "Xác nhận Hoàn tiền")}
                </h3>
                <p className="text-slate-500 text-sm mb-4">
                    {t("refund.dialog_desc", "Bạn đang yêu cầu hoàn tiền cho giao dịch của khách hàng. Vui lòng kiểm tra kỹ thông tin.")}
                </p>

                {/* Warning Alert Banner */}
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3 text-amber-800 mb-6">
                    <AlertTriangle size={20} className="shrink-0 text-amber-600 mt-0.5" />
                    <div>
                        <p className="text-xs font-black leading-tight">{t("refund.warning_title", "LƯU Ý QUAN TRỌNG:")}</p>
                        <p className="text-[11px] font-medium leading-normal mt-1 opacity-90">
                            {t("refund.warning_desc", "Hành động này là không thể thu hồi. Tiền sẽ được gửi hoàn lại qua tài khoản ví điện tử hoặc tài khoản ngân hàng của khách hàng tùy thuộc vào cổng giao dịch thanh toán.")}
                        </p>
                    </div>
                </div>

                {/* Transaction details card */}
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2.5 text-xs font-bold text-slate-500 mb-6">
                    <div className="flex justify-between">
                        <span>{t("table.transaction_code", "Mã Giao dịch:")}</span>
                        <span className="text-slate-900">{payment.transactionCode}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>{t("table.booking_code", "Mã Đơn:")}</span>
                        <span className="text-slate-900">{payment.bookingCode}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>{t("table.customer", "Khách hàng:")}</span>
                        <span className="text-slate-900">{payment.customerName} ({payment.customerEmail})</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-200/50 pt-2.5">
                        <span>{t("refund.amount", "Số tiền hoàn:")}</span>
                        <span className="text-[#14B8A6] text-sm font-black">{formatCurrency(payment.amount)}</span>
                    </div>
                </div>

                {/* Form inputs */}
                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">
                            {t("refund.reason_label", "Lý do hoàn tiền *")}
                        </label>
                        <textarea
                            {...register("refund_reason")}
                            placeholder={t("refund.reason_placeholder", "Nhập chi tiết lý do hoàn tiền (tối thiểu 10 ký tự)...")}
                            rows={3}
                            className={`w-full bg-slate-50 border ${errors.refund_reason ? "border-rose-400 focus:border-rose-500" : "border-slate-100 focus:border-[#14B8A6]"} rounded-2xl py-3 px-4 text-sm font-medium text-slate-900 focus:outline-hidden focus:bg-white transition-all duration-200 resize-none`}
                        />
                        {errors.refund_reason && (
                            <p className="text-rose-500 text-xs font-bold mt-1.5 pl-1">
                                {errors.refund_reason.message}
                            </p>
                        )}
                    </div>

                    {/* Dialog Actions */}
                    <div className="flex gap-3 justify-end pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="px-4 py-2.5 text-sm font-bold border border-slate-200 bg-white hover:bg-slate-50 rounded-xl text-slate-600 disabled:opacity-50 transition-all"
                        >
                            {t("refund.btn_cancel", "Hủy bỏ")}
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-bold bg-rose-600 hover:bg-rose-700 text-white disabled:opacity-50 rounded-xl shadow-lg shadow-rose-100 hover:shadow-xl transition-all"
                        >
                            {isSubmitting && (
                                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            )}
                            <span>{t("refund.btn_confirm", "Xác nhận hoàn tiền")}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RefundPaymentDialog;
