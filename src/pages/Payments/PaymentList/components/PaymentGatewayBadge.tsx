import type { PaymentGateway } from "@/dataHelper";
import type { ReactNode } from "react";

interface PaymentGatewayBadgeProps {
    gateway: PaymentGateway;
}

export const PaymentGatewayBadge = ({ gateway }: PaymentGatewayBadgeProps) => {
    const config: Partial<Record<PaymentGateway, { bg: string; logo: ReactNode; name: string }>> = {
        momo: {
            bg: "bg-pink-50 border-pink-100 text-pink-700",
            logo: (
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="12" r="12" fill="#D82D8E" />
                    <text x="12" y="15" fill="white" fontSize="9" fontWeight="900" textAnchor="middle">M</text>
                </svg>
            ),
            name: "MoMo",
        },
        vnpay: {
            bg: "bg-blue-50 border-blue-100 text-blue-700",
            logo: (
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="12" r="12" fill="#005AAB" />
                    <text x="12" y="15" fill="white" fontSize="8" fontWeight="900" textAnchor="middle">VN</text>
                </svg>
            ),
            name: "VNPay",
        },
        zalopay: {
            bg: "bg-emerald-50 border-emerald-100 text-emerald-700",
            logo: (
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="12" r="12" fill="#00C2FF" />
                    <text x="12" y="15" fill="white" fontSize="9" fontWeight="900" textAnchor="middle">Z</text>
                </svg>
            ),
            name: "ZaloPay",
        },
        sepay: {
            bg: "bg-teal-50 border-teal-100 text-teal-700",
            logo: (
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="12" r="12" fill="#14B8A6" />
                    <text x="12" y="15" fill="white" fontSize="8" fontWeight="900" textAnchor="middle">SP</text>
                </svg>
            ),
            name: "SePay",
        },
        payos: {
            bg: "bg-teal-50 border-teal-100 text-teal-700",
            logo: (
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="12" r="12" fill="#14B8A6" />
                    <text x="12" y="15" fill="white" fontSize="8" fontWeight="900" textAnchor="middle">SP</text>
                </svg>
            ),
            name: "SePay",
        },
        bank_transfer: {
            bg: "bg-amber-50 border-amber-100 text-amber-700",
            logo: (
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="12" r="12" fill="#F59E0B" />
                    <text x="12" y="15" fill="white" fontSize="8" fontWeight="900" textAnchor="middle">QR</text>
                </svg>
            ),
            name: "CK ngân hàng",
        },
    };

    const current = config[gateway] || {
        bg: "bg-slate-50 border-slate-100 text-slate-700",
        logo: null,
        name: gateway?.toUpperCase(),
    };

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-bold rounded-lg border backdrop-blur-xs transition-all duration-200 ${current.bg}`}
        >
            {current.logo}
            <span>{current.name}</span>
        </span>
    );
};

export default PaymentGatewayBadge;
