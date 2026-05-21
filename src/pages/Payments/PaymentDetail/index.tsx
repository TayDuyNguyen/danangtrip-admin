import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
    ArrowLeft, 
    RefreshCw, 
    CreditCard, 
    User, 
    Mail, 
    Clock, 
    CheckCircle2, 
    XCircle, 
    AlertCircle, 
    ShoppingBag,
    Eye
} from 'lucide-react';
import { toast } from 'sonner';

import { ROUTES } from '@/routes/routes';
import { useAuth } from '@/store';
import { 
    useAdminPaymentDetailQuery, 
    usePaymentMutations 
} from '@/hooks/usePaymentQueries';
import PaymentGatewayBadge from '../PaymentList/components/PaymentGatewayBadge';
import PaymentStatusBadge from '../PaymentList/components/PaymentStatusBadge';
import RefundPaymentDialog from '../PaymentList/components/RefundPaymentDialog';
import { formatCurrency } from '@/utils/pricing';
import { formatAdminShortDate } from '@/utils/dateDisplay';

/**
 * VirtualTimeline Subcomponent for Payments
 */
interface VirtualTimelineProps {
    createdAt: string;
    paidAt?: string | null;
    refundedAt?: string | null;
    refundReason?: string | null;
    status: string;
    gateway: string;
}

const VirtualTimeline = ({
    createdAt,
    paidAt,
    refundedAt,
    refundReason,
    status,
    gateway
}: VirtualTimelineProps) => {
    const { t, i18n } = useTranslation('payment');

    const milestones = [
        {
            key: 'created',
            label: t('detail.timeline_created', 'Yêu cầu thanh toán được tạo'),
            date: createdAt,
            isCompleted: true,
            icon: Clock,
            color: 'text-blue-500 bg-blue-50 border-blue-200'
        }
    ];

    if (status === 'success' || status === 'refunded') {
        milestones.push({
            key: 'success',
            label: t('detail.timeline_success', { gateway: gateway.toUpperCase() }),
            date: paidAt || createdAt,
            isCompleted: true,
            icon: CheckCircle2,
            color: 'text-emerald-500 bg-emerald-50 border-emerald-200'
        });
    }

    if (status === 'failed') {
        milestones.push({
            key: 'failed',
            label: t('detail.timeline_failed', 'Thanh toán thất bại'),
            date: createdAt,
            isCompleted: true,
            icon: XCircle,
            color: 'text-rose-500 bg-rose-50 border-rose-200'
        });
    }

    if (status === 'refunded') {
        milestones.push({
            key: 'refunded',
            label: t('detail.timeline_refunded', { reason: refundReason || '' }),
            date: refundedAt || paidAt || createdAt,
            isCompleted: true,
            icon: RefreshCw,
            color: 'text-amber-500 bg-amber-50 border-amber-200'
        });
    }

    return (
        <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-100 shadow-xs hover:shadow-md transition-all duration-300">
            <h3 className="text-[16px] font-black text-slate-900 mb-6 flex items-center gap-2">
                <Clock className="text-[#14b8a6]" size={20} />
                {t('detail.section_timeline', 'Lịch sử Trạng thái')}
            </h3>

            <div className="relative border-l border-slate-100 pl-6 ml-3 space-y-8">
                {milestones.map((milestone) => {
                    const IconComponent = milestone.icon;
                    return (
                        <div key={milestone.key} className="relative">
                            {/* Line node */}
                            <span className={`absolute -left-10 top-0.5 w-8 h-8 rounded-full border flex items-center justify-center shrink-0 ${milestone.color} shadow-xs`}>
                                <IconComponent size={14} />
                            </span>
                            <div>
                                <h4 className="text-sm font-bold text-slate-800 leading-tight">
                                    {milestone.label}
                                </h4>
                                <p className="text-[11px] font-semibold text-slate-400 mt-1 uppercase tracking-wider">
                                    {formatAdminShortDate(milestone.date, i18n.language)}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export const PaymentDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation('payment');
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';

    const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false);

    // Queries & Mutations
    const { data: payment, isLoading, error } = useAdminPaymentDetailQuery(id || '');
    const { refundMutation } = usePaymentMutations();

    const handleRefundSubmit = (data: { refund_reason: string }) => {
        if (!id) return;
        
        refundMutation.mutate(
            { id, refund_reason: data.refund_reason },
            {
                onSuccess: () => {
                    toast.success(t('refund.toast_success', { code: payment?.transactionCode }));
                    setIsRefundDialogOpen(false);
                },
                onError: (err) => {
                    const axiosError = err as Error & { response?: { data?: { message?: string } } };
                    toast.error(t('refund.toast_error', { message: axiosError?.response?.data?.message || axiosError.message }));
                }
            }
        );
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                <span className="text-sm font-semibold text-slate-400">{t('common:loading', 'Đang tải dữ liệu...')}</span>
            </div>
        );
    }

    if (error || !payment) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6 bg-white border border-slate-100 rounded-3xl shadow-xs">
                <AlertCircle size={40} className="text-rose-500 mb-3" />
                <h3 className="text-slate-900 text-lg font-bold">{t('detail.not_found', 'Không tìm thấy giao dịch')}</h3>
                <p className="text-slate-500 text-sm mt-1 mb-6">
                    {t('detail.not_found_desc', 'Không tìm thấy giao dịch hoặc giao dịch không tồn tại.')}
                </p>
                <button
                    onClick={() => navigate(ROUTES.PAYMENTS_LIST)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-bold bg-[#14b8a6] text-white rounded-xl shadow-lg hover:bg-[#0f766e] transition-all"
                >
                    <ArrowLeft size={16} />
                    <span>{t('detail.back_to_list', 'Quay lại danh sách')}</span>
                </button>
            </div>
        );
    }

    const isSuccess = payment.status === 'success';

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            {/* Header / Breadcrumb Section */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <Link to={ROUTES.DASHBOARD} className="hover:text-slate-600 transition-colors">{t('detail.breadcrumb_home', 'Bảng điều khiển')}</Link>
                    <span className="text-slate-300">/</span>
                    <Link to={ROUTES.PAYMENTS_LIST} className="hover:text-slate-600 transition-colors">{t('detail.breadcrumb_payments', 'Giao dịch')}</Link>
                    <span className="text-slate-300">/</span>
                    <span className="text-slate-600">{t('detail.breadcrumb_detail', 'Chi tiết')}</span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                        <button
                            onClick={() => navigate(ROUTES.PAYMENTS_LIST)}
                            className="p-3 bg-white border border-slate-100 hover:bg-slate-50 text-slate-600 rounded-2xl shadow-xs transition-all duration-200"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-[26px] font-black text-slate-900 tracking-tight leading-tight">
                                    {payment.transactionCode}
                                </h1>
                                <PaymentStatusBadge status={payment.status} />
                            </div>
                            <p className="text-slate-500 text-sm mt-1">
                                {t('detail.subtitle', 'Xem chi tiết thông tin và lịch sử thanh toán của giao dịch')}
                            </p>
                        </div>
                    </div>

                    {/* Refund Actions */}
                    {isSuccess && (
                        <div className="relative inline-block">
                            <button
                                onClick={() => setIsRefundDialogOpen(true)}
                                disabled={!isAdmin || refundMutation.isPending}
                                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-bold rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 disabled:opacity-50 disabled:bg-slate-50 disabled:border-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed hover:bg-rose-600 hover:text-white transition-all duration-200 shadow-md shadow-rose-100/50 hover:shadow-lg hover:shadow-rose-500/20 active:scale-95"
                            >
                                <RefreshCw size={14} className={refundMutation.isPending ? "animate-spin" : ""} />
                                <span>{t('action.refund', 'Hoàn tiền')}</span>
                            </button>
                            {!isAdmin && (
                                <p className="text-[11px] text-rose-500/80 font-bold mt-1 text-center">
                                    {t('action.refund_tooltip_staff', 'Chỉ người quản trị mới có quyền thực hiện hoàn tiền')}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Content Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Columns (Payment & Booking details) */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Payment Details Card */}
                    <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-100 shadow-xs hover:shadow-md transition-all duration-300">
                        <h3 className="text-[16px] font-black text-slate-900 mb-6 flex items-center gap-2">
                            <CreditCard className="text-[#14b8a6]" size={20} />
                            {t('detail.section_payment_info', 'Thông tin Thanh toán')}
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm font-medium">
                            <div className="space-y-4">
                                <div className="flex flex-col gap-1 border-b border-slate-50 pb-3">
                                    <span className="text-xs font-black text-slate-400 uppercase tracking-wider">{t('detail.label_transaction_code', 'Mã giao dịch')}</span>
                                    <span className="text-slate-900 font-bold">{payment.transactionCode}</span>
                                </div>
                                <div className="flex flex-col gap-1 border-b border-slate-50 pb-3">
                                    <span className="text-xs font-black text-slate-400 uppercase tracking-wider">{t('detail.label_amount', 'Số tiền thanh toán')}</span>
                                    <span className="text-[#14b8a6] text-[18px] font-black">{formatCurrency(payment.amount)}</span>
                                </div>
                                <div className="flex flex-col gap-1 border-b border-slate-50 pb-3">
                                    <span className="text-xs font-black text-slate-400 uppercase tracking-wider">{t('detail.label_gateway', 'Cổng thanh toán')}</span>
                                    <div className="mt-1">
                                        <PaymentGatewayBadge gateway={payment.gateway} />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex flex-col gap-1 border-b border-slate-50 pb-3">
                                    <span className="text-xs font-black text-slate-400 uppercase tracking-wider">{t('detail.label_created_at', 'Thời gian khởi tạo')}</span>
                                    <span className="text-slate-700 font-bold">{formatAdminShortDate(payment.transactionDate, i18n.language)}</span>
                                </div>
                                {payment.paidAt && (
                                    <div className="flex flex-col gap-1 border-b border-slate-50 pb-3">
                                        <span className="text-xs font-black text-slate-400 uppercase tracking-wider">{t('detail.label_paid_at', 'Thời gian thanh toán')}</span>
                                        <span className="text-slate-700 font-bold">{formatAdminShortDate(payment.paidAt, i18n.language)}</span>
                                    </div>
                                )}
                                {payment.status === 'refunded' && (
                                    <>
                                        {payment.refundedAt && (
                                            <div className="flex flex-col gap-1 border-b border-slate-50 pb-3">
                                                <span className="text-xs font-black text-slate-400 uppercase tracking-wider">{t('detail.label_refunded_at', 'Thời gian hoàn tiền')}</span>
                                                <span className="text-slate-700 font-bold">{formatAdminShortDate(payment.refundedAt, i18n.language)}</span>
                                            </div>
                                        )}
                                        {payment.refundReason && (
                                            <div className="flex flex-col gap-1 border-b border-slate-50 pb-3">
                                                <span className="text-xs font-black text-slate-400 uppercase tracking-wider">{t('detail.label_refund_reason', 'Lý do hoàn tiền')}</span>
                                                <span className="text-slate-700 font-bold">{payment.refundReason}</span>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Booking & Customer details */}
                    {payment.bookingId ? (
                        <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-100 shadow-xs hover:shadow-md transition-all duration-300">
                            <h3 className="text-[16px] font-black text-slate-900 mb-6 flex items-center gap-2">
                                <ShoppingBag className="text-[#14b8a6]" size={20} />
                                {t('detail.section_booking_customer', 'Đơn đặt & Khách hàng')}
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Customer information */}
                                <div className="space-y-4">
                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">{t('detail.customer_title', 'Thông tin khách hàng')}</h4>
                                    <div className="flex items-center gap-4 bg-slate-50/50 p-4 border border-slate-100 rounded-2xl">
                                        <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 font-bold shrink-0 overflow-hidden shadow-xs">
                                            {payment.customerAvatar ? (
                                                <img
                                                    src={payment.customerAvatar}
                                                    alt={payment.customerName}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <User size={20} />
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-slate-900 text-sm font-bold truncate">
                                                {payment.customerName}
                                            </p>
                                            <p className="text-slate-400 text-xs truncate flex items-center gap-1 mt-1 font-bold">
                                                <Mail size={12} />
                                                {payment.customerEmail}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Booking & Tour information */}
                                <div className="space-y-4">
                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">{t('detail.tour_title', 'Thông tin Tour du lịch')}</h4>
                                    <div className="bg-slate-50/50 p-4 border border-slate-100 rounded-2xl space-y-3">
                                        <div className="flex justify-between items-center pb-2 border-b border-slate-200/50">
                                            <span className="text-xs font-black text-slate-400 uppercase tracking-wider">{t('detail.label_booking_code', 'Mã đơn đặt')}</span>
                                            {payment.bookingId ? (
                                                <Link
                                                    to={ROUTES.BOOKINGS_DETAIL.replace(':id', String(payment.bookingId))}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-white bg-[#14b8a6] hover:bg-[#0f766e] rounded-lg shadow-xs transition-colors"
                                                >
                                                    <span>{payment.bookingCode}</span>
                                                    <Eye size={12} />
                                                </Link>
                                            ) : (
                                                <span className="text-slate-900 font-bold">{payment.bookingCode || 'N/A'}</span>
                                            )}
                                        </div>

                                        <div className="flex gap-3">
                                            {payment.tourThumbnail && (
                                                <div className="w-14 h-14 rounded-xl border border-slate-200 overflow-hidden shrink-0 shadow-xs">
                                                    <img src={payment.tourThumbnail} alt={payment.tourName} className="w-full h-full object-cover" />
                                                </div>
                                            )}
                                            <div className="min-w-0">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{t('detail.tour_name', 'Tên Tour')}</span>
                                                <span className="text-slate-900 text-xs font-bold leading-snug line-clamp-2 mt-0.5">{payment.tourName}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 flex gap-3 text-amber-800 shadow-xs hover:shadow-md transition-all duration-300">
                            <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={20} />
                            <div>
                                <h4 className="font-bold text-sm text-amber-900">
                                    {t('detail.orphan_warning', 'Giao dịch không đính kèm thông tin đơn hàng')}
                                </h4>
                                <p className="text-xs text-amber-700 mt-1 leading-relaxed font-medium">
                                    {t('detail.orphan_warning_desc', 'Giao dịch này được tạo trực tiếp từ cổng thanh toán hoặc không liên kết với bất kỳ đơn đặt tour nào trong hệ thống.')}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column (Status Timeline) */}
                <div className="space-y-8">
                    <VirtualTimeline
                        createdAt={payment.transactionDate}
                        paidAt={payment.paidAt}
                        refundedAt={payment.refundedAt}
                        refundReason={payment.refundReason}
                        status={payment.status}
                        gateway={payment.gateway}
                    />
                </div>
            </div>

            {/* Refund dialog */}
            <RefundPaymentDialog
                payment={payment}
                isOpen={isRefundDialogOpen}
                onClose={() => setIsRefundDialogOpen(false)}
                onSubmit={handleRefundSubmit}
                isSubmitting={refundMutation.isPending}
            />
        </div>
    );
};

export default PaymentDetail;
