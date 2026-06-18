import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useTranslation } from "react-i18next";
import type { PaymentItem } from "@/dataHelper/payment.dataHelper";
import { useAdminPaymentDetailQuery } from "@/hooks";
import { AlertTriangle, Loader2, X } from "lucide-react";

interface RefundPaymentDialogProps {
    payment: PaymentItem | null;
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: {
        refund_reason: string;
        refund_bank_code: string;
        refund_account_no: string;
        refund_account_name: string;
        transfer_reference: string;
        approved_amount?: number;
    }) => void;
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

    const { data: paymentDetail, isLoading: isLoadingDetail } = useAdminPaymentDetailQuery(
        payment?.id ?? 0,
        isOpen && !!payment
    );
    const activePayment = paymentDetail ?? payment;

    const schema = yup.object().shape({
        refund_reason: yup
            .string()
            .required(t("validation.reason_required", "Lý do hoàn tiền là bắt buộc"))
            .min(10, t("validation.reason_min", "Lý do hoàn tiền phải từ 10 ký tự trở lên"))
            .max(255, t("validation.reason_max", "Lý do hoàn tiền tối đa 255 ký tự")),
        refund_bank_code: yup.string().required("Vui lòng chọn ngân hàng"),
        refund_account_no: yup.string().matches(/^[0-9]{6,30}$/, "Số tài khoản không hợp lệ").required("Vui lòng nhập số tài khoản"),
        refund_account_name: yup.string().min(2).required("Vui lòng nhập tên chủ tài khoản"),
        transfer_reference: yup.string().min(4, "Mã giao dịch phải có ít nhất 4 ký tự").required("Vui lòng nhập mã giao dịch sau khi chuyển tiền"),
        approved_amount: yup.number().positive().optional(),
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
            refund_bank_code: "",
            refund_account_no: "",
            refund_account_name: "",
            transfer_reference: "",
            approved_amount: undefined,
        },
    });

    useEffect(() => {
        if (!isOpen || !activePayment || isLoadingDetail) return;
        const request = activePayment.latestRefundRequest;
        reset({
            refund_reason: request?.reason || "",
            refund_bank_code: request?.bank_code || "",
            refund_account_no: request?.account_no || "",
            refund_account_name: request?.account_name || "",
            transfer_reference: "",
            approved_amount: request?.approved_amount || activePayment.amount,
        });
    }, [isOpen, activePayment, isLoadingDetail, reset]);

    const handleFormSubmit = (data: {
        refund_reason: string;
        refund_bank_code: string;
        refund_account_no: string;
        refund_account_name: string;
        transfer_reference: string;
        approved_amount?: number;
    }) => {
        onSubmit(data);
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(val);
    };

    if (!isOpen || !payment) return null;

    if (isLoadingDetail || !activePayment) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={onClose} />
                <div className="relative flex items-center gap-3 rounded-2xl bg-white px-6 py-5 shadow-2xl">
                    <Loader2 className="h-5 w-5 animate-spin text-[#14B8A6]" />
                    <span className="text-sm font-medium text-slate-600">Đang tải thông tin hoàn tiền...</span>
                </div>
            </div>
        );
    }

    const refundRequest = activePayment.latestRefundRequest;
    const refundAmount = refundRequest?.approved_amount || activePayment.amount;
    const bankCode = refundRequest?.bank_code;
    const accountNo = refundRequest?.account_no;
    const accountName = refundRequest?.account_name;
    const needsBankDetails = !bankCode || !accountNo || !accountName;
    const qrUrl = bankCode && accountNo && accountName
        ? `https://img.vietqr.io/image/${encodeURIComponent(bankCode)}-${encodeURIComponent(accountNo)}-compact2.png?amount=${refundAmount}&addInfo=${encodeURIComponent(`Hoan tien DaNangTrip ${activePayment.bookingCode}`)}&accountName=${encodeURIComponent(accountName)}`
        : null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop blur overlay */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300"
                onClick={onClose}
            ></div>

            {/* Modal Box */}
            <div className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto bg-white border border-slate-100 rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 z-10">
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
                        <span className="text-slate-900">{activePayment.transactionCode}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>{t("table.booking_code", "Mã Đơn:")}</span>
                        <span className="text-slate-900">{activePayment.bookingCode}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>{t("table.customer", "Khách hàng:")}</span>
                        <span className="text-slate-900">{activePayment.customerName} ({activePayment.customerEmail})</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-200/50 pt-2.5">
                        <span>{t("refund.amount", "Số tiền hoàn:")}</span>
                        <span className="text-[#14B8A6] text-sm font-black">{formatCurrency(refundAmount)}</span>
                    </div>
                </div>

                {qrUrl && (
                    <div className="mb-5 grid grid-cols-[150px_1fr] gap-4 rounded-2xl border border-teal-100 bg-teal-50/40 p-4">
                        <img src={qrUrl} alt="VietQR hoàn tiền" className="h-[150px] w-[150px] rounded-xl bg-white object-contain" />
                        <div className="space-y-2 text-xs">
                            <p><strong>Ngân hàng:</strong> {bankCode}</p>
                            <p><strong>Số tài khoản:</strong> {accountNo}</p>
                            <p><strong>Chủ tài khoản:</strong> {accountName}</p>
                            <p className="text-rose-600"><strong>Số tiền:</strong> {formatCurrency(refundAmount)}</p>
                            <p>Quét QR và chỉ xác nhận sau khi ứng dụng ngân hàng báo chuyển thành công.</p>
                        </div>
                    </div>
                )}

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

                    {needsBankDetails && (
                        <div className="grid grid-cols-2 gap-3">
                            <input {...register("refund_bank_code")} placeholder="Mã ngân hàng, ví dụ MB" className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
                            <input {...register("refund_account_no")} placeholder="Số tài khoản" className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
                            <input {...register("refund_account_name")} placeholder="Tên chủ tài khoản" className="col-span-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm uppercase" />
                        </div>
                    )}
                    {!needsBankDetails && (
                        <>
                            <input type="hidden" {...register("refund_bank_code")} />
                            <input type="hidden" {...register("refund_account_no")} />
                            <input type="hidden" {...register("refund_account_name")} />
                        </>
                    )}
                    <div>
                        <label className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-400">Mã giao dịch ngân hàng *</label>
                        <input
                            {...register("transfer_reference")}
                            placeholder="Nhập mã giao dịch sau khi chuyển khoản thành công"
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
                        />
                        {errors.transfer_reference && <p className="mt-1 text-xs font-bold text-rose-500">{errors.transfer_reference.message}</p>}
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
