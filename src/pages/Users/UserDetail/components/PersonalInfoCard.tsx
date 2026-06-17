import { User, CheckCircle, XCircle } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { UserItem } from '@/dataHelper';

interface PersonalInfoCardProps {
    user: UserItem;
}

export const PersonalInfoCard = ({ user }: PersonalInfoCardProps) => {
    const { t } = useTranslation('user');
    const [avatarFailed, setAvatarFailed] = useState(false);

    const formatShortDateWithTime = (dateStr: string) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getGenderLabel = (gender: string | undefined) => {
        if (!gender) return '—';
        const labels: Record<string, string> = {
            male: t('detail.gender_male', 'Nam'),
            female: t('detail.gender_female', 'Nữ'),
            other: t('detail.gender_other', 'Khác'),
        };
        return labels[gender.toLowerCase()] || gender;
    };

    const getBirthdateLabel = (birthdate: string | undefined) => {
        if (!birthdate) return '—';
        return new Date(birthdate).toLocaleDateString('vi-VN');
    };

    return (
        // ─── Gradient border shell ───
        <div className="p-[1px] rounded-3xl bg-gradient-to-br from-[#14b8a6]/20 via-slate-200/25 to-slate-100/10 shadow-sm hover:shadow-lg hover:from-[#14b8a6]/30 transition-all duration-300">
            <div className="bg-white rounded-[23px] p-6 lg:p-8">
                <h3 className="text-[16px] font-black text-[#0F172A] mb-6 flex items-center gap-2">
                    {/* Teal section icon — DESIGN.md primary accent */}
                    <span className="p-1.5 bg-[#14b8a6]/10 text-[#14b8a6] rounded-lg">
                        <User size={18} />
                    </span>
                    {t('detail.section_personal_info', 'Thông tin cá nhân')}
                </h3>

                <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                    {/* Left - Avatar Block */}
                    <div className="flex flex-col items-center gap-3 shrink-0">
                        {/* Avatar with gradient border shell */}
                        <div className="p-[2px] rounded-full bg-gradient-to-br from-[#14b8a6]/60 via-[#0d9488]/40 to-transparent">
                            <div className="w-24 h-24 rounded-full border-2 border-white flex items-center justify-center font-bold text-3xl bg-gradient-to-br from-[#14b8a6] to-[#0f766e] text-white overflow-hidden select-none">
                                {user.avatar && !avatarFailed ? (
                                    <img
                                        src={user.avatar}
                                        alt={user.fullName}
                                        className="w-full h-full object-cover"
                                        onError={() => setAvatarFailed(true)}
                                    />
                                ) : (
                                    <span>{user.fullName.charAt(0).toUpperCase()}</span>
                                )}
                            </div>
                        </div>
                        <span className="text-[10px] bg-[#14b8a6]/10 text-[#14b8a6] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-[#14b8a6]/20">
                            {t(`roles.${user.role}`)}
                        </span>
                    </div>

                    {/* Right - Attributes Grid */}
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm w-full">
                        {/* Full Name */}
                        <div className="flex flex-col gap-1 border-b border-[#F1F5F9] pb-3">
                            <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">
                                {t('detail.label_full_name', 'HỌ VÀ TÊN')}
                            </span>
                            <span className="text-[#0F172A] font-bold break-words">{user.fullName}</span>
                        </div>

                        {/* Username */}
                        <div className="flex flex-col gap-1 border-b border-[#F1F5F9] pb-3">
                            <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">
                                {t('detail.label_username', 'USERNAME')}
                            </span>
                            <span className="text-[#0F172A] font-mono font-bold text-xs break-all">{user.username}</span>
                        </div>

                        {/* Email */}
                        <div className="flex flex-col gap-1 border-b border-[#F1F5F9] pb-3">
                            <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">
                                {t('detail.label_email', 'EMAIL')}
                            </span>
                            <a href={`mailto:${user.email}`} className="text-[#14b8a6] hover:underline font-bold transition-all break-all">
                                {user.email}
                            </a>
                        </div>

                        {/* Phone */}
                        <div className="flex flex-col gap-1 border-b border-[#F1F5F9] pb-3">
                            <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">
                                {t('detail.label_phone', 'SỐ ĐIỆN THOẠI')}
                            </span>
                            <span className="text-[#0F172A] font-bold break-words">{user.phone || '—'}</span>
                        </div>

                        {/* Birthdate */}
                        <div className="flex flex-col gap-1 border-b border-[#F1F5F9] pb-3">
                            <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">
                                {t('detail.label_birthdate', 'NGÀY SINH')}
                            </span>
                            <span className="text-[#0F172A] font-bold">{getBirthdateLabel(user.birthdate)}</span>
                        </div>

                        {/* Gender */}
                        <div className="flex flex-col gap-1 border-b border-[#F1F5F9] pb-3">
                            <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">
                                {t('detail.label_gender', 'GIỚI TÍNH')}
                            </span>
                            <span className="text-[#0F172A] font-bold">{getGenderLabel(user.gender)}</span>
                        </div>

                        {/* City */}
                        <div className="flex flex-col gap-1 border-b border-[#F1F5F9] pb-3">
                            <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">
                                {t('detail.label_city', 'THÀNH PHỐ')}
                            </span>
                            <span className="text-[#0F172A] font-bold break-words">{user.city || '—'}</span>
                        </div>

                        {/* Email Verification */}
                        <div className="flex flex-col gap-1 border-b border-[#F1F5F9] pb-3">
                            <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">
                                {t('detail.label_email_verification', 'XÁC THỰC EMAIL')}
                            </span>
                            <div className="mt-0.5">
                                {user.isEmailVerified ? (
                                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-emerald-50 border border-emerald-100 text-emerald-600">
                                        <CheckCircle size={10} />
                                        {t('detail.verification_verified', 'Đã xác thực')}
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-amber-50 border border-amber-100 text-amber-600">
                                        <XCircle size={10} />
                                        {t('detail.verification_unverified', 'Chưa xác thực')}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Created At */}
                        <div className="flex flex-col gap-1 border-b border-[#F1F5F9] pb-3">
                            <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">
                                {t('detail.label_created_at', 'NGÀY THAM GIA')}
                            </span>
                            <span className="text-[#94A3B8] font-bold text-xs">{formatShortDateWithTime(user.createdAt)}</span>
                        </div>

                        {/* Updated At */}
                        <div className="flex flex-col gap-1 border-b border-[#F1F5F9] pb-3">
                            <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">
                                {t('detail.label_updated_at', 'CẬP NHẬT')}
                            </span>
                            <span className="text-[#94A3B8] font-bold text-xs">{formatShortDateWithTime(user.updatedAt)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
