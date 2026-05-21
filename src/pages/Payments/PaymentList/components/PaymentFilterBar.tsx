import { Search, Calendar, Download, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { PaymentListFilters } from "@/dataHelper";

interface PaymentFilterBarProps {
    filters: PaymentListFilters;
    onFilterChange: (newFilters: PaymentListFilters) => void;
    onExport: () => void;
    isExporting?: boolean;
}

export const PaymentFilterBar = ({
    filters,
    onFilterChange,
    onExport,
    isExporting,
}: PaymentFilterBarProps) => {
    const { t } = useTranslation("payment");

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onFilterChange({ ...filters, search: e.target.value });
    };

    const handleSelectChange = (field: keyof PaymentListFilters, val: string) => {
        onFilterChange({ ...filters, [field]: val || undefined });
    };

    const handleReset = () => {
        onFilterChange({
            search: "",
            payment_status: undefined,
            payment_gateway: undefined,
            date_from: undefined,
            date_to: undefined,
        });
    };

    return (
        <div className="bg-white/80 backdrop-blur-md border border-slate-100 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Search Box */}
                <div className="relative col-span-1 lg:col-span-2">
                    <Search size={18} className="absolute left-4 top-3.5 text-slate-400" />
                    <input
                        type="text"
                        value={filters.search || ""}
                        onChange={handleSearchChange}
                        placeholder={t("filter.search_placeholder", "Tìm kiếm mã giao dịch hoặc mã đơn...")}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 pl-11 pr-4 text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-[#14B8A6] focus:bg-white transition-all duration-200"
                    />
                </div>

                {/* Status Dropdown */}
                <div>
                    <select
                        value={filters.payment_status || ""}
                        onChange={(e) => handleSelectChange("payment_status", e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 px-4 text-sm font-medium text-slate-700 focus:outline-hidden focus:border-[#14B8A6] focus:bg-white transition-all duration-200"
                    >
                        <option value="">{t("filter.all_statuses", "Tất cả Trạng thái")}</option>
                        <option value="pending">{t("status.pending", "Đang chờ")}</option>
                        <option value="success">{t("status.success", "Thành công")}</option>
                        <option value="failed">{t("status.failed", "Lỗi")}</option>
                        <option value="refunded">{t("status.refunded", "Đã hoàn tiền")}</option>
                    </select>
                </div>

                {/* Gateway Dropdown */}
                <div>
                    <select
                        value={filters.payment_gateway || ""}
                        onChange={(e) => handleSelectChange("payment_gateway", e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 px-4 text-sm font-medium text-slate-700 focus:outline-hidden focus:border-[#14B8A6] focus:bg-white transition-all duration-200"
                    >
                        <option value="">{t("filter.all_gateways", "Tất cả Cổng thanh toán")}</option>
                        <option value="momo">MoMo</option>
                        <option value="vnpay">VNPay</option>
                        <option value="zalopay">ZaloPay</option>
                    </select>
                </div>

                {/* Reset Filters */}
                <div className="flex items-center justify-end md:justify-start">
                    <button
                        onClick={handleReset}
                        className="flex items-center justify-center gap-2 w-full md:w-auto bg-slate-50 border border-slate-100 hover:bg-slate-100 hover:text-slate-900 rounded-xl py-2.5 px-4 text-sm font-bold text-slate-500 transition-all duration-200"
                    >
                        <RefreshCw size={15} />
                        <span>{t("filter.reset", "Làm mới")}</span>
                    </button>
                </div>
            </div>

            {/* Sub Filter Row: Dates + Export Action */}
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

                {/* Export excel */}
                <button
                    onClick={onExport}
                    disabled={isExporting}
                    className="flex items-center justify-center gap-2 bg-[#14B8A6] hover:bg-[#0f766e] text-white disabled:opacity-50 rounded-xl py-2.5 px-5 text-sm font-bold shadow-lg shadow-[#14B8A6]/20 hover:shadow-xl hover:shadow-[#14B8A6]/30 transition-all duration-200"
                >
                    <Download size={16} className={isExporting ? "animate-bounce" : ""} />
                    <span>
                        {isExporting
                            ? t("filter.exporting", "Đang xuất...")
                            : t("filter.export_excel", "Xuất báo cáo Excel")}
                    </span>
                </button>
            </div>
        </div>
    );
};

export default PaymentFilterBar;
