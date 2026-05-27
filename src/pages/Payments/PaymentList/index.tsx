import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
    useDebounce,
    useAdminPaymentsQuery,
    usePaymentMutations,
} from "@/hooks";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import { CreditCard } from "lucide-react";
import type { PaymentListFilters, PaymentItem } from "@/dataHelper";
import { mapApiErrorMessage } from "@/utils";
import PaymentStatsRow from "./components/PaymentStatsRow";
import PaymentFilterBar from "./components/PaymentFilterBar";
import PaymentTable from "./components/PaymentTable";
import RefundPaymentDialog from "./components/RefundPaymentDialog";

const PaymentList = () => {
    const { t } = useTranslation(["payment", "common"]);

    // Filter states
    const [filters, setFilters] = useState<PaymentListFilters>({
        search: "",
        payment_status: undefined,
        payment_gateway: undefined,
        date_from: undefined,
        date_to: undefined,
    });
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);

    // Debounce filters for API requests
    const debouncedFilters = useDebounce(filters, 400);

    // Fetch payments list query
    const { data: listData, isLoading, isFetching, refetch } = useAdminPaymentsQuery(
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
                        })
                    );
                    setIsRefundOpen(false);
                    setRefundPayment(null);
                },
                onError: (err: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
                    toast.error(
                        t("refund.toast_error", {
                            message: mapApiErrorMessage(t("common:error_occurred"), err),
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
                loading: t("filter.exporting"),
                success: t("export.toast_success"),
                error: (err) =>
                    t("export.toast_error", {
                        message: mapApiErrorMessage(t("common:error_occurred"), err),
                    }),
            }
        );
    };

    return (
        <main className="p-1 sm:p-2 max-w-[1600px] mx-auto flex flex-col gap-6 font-sans">
            {/* Header Title Section */}
            <div className="flex flex-col gap-3">
                <Breadcrumbs
                    icon={CreditCard}
                    items={[
                        { label: 'sidebar.payments' }
                    ]}
                />
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">{t("title", "Danh sách Giao dịch")}</h1>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-1">
                            {t("subtitle", "Quản lý, tìm kiếm và kiểm soát giao dịch thanh toán của khách hàng.")}
                        </p>
                    </div>
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
                isRefreshing={isFetching && !isLoading}
                page={page}
                limit={limit}
                total={meta?.total || 0}
                onPageChange={handlePageChange}
                onLimitChange={setLimit}
                onRefresh={refetch}
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
        </main>
    );
};

export default PaymentList;
