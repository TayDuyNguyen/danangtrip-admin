import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
    useDebounce,
    useAdminPaymentsQuery,
    usePaymentMutations,
} from "@/hooks";
import type { PaymentListFilters, PaymentItem } from "@/dataHelper";
import PaymentStatsRow from "./components/PaymentStatsRow";
import PaymentFilterBar from "./components/PaymentFilterBar";
import PaymentTable from "./components/PaymentTable";
import RefundPaymentDialog from "./components/RefundPaymentDialog";

const PaymentList = () => {
    const { t } = useTranslation("payment");

    // Filter states
    const [filters, setFilters] = useState<PaymentListFilters>({
        search: "",
        payment_status: undefined,
        payment_gateway: undefined,
        date_from: undefined,
        date_to: undefined,
    });
    const [page, setPage] = useState(1);
    const limit = 10;

    // Debounce filters for API requests
    const debouncedFilters = useDebounce(filters, 400);

    // Fetch payments list query
    const { data: listData, isLoading } = useAdminPaymentsQuery(
        debouncedFilters,
        page,
        limit
    );

    const payments = useMemo(() => listData?.data || [], [listData?.data]);
    const meta = listData?.meta;

    // Statistics computation
    const stats = useMemo(() => {
        let totalRevenue = 0;
        let successCount = 0;
        let pendingCount = 0;
        let refundedAmount = 0;

        payments.forEach((p) => {
            if (p.status === "success") {
                totalRevenue += p.amount;
                successCount += 1;
            } else if (p.status === "pending") {
                pendingCount += 1;
            } else if (p.status === "refunded") {
                refundedAmount += p.amount;
            }
        });

        return {
            totalRevenue,
            successCount,
            pendingCount,
            refundedAmount,
        };
    }, [payments]);

    // Mutation Hooks
    const { refundMutation, exportMutation } = usePaymentMutations();

    // Dialog state
    const [refundPayment, setRefundPayment] = useState<PaymentItem | null>(null);
    const [isRefundOpen, setIsRefundOpen] = useState(false);

    // Handlers
    const handleFilterChange = (newFilters: PaymentListFilters) => {
        setFilters(newFilters);
        setPage(1); // Reset page on filter changes
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    const handleRefundClick = (payment: PaymentItem) => {
        setRefundPayment(payment);
        setIsRefundOpen(true);
    };

    const handleRefundSubmit = (data: { refund_reason: string }) => {
        if (!refundPayment) return;

        refundMutation.mutate(
            { id: refundPayment.id, refund_reason: data.refund_reason },
            {
                onSuccess: () => {
                    toast.success(
                        t("refund.toast_success", {
                            code: refundPayment.transactionCode,
                            defaultValue: `Yêu cầu hoàn tiền giao dịch ${refundPayment.transactionCode} đã được thực hiện thành công!`,
                        })
                    );
                    setIsRefundOpen(false);
                    setRefundPayment(null);
                },
                onError: (err: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
                    toast.error(
                        t("refund.toast_error", {
                            message: err?.message || t("error_occurred", "Đã có lỗi xảy ra"),
                            defaultValue: `Có lỗi xảy ra khi thực hiện hoàn tiền: ${err?.message}`,
                        })
                    );
                },
            }
        );
    };

    const handleExport = () => {
        toast.promise(
            exportMutation.mutateAsync({
                ...filters,
                fallbackFilename: `payment_report_${new Date().toISOString().slice(0, 10)}.xlsx`,
            }),
            {
                loading: t("filter.exporting", "Đang xuất báo cáo giao dịch..."),
                success: t("export.toast_success", "Đã xuất báo cáo giao dịch thành công!"),
                error: (err) =>
                    t("export.toast_error", {
                        message: err?.message || t("error_occurred", "Lỗi chưa xác định"),
                        defaultValue: `Lỗi xuất dữ liệu: ${err?.message}`,
                    }),
            }
        );
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header Title Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">{t("title", "Danh sách Giao dịch")}</h1>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-1">
                        {t("subtitle", "Quản lý, tìm kiếm và kiểm soát giao dịch thanh toán của khách hàng.")}
                    </p>
                </div>
            </div>

            {/* Statistics Summary */}
            <PaymentStatsRow stats={stats} isLoading={isLoading} />

            {/* Advanced Filters */}
            <PaymentFilterBar
                filters={filters}
                onFilterChange={handleFilterChange}
                onExport={handleExport}
                isExporting={exportMutation.isPending}
            />

            {/* Payment Transactions Table */}
            <PaymentTable
                payments={payments}
                isLoading={isLoading}
                meta={meta}
                onPageChange={handlePageChange}
                onRefundClick={handleRefundClick}
            />

            {/* Refund Confirm Dialog Portal */}
            <RefundPaymentDialog
                payment={refundPayment}
                isOpen={isRefundOpen}
                onClose={() => {
                    setIsRefundOpen(false);
                    setRefundPayment(null);
                }}
                onSubmit={handleRefundSubmit}
                isSubmitting={refundMutation.isPending}
            />
        </div>
    );
};

export default PaymentList;
