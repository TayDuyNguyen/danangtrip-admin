import { ArrowLeft, Edit2, Ban, LockOpen, ShieldAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { ROUTES } from '@/routes/routes';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import { Users } from 'lucide-react';
import type { UserItem } from '@/dataHelper';

interface UserDetailHeaderProps {
    user: UserItem;
    isSelf: boolean;
    onLockToggle: () => void;
    onRoleChange: () => void;
}

export const UserDetailHeader = ({
    user,
    isSelf,
    onLockToggle,
    onRoleChange,
}: UserDetailHeaderProps) => {
    const { t } = useTranslation('user');
    const navigate = useNavigate();

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
        <div className="flex flex-col gap-3">
            {/* Breadcrumbs */}
            <Breadcrumbs
                icon={Users}
                items={[
                    { label: t('detail.breadcrumb_users', 'Người dùng'), path: ROUTES.USERS_LIST },
                    { label: user.fullName },
                ]}
            />

            {/* ─── Gradient border shell header card ─── */}
            <div className="p-[1px] rounded-3xl bg-gradient-to-br from-[#14b8a6]/30 via-slate-200/20 to-transparent shadow-sm hover:shadow-md transition-all duration-300">
                <div className="bg-white/98 backdrop-blur-sm rounded-[23px] px-6 py-5">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                            {/* Back button — teal accent */}
                            <button
                                onClick={() => navigate(ROUTES.USERS_LIST)}
                                className="p-2.5 bg-[#14b8a6]/8 border border-[#14b8a6]/20 hover:bg-[#14b8a6]/15 text-[#14b8a6] rounded-2xl transition-all duration-200 cursor-pointer shrink-0"
                                title={t('detail.back_to_list', 'Quay lại')}
                            >
                                <ArrowLeft size={20} />
                            </button>

                            <div>
                                <div className="flex flex-wrap items-center gap-3">
                                    <h1 className="text-[26px] font-black text-[#0F172A] tracking-tight leading-tight flex items-center gap-2">
                                        {user.fullName}
                                        {isSelf && (
                                            <span className="text-[10px] bg-[#14b8a6]/10 text-[#14b8a6] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                                {t("table.you_badge")}
                                            </span>
                                        )}
                                    </h1>
                                    <div className="flex items-center gap-1.5">
                                        {/* Role Badge */}
                                        <button
                                            disabled={isSelf}
                                            onClick={onRoleChange}
                                            className={`
                                                inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-extrabold rounded-full border backdrop-blur-xs transition-all duration-200 uppercase
                                                ${roleBadgeColors[user.role] || roleBadgeColors.user}
                                                ${isSelf ? '' : 'cursor-pointer hover:scale-105 active:scale-95'}
                                            `}
                                            title={isSelf ? '' : t('actions.change_role')}
                                        >
                                            {user.role === 'admin' && <ShieldAlert size={10} />}
                                            {t(`roles.${user.role}`)}
                                        </button>

                                        {/* Status Badge */}
                                        <button
                                            disabled={isSelf}
                                            onClick={onLockToggle}
                                            className={`
                                                inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-extrabold rounded-full border backdrop-blur-xs transition-all duration-200 uppercase
                                                ${statusBadgeColors[user.status] || statusBadgeColors.active}
                                                ${isSelf ? '' : 'cursor-pointer hover:scale-105 active:scale-95'}
                                            `}
                                            title={isSelf ? '' : user.status === 'active' ? t('actions.block') : t('actions.unblock')}
                                        >
                                            <span className={`w-1.5 h-1.5 rounded-full ${
                                                user.status === 'active' ? 'bg-emerald-500'
                                                : user.status === 'pending' ? 'bg-amber-400'
                                                : 'bg-rose-500'
                                            }`}></span>
                                            {t(`status.${user.status}`)}
                                        </button>
                                    </div>
                                </div>
                                <p className="text-[#94A3B8] text-xs mt-1.5 font-semibold">
                                    {user.username} &middot; {t('detail.joined', 'Tham gia')} {user.joinedDate}
                                </p>
                            </div>
                        </div>

                        {/* Actions Right */}
                        <div className="flex items-center gap-3">
                            <Link
                                to={ROUTES.USERS_EDIT.replace(':id', String(user.id))}
                                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-all duration-200 cursor-pointer"
                            >
                                <Edit2 size={13} />
                                <span>{t('actions.edit', 'Chỉnh sửa')}</span>
                            </Link>

                            {user.status === 'active' ? (
                                <button
                                    disabled={isSelf}
                                    onClick={onLockToggle}
                                    className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold bg-white border border-rose-200 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    <Ban size={13} />
                                    <span>{t('actions.block', 'Khóa tài khoản')}</span>
                                </button>
                            ) : (
                                <button
                                    disabled={isSelf}
                                    onClick={onLockToggle}
                                    className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    <LockOpen size={13} />
                                    <span>{t('actions.unblock', 'Mở khóa')}</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
