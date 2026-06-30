import { useState, useEffect } from "react";
import { Search, Calendar, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useDebounce } from "@/hooks/useDebounce";
import type { PaymentListFilters } from "@/dataHelper";
import { TextInput } from "@/components/ui/TextInput";
import CustomSelect, { type Option } from "@/components/ui/CustomSelect";

interface PaymentFilterBarProps {
    filters: PaymentListFilters;
    onFilterChange: (newFilters: PaymentListFilters) => void;
}

export const PaymentFilterBar = ({
    filters,
    onFilterChange,
}: PaymentFilterBarProps) => {
    const { t } = useTranslation(["payment", "common"]);

    // Local search state for debouncing
    const [prevSearch, setPrevSearch] = useState(filters.search || "");
    const [searchValue, setSearchValue] = useState(filters.search || "");
    const debouncedSearch = useDebounce(searchValue, 300);

    // Sync local search state with parent filters
    if ((filters.search || "") !== prevSearch) {
        setPrevSearch(filters.search || "");
        setSearchValue(filters.search || "");
    }

    // Handle debounced search change
    useEffect(() => {
        if (debouncedSearch !== (filters.search || "")) {
            onFilterChange({ ...filters, search: debouncedSearch });
        }
    }, [debouncedSearch, filters, onFilterChange]);

    const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchValue(e.target.value);
    };

    const handleSelectChange = (field: keyof PaymentListFilters, val: string) => {
        const finalVal = val === "all" ? undefined : val;
        onFilterChange({ ...filters, [field]: finalVal });
    };

    const handleReset = () => {
        onFilterChange({
            search: "",
            payment_status: undefined,
            payment_gateway: undefined,
            refund_status: undefined,
            date_from: undefined,
            date_to: undefined,
        });
    };

    const statusOptions = [
        { value: "all", label: t("filter.all_statuses", "Tất cả Trạng thái") },
        { value: "pending", label: t("status.pending", "Đang chờ") },
        { value: "partially_paid", label: t("status.partially_paid", "Thanh toán một phần") },
        { value: "success", label: t("status.success", "Thành công") },
        { value: "failed", label: t("status.failed", "Lỗi") },
        { value: "refunded", label: t("status.refunded", "Đã hoàn tiền") },
    ];

    const gatewayOptions = [
        { value: "all", label: t("filter.all_gateways", "Tất cả Cổng thanh toán") },
        { value: "sepay", label: "SePay" },
        { value: "bank_transfer", label: t("filter.gateway_bank_transfer", "Chuyển khoản") },
        { value: "momo", label: "MoMo" },
        { value: "vnpay", label: "VNPay" },
        { value: "zalopay", label: "ZaloPay" },
    ];

    const currentStatus = statusOptions.find(opt => opt.value === (filters.payment_status || "all")) || statusOptions[0];
    const currentGateway = gatewayOptions.find(opt => opt.value === (filters.payment_gateway || "all")) || gatewayOptions[0];
    const refundOptions = [
        { value: "all", label: t("filter.all_refund_statuses", "Tất cả yêu cầu hoàn") },
        { value: "pending", label: t("filter.refund_pending", "Chờ hoàn tiền") },
        { value: "processing", label: t("filter.refund_processing", "Đang xử lý hoàn") },
        { value: "completed", label: t("filter.refund_completed", "Đã hoàn tiền") },
        { value: "failed", label: t("filter.refund_failed", "Hoàn tiền thất bại") },
        { value: "rejected", label: t("filter.refund_rejected", "Từ chối hoàn") },
    ];
    const currentRefund = refundOptions.find(opt => opt.value === (filters.refund_status || "all")) || refundOptions[0];

    return (
        <div className="bg-white/80 backdrop-blur-md border border-slate-100 rounded-2xl p-5 shadow-xs space-y-4 font-sans">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Search Box (col-span-2) */}
                <TextInput
                    value={searchValue}
                    onChange={handleSearchInputChange}
                    placeholder={t("filter.search_placeholder", "Tìm mã GD, mã đơn, tên/email khách...")}
                    leftIcon={<Search size={18} />}
                    containerClassName="col-span-1 lg:col-span-2"
                    className="w-full bg-slate-50 border-slate-100 rounded-xl py-2.5 pr-4 text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-[#14B8A6] focus:bg-white transition-all duration-200"
                />

                {/* Status Dropdown */}
                <CustomSelect
                    options={statusOptions}
                    value={currentStatus}
                    onChange={(opt) => handleSelectChange("payment_status", String((opt as Option)?.value))}
                    size="md"
                />

                {/* Gateway Dropdown */}
                <CustomSelect
                    options={gatewayOptions}
                    value={currentGateway}
                    onChange={(opt) => handleSelectChange("payment_gateway", String((opt as Option)?.value))}
                    size="md"
                />

                <CustomSelect
                    options={refundOptions}
                    value={currentRefund}
                    onChange={(opt) => handleSelectChange("refund_status", String((opt as Option)?.value))}
                    size="md"
                />
            </div>

            {/* Sub Filter Row: Dates + Reset Action */}
            <div className="border-t border-slate-50 pt-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-4">
                    {/* Date From */}
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl py-1.5 px-3">
                        <Calendar size={15} className="text-slate-400" />
                        <span className="text-xs font-bold text-slate-400 uppercase">{t("filter.from", "Từ")}</span>
                        <input
                            type="date"
                            value={filters.date_from || ""}
                            onChange={(e) => handleSelectChange("date_from", e.target.value)}
                            className="bg-transparent border-none text-xs font-bold text-slate-700 focus:outline-hidden"
                        />
                    </div>

                    {/* Date To */}
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl py-1.5 px-3">
                        <Calendar size={15} className="text-slate-400" />
                        <span className="text-xs font-bold text-slate-400 uppercase">{t("filter.to", "Đến")}</span>
                        <input
                            type="date"
                            value={filters.date_to || ""}
                            onChange={(e) => handleSelectChange("date_to", e.target.value)}
                            className="bg-transparent border-none text-xs font-bold text-slate-700 focus:outline-hidden"
                        />
                    </div>
                </div>

                {/* Reset Filters */}
                <div>
                    {(filters.search || filters.payment_status || filters.payment_gateway || filters.refund_status || filters.date_from || filters.date_to) && (
                        <button
                            onClick={handleReset}
                            className="flex items-center justify-center gap-2 bg-slate-50 border border-slate-100 hover:bg-slate-100 hover:text-slate-900 rounded-xl py-2.5 px-4 text-sm font-bold text-slate-500 transition-all duration-200 cursor-pointer"
                        >
                            <RefreshCw size={15} />
                            <span>{t("filter.reset", "Làm mới")}</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PaymentFilterBar;
