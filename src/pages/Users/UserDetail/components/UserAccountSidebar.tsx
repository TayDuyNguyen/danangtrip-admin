import { Shield, ShieldAlert, CheckCircle, Calendar, LogIn } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { UserItem } from '@/dataHelper';

interface UserAccountSidebarProps {
    user: UserItem;
}

export const UserAccountSidebar = ({ user }: UserAccountSidebarProps) => {
    const { t } = useTranslation('user');

    const formatShortDateWithTime = (dateStr: string | undefined) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatShortDate = (dateStr: string | undefined) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('vi-VN');
    };

    const roleBadgeColors: Record<string, string> = {
        admin: "bg-indigo-50 border-indigo-200/50 text-indigo-700",
        user: "bg-slate-50 border-slate-200/50 text-slate-600",
    };

    const statusBadgeColors: Record<string, string> = {
        active: "bg-emerald-50 border-emerald-200/50 text-emerald-700",
        banned: "bg-rose-50 border-rose-200/50 text-rose-700",
        pending: "bg-amber-50 border-amber-200/50 text-amber-700",
    };

    return (
        // ─── Gradient border shell ───
        <div className="p-[1px] rounded-3xl bg-gradient-to-br from-[#14b8a6]/20 via-slate-200/25 to-slate-100/10 shadow-xs hover:shadow-md hover:from-[#14b8a6]/30 transition-all duration-300">
            <div className="bg-white rounded-[23px] p-6">
                <h3 className="text-[16px] font-black text-[#0F172A] mb-6 flex items-center gap-2">
                    <span className="p-1.5 bg-[#14b8a6]/10 text-[#14b8a6] rounded-lg">
                        <Shield size={18} />
                    </span>
                    {t('detail.section_account', 'Tài khoản')}
                </h3>

                <div className="space-y-4 text-xs font-semibold font-sans">
                    {/* Role Row */}
                    <div className="flex items-center justify-between py-2.5 border-b border-[#F1F5F9]">
                        <span className="text-[#94A3B8] font-bold flex items-center gap-1.5">
                            <ShieldAlert size={14} className="text-[#94A3B8] shrink-0" />
                            {t('detail.label_role', 'Vai trò')}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[9px] font-black rounded-full border uppercase tracking-wider ${roleBadgeColors[user.role]}`}>
                            {t(`roles.${user.role}`)}
                        </span>
                    </div>

                    {/* Status Row */}
                    <div className="flex items-center justify-between py-2.5 border-b border-[#F1F5F9]">
                        <span className="text-[#94A3B8] font-bold flex items-center gap-1.5">
                            <Shield size={14} className="text-[#94A3B8] shrink-0" />
                            {t('detail.label_status', 'Trạng thái')}
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 text-[9px] font-black rounded-full border uppercase tracking-wider ${statusBadgeColors[user.status]}`}>
                            {t(`status.${user.status}`)}
                        </span>
                    </div>

                    {/* Verification Row */}
                    <div className="flex items-center justify-between py-2.5 border-b border-[#F1F5F9]">
                        <span className="text-[#94A3B8] font-bold flex items-center gap-1.5">
                            <CheckCircle size={14} className="text-[#94A3B8] shrink-0" />
                            {t('detail.label_email_verification_status', 'Xác thực email')}
                        </span>
                        <div>
                            {user.isEmailVerified ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black uppercase bg-emerald-50 border border-emerald-100 text-emerald-600">
                                    {t('detail.verification_verified', 'Đã xác thực')}
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black uppercase bg-amber-50 border border-amber-100 text-amber-600">
                                    {t('detail.verification_unverified', 'Chưa xác thực')}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Join Date Row */}
                    <div className="flex items-center justify-between py-2.5 border-b border-[#F1F5F9]">
                        <span className="text-[#94A3B8] font-bold flex items-center gap-1.5">
                            <Calendar size={14} className="text-[#94A3B8] shrink-0" />
                            {t('detail.label_join_date', 'Ngày tham gia')}
                        </span>
                        <span className="text-[#0F172A] font-extrabold text-right">
                            {formatShortDate(user.createdAt)}
                        </span>
                    </div>

                    {/* Last Login Row */}
                    <div className="flex items-center justify-between py-2.5">
                        <span className="text-[#94A3B8] font-bold flex items-center gap-1.5">
                            <LogIn size={14} className="text-[#94A3B8] shrink-0" />
                            {t('detail.label_last_login', 'Đăng nhập cuối')}
                        </span>
                        <span className="text-[#0F172A] font-extrabold text-right truncate max-w-[150px]">
                            {formatShortDateWithTime(user.lastLoginAt)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
